import { Reflexion, DependenciesReflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

class Entropy {
  constructor(dividend, divisor) {
    this.dividend = new Reflexion(dividend)
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  }
}

class SumEntropies {
  constructor(entropies, divisor) {
    this.entropies = entropies
    this.divisor = divisor
  }

  evaluate() {
    return this.entropies.reduce(
      (sumEvalution, eachEntropy) => {
        eachEntropy.delegate?.divisor.extend(this.divisor.identifiers())
        return sumEvalution.plus(eachEntropy.evaluate())
      },
      new NullEvaluation()
    )
  }
}

export class BodyEntropy extends Entropy {
  evaluate() {
    const entropies =
      this.dividend.sources
        .map(eachSource => new SingleEntropy(eachSource, this.divisor))

    return new SumEntropies(entropies, this.divisor).evaluate()
  }
}

export class SingleEntropy {
  constructor(dividend, divisor) {
    this.delegate = this.createDelegate(new Reflexion(dividend), divisor)
  }

  evaluate() {
    return this.delegate.evaluate()
  }

  createDelegate(_dividend, divisor) {
    const dividend = _dividend?.sources?.[0]
    const dividendType = dividend?.type

    if (dividendType === 'ImportDeclaration') {
      return new DependencyEntropy(dividend, divisor)
    }

    if (dividendType === 'VariableDeclaration') {
      // TODO: why are we ignoring "const"/"let"/"var"/...?
      return new DeclarationEntropy(dividend.declarations, divisor)
    }

    const callee = dividend?.expression?.callee
    if (callee?.type === 'MemberExpression') {
      return new SumEntropies(
        [
          new SingleEntropy(callee.object, divisor),
          new SingleEntropy(callee.property, divisor.unfold(callee.object.name)),
          new BodyEntropy(dividend?.expression?.arguments, divisor)
        ],
        new Divisor()
      )
    }

    if (dividendType === 'MemberExpression') {
      return new SumEntropies(
        [
          new SingleEntropy(dividend.object, divisor),
          new AccessEntropy(dividend.property, divisor)
        ],
        new Divisor()
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
      return new SumEntropies(
        [
          new SingleEntropy(dividend.test, divisor),
          new BodyEntropy(dividend.consequent, divisor),
          ...dividend.alternate ? [new BodyEntropy(dividend.alternate, divisor)] : []
        ],
        new Divisor()
      )
    }

    if (dividendType === 'ObjectExpression') {
      return new ObjectEntropy(dividend, divisor)
    }

    throw new Error(`Cannot create Delegate for dividend: ${JSON.stringify(dividend)}`)
  }
}

class DependencyEntropy extends Entropy {
  // TODO: improve this
  // TODO: Remove Divisor creation
  evaluate() {
    if (this.divisor.shouldCheckAdjacentModules()) {
      // TODO: fix next line
      const importParts = new DependenciesReflexion(this.dividend.sources[0]).__factorize()
      const importSpecifiers = importParts[0]
      const importSource = importParts[1]

      return new SingleEntropy(importSpecifiers, new Divisor(this.divisor.importedModulesNames())).evaluate()
        .plus(new SingleEntropy(importSource, new Divisor(this.divisor.adjacentModules())).evaluate())
    }

    const isWildcardImport = (this.dividend.sources?.[0]?.type === 'ImportDeclaration')
      && (this.dividend.sources?.[0]?.specifiers?.[0]?.type === 'ImportNamespaceSpecifier')

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

class ExpressionEntropy extends Entropy {
  evaluate() {
    // TODO: Remove this check
    const isImport = this.dividend.sources[0].type.includes('mport')
    const literalsWeight = !isImport && this.dividend.literals().length ? 1 : 0
    const allPossibilitiesCount = this.divisor.identifiers().length + literalsWeight
    const actualCount = this.dividend.identifiers().length + literalsWeight

    return new Evaluation(actualCount, allPossibilitiesCount, this.dividend.sources[0])
  }
}

class AccessEntropy extends Entropy {
  evaluate() {
    const nextDivisor = Divisor.fromAccesses(this.divisor)
    return new SingleEntropy(this.dividend, nextDivisor).evaluate()
  }
}

class ObjectEntropy extends ExpressionEntropy {
  evaluate() {
    this.divisor.extendAccesses(this.dividend.identifiers())
    return super.evaluate()
  }
}

class DeclarationEntropy extends Entropy {
  evaluate() {
    const declaration = this.dividend.sources[0]

    this.divisor.extend([declaration.id.name])

    const paramsAsIdentifiers = new Reflexion(declaration.init.params || []).identifiers()
    const declarationDivisor = Divisor.withNewIdentifiers(this.divisor, paramsAsIdentifiers)
    const delegateEntropy = new SingleEntropy(declaration.init, declarationDivisor)
    return delegateEntropy.evaluate()
  }
}
