import { Reflexion } from './Reflexion.js'
import { NullEvaluation, IdentifiersEvaluation } from './Evalution.js'
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
      const accessEntropy = dividend.computed
        ? new Entropy(dividend.property, divisor)
        : new ObjectAccessEntropy(dividend.property, divisor)

      return new Entropies([
        new Entropy(dividend.object, divisor),
        accessEntropy
      ])
    }

    if (dividendType === 'ObjectExpression') {
      return new LiteralObjectEntropy(dividend, divisor)
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
      'FunctionDeclaration',
      'ArrowFunctionExpression',
    ]
    if (declarationTypes.includes(dividendType)) {
      return new DeclarationEntropy(dividend, divisor)
    }

    const classMemberTypes = [
      'MethodDefinition',
      'PropertyDefinition',
    ]
    if (classMemberTypes.includes(dividendType)) {
      return new ClassMemberEntropy(dividend, divisor)
    }

    if (dividendType === 'ClassDeclaration') {
      return new ClassEntropy(dividend, divisor)
    }

    const bodyTypes = [
      'BlockStatement',
      'ClassBody',
      'FunctionExpression'
    ]
    if (bodyTypes.includes(dividendType)) {
      return new BodyEntropy(dividend.body, divisor)
    }

    const expressionTypes = [
      'CallExpression',
      'Identifier',
      'ImportNamespaceSpecifier',
      'ImportSpecifier',
      'Literal',
      'ThisExpression',
      'UpdateExpression',

      // TODO: Continue ignoring these?
      'BreakStatement',
      'ContinueStatement',
    ]
    if (expressionTypes.includes(dividendType)) {
      return new ExpressionEntropy(dividend, divisor)
    }

    if (dividendType === 'ArrayExpression') {
      return new BodyEntropy(dividend.elements, divisor)
    }

    if (dividendType === 'ExpressionStatement') {
      return new Entropy(dividend.expression, divisor)
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

    const loopTypes = [
      'WhileStatement',
      'DoWhileStatement',
    ]
    if (loopTypes.includes(dividendType)) {
      return new BodyEntropy([dividend.test, dividend.body], divisor)
    }

    const structuredLoopTypes = [
      'ForInStatement',
      'ForOfStatement',
    ]
    if (structuredLoopTypes.includes(dividendType)) {
      return new BodyEntropy([dividend.left, dividend.right, dividend.body], divisor)
    }

    if (dividendType === 'SequenceExpression') {
      return new BodyEntropy(dividend.expressions, divisor)
    }

    if (dividendType === 'AssignmentExpression' || dividendType === 'BinaryExpression') {
      // TODO: Why ignored dividend.operator?
      // TODO: Why ignoring depth? `a + 2` vs `a + (a * 2)`
      return new BodyEntropy([dividend.left, dividend.right], divisor)
    }

    const argumentBasedTypes = [
      'SpreadElement',
      'UnaryExpression',
      'ReturnStatement',
    ]
    if (argumentBasedTypes.includes(dividendType)) {
      return dividend.argument
        ? new Entropy(dividend.argument, divisor)
        : new BodyEntropy([], divisor)
    }

    if (dividendType === 'SwitchStatement') {
      return new BodyEntropy([dividend.discriminant, ...dividend.cases], divisor)
    }

    if (dividendType === 'SwitchCase') {
      return new BodyEntropy([
        ...dividend.test ? [dividend.test] : [],
        ...dividend.consequent
      ], divisor)
    }

    if (dividendType === 'LogicalExpression') {
      return new BodyEntropy([dividend.left, dividend.right], divisor)
    }

    if (dividendType === 'ExportNamedDeclaration' && !dividend.source) {
      const elements = [
        ...(dividend.declaration ? [dividend.declaration] : []),
        ...dividend.specifiers
      ]
      return new BodyEntropy(elements, divisor)
    }

    if (dividendType === 'ExportDefaultDeclaration') {
      return new Entropy(dividend.declaration, divisor)
    }

    if (dividendType === 'ExportSpecifier') {
      return new Entropy(dividend.local, divisor)
    }

    // TODO: Avoid duplication (ExportNamedDeclaration is handled twice)
    if (dividendType === 'ExportAllDeclaration' || dividendType === 'ExportNamedDeclaration') {
      // TODO: Handle this export (currently, exports are ignored)
      return new BodyEntropy([], divisor)
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
    const newDivisor = Divisor.clone(this.divisor)
    const entropies = this.dividend
      .sources
      .map(eachSource => new Entropy(eachSource, newDivisor))
    return new Entropies(entropies).evaluate()
  }
}

class DependencyEntropy extends SingleEntropy  {
  // TODO: improve this
  evaluate() {
    const dividend = this.dividend.sources[0]

    if (this.divisor.shouldCheckAdjacentModules()) {
      const importParts = new Reflexion(dividend).api()
      const importSpecifiers = importParts[0]
      const importSource = importParts[1]

      return new Entropy(importSpecifiers, new Divisor(this.divisor.importedModulesNames())).evaluate()
        .plus(new Entropy(importSource, new Divisor(this.divisor.adjacentModules())).evaluate())
    }

    const isWildcardImport = (dividend.type === 'ImportDeclaration')
      && (dividend.specifiers[0].type === 'ImportNamespaceSpecifier')

    this.divisor.extend(this.dividend.identifiers())

    if (isWildcardImport || this.divisor.shouldFocusOnCurrentModule()) {
      const nextDivisor = new Divisor(this.divisor.identifiers())
      return new ExpressionEntropy(this.dividend, nextDivisor).evaluate()
    }

    throw ('DepencyEntropy#evaluate does not handle this case yet')
  }
}

