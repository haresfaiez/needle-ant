import { Reflexion } from './Reflexion.js'
import { Evaluation, NullEvaluation } from './Evalution.js'
import { Divisor } from './Divisor.js'

export class Entropy {
  constructor(dividend, divisor = new Divisor([])) {
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

    if (dividendType === 'MemberExpression') {
      return new Entropies([
        new Entropy(dividend.object, divisor),
        new ObjectAccessEntropy(dividend.property, divisor)
      ])
    }

    if (dividendType === 'ObjectExpression') {
      return new ObjectAccessEntropy(dividend, divisor)
    }

    if (dividendType === 'NewExpression') {
      return new Entropies([
        new Entropy(dividend.callee, divisor),
        ...(dividend.arguments.length ? [new Entropy(dividend.arguments, divisor)] : [])
      ])
    }

    if (dividendType === 'VariableDeclaration') {
      // TODO: why are we ignoring "const"/"let"/"var"/...
      return new DeclarationEntropy(dividend.declarations, divisor)
    }

    const declarationTypes = [
      'ClassDeclaration',
      'MethodDefinition',
      'FunctionDeclaration',
      'PropertyDefinition',
    ]
    if (declarationTypes.includes(dividendType)) {
      return new DeclarationEntropy(dividend, divisor)
    }

    const bodyTypes = [
      'BlockStatement',
      'ArrowFunctionExpression',
      'ClassBody',
      'FunctionExpression'
    ]
    if (bodyTypes.includes(dividendType)) {
      return new BodyEntropy(dividend.body, divisor)
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
    if (expressionTypes.includes(dividendType)) {
      return new ExpressionEntropy(dividend, divisor)
    }

    if (dividendType === 'IfStatement') {
      return new Entropies([
        new Entropy(dividend.test, divisor),
        new BodyEntropy(dividend.consequent, divisor),
        ...dividend.alternate ? [new BodyEntropy(dividend.alternate, divisor)] : []
      ])
    }

    throw new Error(`Cannot create Delegate for dividend: ${JSON.stringify(dividend)}`)
  }
}

class Entropies {
  constructor(entropies) {
    this.entropies = entropies
  }

  evaluate() {
    return this.entropies.reduce(
      (sumEvalution, eachEntropy) => sumEvalution.plus(eachEntropy.evaluate()),
      new NullEvaluation()
    )
  }
}

class SingleEntropy {
  constructor(dividend, divisor = new Divisor([])) {
    this.dividend = new Reflexion(dividend)
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  }
}

export class BodyEntropy extends SingleEntropy  {
  evaluate() {
    this.dividend.sources
      .filter(eachDeclaration => ['MethodDefinition', 'PropertyDefinition'].includes(eachDeclaration.type))
      .forEach(eachDeclaration => this.divisor.extend([eachDeclaration.key.name]))

    const entropies = this.dividend.sources.map(eachSource => new Entropy(eachSource, this.divisor))
    return new Entropies(entropies).evaluate()
  }
}

class DependencyEntropy extends SingleEntropy  {
  // TODO: improve this
  evaluate() {
    if (this.divisor.shouldCheckAdjacentModules()) {
      const importParts = new Reflexion(this.dividend.sources[0]).api()
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
  // TODO: Simplify this
  evaluate() {
    const dividend = this.dividend.sources[0]

    if (dividend.expression?.callee?.type === 'MemberExpression') {
      return new Entropies([
        new Entropy(dividend.expression.callee.object, this.divisor),
        new ObjectAccessEntropy(dividend.expression.callee.property, this.divisor),
        new BodyEntropy(dividend.expression.arguments, this.divisor)
      ]).evaluate()
    }

    // TODO: Remove this check
    const isImport = dividend.type.includes('mport')
    const literalsWeight = !isImport && this.dividend.literals().length ? 1 : 0
    const allPossibilitiesCount = this.divisor.identifiers().length + literalsWeight
    const actualCount = this.dividend.identifiers().length + literalsWeight

    return new Evaluation(actualCount, allPossibilitiesCount, dividend)
  }
}

class ObjectAccessEntropy extends ExpressionEntropy {
  // TODO: Simplify this
  evaluate() {
    this.divisor.extendAccesses(this.dividend.identifiers())
    const nextDivisor = Divisor.fromAccesses(this.divisor)

    const dividendType = this.dividend.sources[0].type

    if (dividendType === 'Identifier') {
      return new Entropy(this.dividend, nextDivisor).evaluate()
    }

    nextDivisor.extend(this.divisor.identifiers())

    return new Entropies(
      this.dividend.sources[0]
        .properties
        .map(eachSource => new Entropy(eachSource.value, nextDivisor))
    ).evaluate()
  }
}

class DeclarationEntropy extends SingleEntropy  {
  evaluate() {
    const declarations = this.dividend.sources
    const methodDeclaration = declarations[0]

    if (['MethodDefinition', 'PropertyDefinition'].includes(methodDeclaration.type)) {
      const paramsAsIdentifiers = new Reflexion(methodDeclaration.value.params || []).identifiers()
      const declarationDivisor = Divisor.withNewIdentifiers(this.divisor, paramsAsIdentifiers)
      return new Entropy(methodDeclaration.value, declarationDivisor).evaluate()
    }

    // TODO: this.divisor.extend(this.dividend.declarators())
    declarations.forEach(eachDeclaration => this.divisor.extend([eachDeclaration.id.name]))

    const entropies = declarations.map(eachDeclaration => {
      const eachDeclarationType = eachDeclaration.type
      if (eachDeclarationType === 'VariableDeclarator') {
        const paramsAsIdentifiers = new Reflexion(eachDeclaration.init.params || []).identifiers()
        const declarationDivisor = Divisor.withNewIdentifiers(this.divisor, paramsAsIdentifiers)
        return new Entropy(eachDeclaration.init, declarationDivisor)
      }

      return new Entropy(eachDeclaration.body, this.divisor)
    })

    return new Entropies(entropies).evaluate()
  }
}
