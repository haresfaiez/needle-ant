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
      'ThisExpression',
      'UpdateExpression',
      'BreakStatement',
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

    if (dividendType === 'VariableDeclarator') {
      return new DeclarationEntropy(dividend, this.divisor)
    }

    if (dividendType === 'ForStatement') {
      return new BodyEntropy([dividend.init, dividend.test, dividend.update, dividend.body], divisor)
    }

    if (dividendType === 'SequenceExpression') {
      return new BodyEntropy(dividend.expressions, divisor)
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
  static IGNORED_IDENTIFIERS = ['constructor']

  evaluate() {
    this.dividend.sources
      .filter(eachDeclaration => ['MethodDefinition', 'PropertyDefinition'].includes(eachDeclaration.type))
      .filter(eachDeclaration => !BodyEntropy.IGNORED_IDENTIFIERS.includes(eachDeclaration.key.name))
      .forEach(eachDeclaration => this.divisor.extendAccesses([eachDeclaration.key.name]))

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
        this.divisor.identifiers(),
        this.divisor.identifiers(),
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

    const isMethodInvocation = dividend.expression?.callee?.type === 'MemberExpression'
    const isMemberAccess = dividend.expression?.left?.type === 'MemberExpression'

    if (isMethodInvocation) {
      return new Entropies([
        new Entropy(dividend.expression.callee.object, this.divisor),
        new ObjectAccessEntropy(dividend.expression.callee.property, this.divisor),
        new BodyEntropy(dividend.expression.arguments, this.divisor)
      ]).evaluate()
    }

    if (isMemberAccess) {
      return new Entropies([
        new Entropy(dividend.expression.left.object, this.divisor),
        new ObjectAccessEntropy(dividend.expression.left.property, this.divisor),
        new Entropy(dividend.expression.right, this.divisor)
      ]).evaluate()
    }

    // TODO: Add other bit-shifting operators
    const isBitShiftingOperation = dividend.expression && ['++', '--'].includes(dividend.expression.operator)

    // TODO: Remove this check
    const isImport = dividend.type.includes('mport')
    const literalsWeight = !isImport && (this.dividend.literals().length || isBitShiftingOperation) ? [1] : []
    const thisExpression = dividend.type === 'ThisExpression' ? ['this'] : []
    const possibles = [...this.divisor.identifiers(), ...literalsWeight]
    const actuals = [...this.dividend.identifiers(), ...literalsWeight, ...thisExpression]

    return new Evaluation(actuals, possibles, dividend)
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
    const declaration = declarations[0]

    const isInsideClass = ['MethodDefinition', 'PropertyDefinition'].includes(declaration.type)
    const isVariable = declarations.length === 1 && declaration.type === 'VariableDeclarator'

    // isInsideClass was already handeled by BodyEntropy
    !isInsideClass && declarations.forEach(eachDeclaration => this.divisor.extend([eachDeclaration.id.name]))

    if (isInsideClass || isVariable) {
      const value = isInsideClass ? declaration.value : isVariable ? declaration.init : null
      const paramsAsIdentifiers = new Reflexion(value.params || []).identifiers()
      const declarationDivisor = Divisor.withNewIdentifiers(this.divisor, paramsAsIdentifiers)
      return new Entropy(value, declarationDivisor).evaluate()
    }

    declarations.forEach((eachDeclaration, i) => {
      if (['ClassDeclaration', 'FunctionDeclaration'].includes(eachDeclaration.type)) {
        declarations[i] = eachDeclaration.body
      }
    })

    const declarationsEvaluation = new BodyEntropy(declarations, this.divisor).evaluate()

    // class A extends B
    if (declaration.type === 'ClassDeclaration' && declaration.superClass) {
      this.divisor.extend([declaration.superClass.name])
      return new Evaluation([declaration.id.name], this.divisor.identifiers()).plus(declarationsEvaluation)
    }

    return declarationsEvaluation
  }
}