class ExpressionEntropy extends SingleEntropy  {
  // TODO: Simplify this
  evaluate() {
    const dividend = this.dividend.sources[0]

    const isMethodInvocation = dividend?.callee?.type === 'MemberExpression'
    const isMemberAccess = dividend?.left?.type === 'MemberExpression'

    if (isMethodInvocation) {
      return new Entropies([
        new Entropy(dividend.callee.object, this.divisor),
        new ObjectAccessEntropy(dividend.callee.property, this.divisor),
        new BodyEntropy(dividend.arguments, this.divisor)
      ]).evaluate()
    }

    if (isMemberAccess) {
      return new Entropies([
        new Entropy(dividend.left.object, this.divisor),
        new ObjectAccessEntropy(dividend.left.property, this.divisor),
        new Entropy(dividend.right, this.divisor)
      ]).evaluate()
    }

    const isBitShiftingOperation = ['++', '--'].includes(dividend.operator)

    // TODO: Remove this check
    const isImport = dividend.type.includes('mport')
    const literalsWeight = !isImport && (this.dividend.literals().length || isBitShiftingOperation) ? [1] : []
    const thisExpression = dividend.type === 'ThisExpression' ? ['this'] : []
    const possibles = [...this.divisor.identifiers(), ...literalsWeight]
    const actuals = [...this.dividend.identifiers(), ...literalsWeight, ...thisExpression]

    return new IdentifiersEvaluation(actuals, possibles, dividend)
  }
}

// TODO: Search other-similar occurences and abstract
class ObjectAccessEntropy extends ExpressionEntropy {
  // TODO: Simplify this
  evaluate() {
    // TODO: Is this true?
    this.divisor.extendAccesses(this.dividend.identifiers())
    const nextDivisor = Divisor.fromAccesses(this.divisor)
    return new Entropy(this.dividend, nextDivisor).evaluate()
  }
}

// TODO: Merge with DeclarationEntropy
class LiteralObjectEntropy extends ExpressionEntropy {
  // TODO: Simplify this
  evaluate() {
    const declarations = this.dividend.sources
    const declaration = declarations[0]

    this.divisor.extendAccesses(this.dividend.properties())

    return new Entropies(
      declaration
        .properties
        .map(eachSource => new Entropy(eachSource.value, this.divisor))
    ).evaluate()
  }
}

// TODO: Extract into a composition of classes
class DeclarationEntropy extends SingleEntropy  {

  // TODO: simplify this
  evaluate() {
    const declarations = this.dividend.sources
    const declaration = declarations[0]

    const isVariable = declarations.length === 1 && declaration.type === 'VariableDeclarator'
    declarations
      .filter(eachDeclaration => eachDeclaration.id)
      .forEach(eachDeclaration => this.divisor.extend([eachDeclaration.id.name]))

    const functionsTypes = [
      'ArrowFunctionExpression',
      'FunctionDeclaration'
    ]
    if (functionsTypes.includes(declaration.type)) {
      const paramsAsIdentifiers = new Reflexion(declaration.params || []).identifiers()
      const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
      return new BodyEntropy(declaration.body, declarationDivisor).evaluate()
    }

    if (isVariable && !declaration.init) {
      return new NullEvaluation()
    }

    if (isVariable) {
      const value = declaration.init
      const paramsAsIdentifiers = new Reflexion(value.params || []).identifiers()
      const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
      return new Entropy(value, declarationDivisor).evaluate()
    }

    declarations
      .filter(eachDeclaration => eachDeclaration.type === 'FunctionDeclaration')
      .forEach((eachDeclaration, i) => declarations[i] = eachDeclaration.body)

    const declarationsEvaluation = new BodyEntropy(declarations, this.divisor).evaluate()

    // class A extends B
    if (declaration.type === 'ClassDeclaration' && declaration.superClass) {
      this.divisor.extend([declaration.superClass.name])
      return new IdentifiersEvaluation([declaration.id.name], this.divisor.identifiers()).plus(declarationsEvaluation)
    }

    return declarationsEvaluation
  }
}

class ClassEntropy extends SingleEntropy {
  static IGNORED_IDENTIFIERS = ['constructor']

  // TODO: simplify this
  evaluate() {
    const superClasses = this.dividend.sources
      .filter(eachDeclaration => ['ClassDeclaration'].includes(eachDeclaration.type))
      .filter(eachDeclaration => eachDeclaration.superClass)
      .map(eachDeclaration => eachDeclaration.superClass.name)

    this.divisor.extend(superClasses)

    const superClassEvaluation = new IdentifiersEvaluation(superClasses, this.divisor.identifiers())

    const declarations = this.dividend.sources
    const bodyAsDividends = declarations.map(eachDeclaration => eachDeclaration.body)
    declarations.forEach(eachDeclaration => this.divisor.extend([eachDeclaration.id.name]))

    const members = bodyAsDividends[0].body
      .filter(eachDeclaration => ['MethodDefinition', 'PropertyDefinition'].includes(eachDeclaration.type))
      .filter(eachDeclaration => !ClassEntropy.IGNORED_IDENTIFIERS.includes(eachDeclaration.key.name))
      .map(eachDeclaration => eachDeclaration.key.name)

    this.divisor.extendAccesses(members)

    const mainEntropy = new BodyEntropy(bodyAsDividends, this.divisor).evaluate()

    // TODO: Generalize this to one `return`
    if (superClasses.length) {
      return mainEntropy.plus(superClassEvaluation)
    }
    return mainEntropy
  }
}

class ClassMemberEntropy extends DeclarationEntropy {
  evaluate() {
    const declarations = this.dividend.sources
    const declaration = declarations[0]

    const paramsAsIdentifiers = new Reflexion(declaration.value.params || []).identifiers()
    const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
    return new Entropy(declaration.value, declarationDivisor).evaluate()
  }
}
