import { Reflexion, DependenciesReflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

export class Entropy {
  constructor(dividend, divisor) {
    this.divisor = divisor
    this.delegate = this.createDelegate(new Reflexion(dividend), divisor)
  }

  evaluate() {
    return this.delegate.evaluate()
  }

  createDelegate(_dividend, divisor) {
    const dividend = _dividend.sources[0]
    const dividendType = dividend.type

    if (dividendType === 'ImportDeclaration') {
      return new DependencyEntropy(dividend, divisor)
    }

    if (dividendType === 'VariableDeclaration') {
      // TODO: why are we ignoring "const"/"let"/"var"/...
      return new DeclarationEntropy(dividend.declarations, divisor)
    }

    const callee = dividend.expression?.callee
    if (callee?.type === 'MemberExpression') {
      return new Entropies(
        [
          new Entropy(callee.object, divisor),
          new AccessEntropy(callee.property, divisor),
          new BodyEntropy(dividend.expression.arguments, divisor)
        ],
        divisor
      )
    }

    if (dividendType === 'MemberExpression') {
      return new Entropies(
        [
          new Entropy(dividend.object, divisor),
          new AccessEntropy(dividend.property, divisor)
        ],
        divisor
      )
    }

    // TODO: generalize this to all functions
    if (dividendType === 'ArrowFunctionExpression') {
      return new BodyEntropy(dividend.body, divisor)
    }

    // TODO: generalize this to all functions
    if (dividendType === 'VariableDeclarator') {
      return new ExpressionEntropy(dividend, divisor)
    }

    const expressionTypes = [
      'BinaryExpression',
      'CallExpression',
      'ExpressionStatement',
      'Identifier',
      'ImportNamespaceSpecifier',
      'ImportSpecifier',
      'Literal',
      'ReturnStatement',
    ]
    // TODO: should we handle function definition as DeclarationEntropy
    // TODO: Test declaration with many inits
    if (expressionTypes.includes(dividendType)) {
      return new ExpressionEntropy(dividend, divisor)
    }

    if (dividendType === 'BlockStatement') {
      return new BodyEntropy(dividend.body, divisor)
    }

    if (dividendType === 'IfStatement') {
      return new Entropies(
        [
          new Entropy(dividend.test, divisor),
          new BodyEntropy(dividend.consequent, divisor),
          ...dividend.alternate ? [new BodyEntropy(dividend.alternate, divisor)] : []
        ],
        divisor
      )
    }

    if (dividendType === 'ObjectExpression') {
      return new ObjectEntropy(dividend, divisor)
    }

    throw new Error(`Cannot create Delegate for dividend: ${JSON.stringify(dividend)}`)
  }
}

class Entropies {
  constructor(entropies, divisor) {
    this.entropies = entropies
    this.divisor = divisor
  }

  evaluate() {
    return this.entropies.reduce(
      (sumEvalution, eachEntropy) => {
        eachEntropy.divisor.extend(this.divisor.identifiers())
        return sumEvalution.plus(eachEntropy.evaluate())
      },
      new NullEvaluation()
    )
  }
}

class SingleEntropy {
  constructor(dividend, divisor) {
    this.dividend = new Reflexion(dividend)
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  }
}

export class BodyEntropy extends SingleEntropy  {
  evaluate() {
    const entropies =
      this.dividend.sources
        .map(eachSource => new Entropy(eachSource, this.divisor))

    return new Entropies(entropies, this.divisor).evaluate()
  }
}

class DependencyEntropy extends SingleEntropy  {
  // TODO: improve this
  // TODO: Remove Divisor creation
  evaluate() {
    if (this.divisor.shouldCheckAdjacentModules()) {
      // TODO: fix next line
      const importParts = new DependenciesReflexion(this.dividend.sources[0]).__factorize()
      const importSpecifiers = importParts[0]
      const importSource = importParts[1]

      return new Entropy(importSpecifiers, new Divisor(this.divisor.importedModulesNames())).evaluate()
        .plus(new Entropy(importSource, new Divisor(this.divisor.adjacentModules())).evaluate())
    }

    const isWildcardImport = (this.dividend.sources[0].type === 'ImportDeclaration')
      && (this.dividend.sources[0].specifiers[0].type === 'ImportNamespaceSpecifier')

    if (isWildcardImport) {
      return new Evaluation(
        this.divisor.identifiers().length,
        this.divisor.identifiers().length,
        this.dividend.sources[0]
      )
    }

    if (this.divisor.shouldFocusOnCurrentModule()) {
      return new ExpressionEntropy(this.dividend, new Divisor(this.divisor.identifiers())).evaluate()
    }

    throw ('DepencyEntropy#evaluate does not handle this case yet')
  }
}

class ExpressionEntropy extends SingleEntropy  {
  evaluate() {
    // TODO: Remove this check
    const isImport = this.dividend.sources[0].type.includes('mport')
    const literalsWeight = !isImport && this.dividend.literals().length ? 1 : 0
    const allPossibilitiesCount = this.divisor.identifiers().length + literalsWeight
    const actualCount = this.dividend.identifiers().length + literalsWeight

    return new Evaluation(actualCount, allPossibilitiesCount, this.dividend.sources[0])
  }
}

class AccessEntropy extends SingleEntropy  {
  evaluate() {
    this.divisor.extendAccesses([this.dividend.sources[0].name])
    return new Entropy(this.dividend, Divisor.fromAccesses(this.divisor)).evaluate()
  }
}

class ObjectEntropy extends ExpressionEntropy {
  evaluate() {
    this.divisor.extendAccesses(this.dividend.identifiers())
    return super.evaluate()
  }
}

class DeclarationEntropy extends SingleEntropy  {
  evaluate() {
    const declaration = this.dividend.sources[0]

    this.divisor.extend([declaration.id.name])

    const paramsAsIdentifiers = new Reflexion(declaration.init.params || []).identifiers()
    const declarationDivisor = Divisor.withNewIdentifiers(this.divisor, paramsAsIdentifiers)
    const delegateEntropy = new Entropy(declaration.init, declarationDivisor)
    return delegateEntropy.evaluate()
  }
}
