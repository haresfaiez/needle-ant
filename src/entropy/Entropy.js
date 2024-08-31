import { BodyEntropy } from './BodyEntropy.js'
import { CallEntropy } from './CallEntropy.js'
import { DependencyEntropy } from './DependencyEntropy.js'
import { ObjectAccessEntropy } from './ObjectAccessEntropy.js'
import { Entropies } from './Entropies.js'
import { LiteralObjectEntropy } from './LiteralObjectEntropy.js'
import { DeclarationEntropy } from './DeclarationEntropy.js'
import { ClassMemberEntropy } from './ClassMemberEntropy.js'
import { ClassEntropy } from './ClassEntropy.js'
import { ExpressionEntropy } from './ExpressionEntropy.js'
import { CatchEntropy } from './CatchEntropy.js'
import { SingleEntropy } from './SingleEntropy.js'

export class Entropy extends SingleEntropy {
  constructor(dividend, divisor) {
    super(dividend, divisor)
    this.delegate = this.createDelegate(this.dividend, this.divisor)
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
      // TODO: why are we ignoring "const"/"let"/"var"/... (next. release)
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
      'Identifier',
      'ImportNamespaceSpecifier',
      'ImportSpecifier',
      'Literal',
      'ThisExpression',
      'UpdateExpression',

      // TODO: Continue ignoring these? (next. release)
      'BreakStatement',
      'ContinueStatement',
    ]
    if (expressionTypes.includes(dividendType)) {
      return new ExpressionEntropy(dividend, divisor)
    }

    if (dividendType === 'CallExpression') {
      return new CallEntropy(dividend, divisor)
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
        new BodyEntropy([dividend.consequent], divisor),
        ...dividend.alternate ? [new BodyEntropy([dividend.alternate], divisor)] : []
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

    if (dividendType === 'TryStatement') {
      return new Entropies([
        new BodyEntropy(dividend.block.body, divisor),
        new CatchEntropy(dividend.handler, divisor),
        ...dividend.finalizer ? [new BodyEntropy(dividend.finalizer.body, divisor)] : []
      ])
    }

    throw new Error(`Cannot create Delegate for dividend: ${JSON.stringify(dividend)}`)
  }
}
