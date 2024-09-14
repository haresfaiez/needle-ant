import { BodyEntropy } from './BodyEntropy.js'
import { CallEntropy } from './CallEntropy.js'
import { DependencyEntropy } from './DependencyEntropy.js'
import { ObjectAccessEntropy } from './ObjectAccessEntropy.js'
import { Entropies } from './Entropies.js'
import { LiteralObjectEntropy } from './LiteralObjectEntropy.js'
import { DeclarationsEntropy } from './DeclarationsEntropy.js'
import { ClassMemberEntropy } from './ClassMemberEntropy.js'
import { ClassEntropy } from './ClassEntropy.js'
import { ExpressionEntropy } from './ExpressionEntropy.js'
import { CatchEntropy } from './CatchEntropy.js'
import { MonoEntropy } from './MonoEntropy.js'
import { FoundCodePath } from '../code/CodePath.js'

// TODO: check delegates for all Entropy classes
// TODO: Add delegation fallback
export class Entropy extends MonoEntropy {
  constructor(dividend, divisor) {
    super(dividend, divisor)
    this.delegate = this.createDelegate()
  }

  navigate(path) {
    if (path.isRoot())
      return new FoundCodePath(path, this.evaluate(), this.divisor.identifiers())

    return this.delegate.navigate(path)
  }

  evaluate() {
    return this.delegate
      .evaluate()
      .setSource(this)
  }

  createDelegate() {
    if (this.astNode.type === 'ImportDeclaration') {
      return new DependencyEntropy(this.astNode, this.divisor)
    }

    if (this.astNode.type === 'MemberExpression') {
      const accessEntropy = this.astNode.computed
        ? new Entropy(this.astNode.property, this.divisor)
        : new ObjectAccessEntropy(this.astNode.property, this.divisor)

      return new Entropies([
        new Entropy(this.astNode.object, this.divisor),
        accessEntropy
      ])
    }

    if (this.astNode.type === 'ObjectExpression') {
      return new LiteralObjectEntropy(this.astNode, this.divisor)
    }

    if (this.astNode.type === 'NewExpression') {
      return new Entropies([
        new Entropy(this.astNode.callee, this.divisor),
        ...(this.astNode.arguments.length ? [new BodyEntropy(this.astNode.arguments, this.divisor)] : [])
      ])
    }

    if (this.astNode.type === 'VariableDeclaration') {
      // TODO: why are we ignoring "const"/"let"/"var"/... (next. release)
      return new DeclarationsEntropy(this.astNode.declarations, this.divisor)
    }

    const declarationTypes = [
      'FunctionDeclaration',
      'ArrowFunctionExpression',
    ]
    if (declarationTypes.includes(this.astNode.type)) {
      return new DeclarationsEntropy([this.astNode], this.divisor)
    }

    const classMemberTypes = [
      'MethodDefinition',
      'PropertyDefinition',
    ]
    if (classMemberTypes.includes(this.astNode.type)) {
      return new ClassMemberEntropy(this.astNode, this.divisor)
    }

    if (this.astNode.type === 'ClassDeclaration') {
      return new ClassEntropy(this.astNode, this.divisor)
    }

    const bodyTypes = [
      'BlockStatement',
      'ClassBody',
    ]
    if (bodyTypes.includes(this.astNode.type)) {
      return new BodyEntropy(this.astNode.body, this.divisor)
    }

    if (this.astNode.type === 'FunctionExpression') {
      return new BodyEntropy([this.astNode.body], this.divisor)
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
    if (expressionTypes.includes(this.astNode.type)) {
      return new ExpressionEntropy(this.astNode, this.divisor)
    }

    if (this.astNode.type === 'CallExpression') {
      return new CallEntropy(this.astNode, this.divisor)
    }

    if (this.astNode.type === 'ArrayExpression') {
      return new BodyEntropy(this.astNode.elements, this.divisor)
    }

    if (this.astNode.type === 'ExpressionStatement') {
      return new Entropy(this.astNode.expression, this.divisor)
    }

    if (this.astNode.type === 'IfStatement') {
      return new Entropies([
        new Entropy(this.astNode.test, this.divisor),
        new BodyEntropy([this.astNode.consequent], this.divisor),
        ...this.astNode.alternate ? [new BodyEntropy([this.astNode.alternate], this.divisor)] : []
      ])
    }

    if (this.astNode.type === 'VariableDeclarator') {
      return new DeclarationsEntropy([this.astNode], this.divisor)
    }

    if (this.astNode.type === 'ForStatement') {
      return new BodyEntropy([this.astNode.init, this.astNode.test, this.astNode.update, this.astNode.body], this.divisor)
    }

    const loopTypes = [
      'WhileStatement',
      'DoWhileStatement',
    ]
    if (loopTypes.includes(this.astNode.type)) {
      return new BodyEntropy([this.astNode.test, this.astNode.body], this.divisor)
    }

    const structuredLoopTypes = [
      'ForInStatement',
      'ForOfStatement',
    ]
    if (structuredLoopTypes.includes(this.astNode.type)) {
      return new BodyEntropy([this.astNode.left, this.astNode.right, this.astNode.body], this.divisor)
    }

    if (this.astNode.type === 'SequenceExpression') {
      return new BodyEntropy(this.astNode.expressions, this.divisor)
    }

    if (this.astNode.type === 'AssignmentExpression' || this.astNode.type === 'BinaryExpression') {
      // TODO: Why ignored this.astNode.operator?
      // TODO: Why ignoring depth? `a + 2` vs `a + (a * 2)`
      return new BodyEntropy([this.astNode.left, this.astNode.right], this.divisor)
    }

    const argumentBasedTypes = [
      'SpreadElement',
      'UnaryExpression',
      'ReturnStatement',
    ]
    if (argumentBasedTypes.includes(this.astNode.type)) {
      return this.astNode.argument
        ? new Entropy(this.astNode.argument, this.divisor)
        : new BodyEntropy([], this.divisor)
    }

    if (this.astNode.type === 'SwitchStatement') {
      return new BodyEntropy([this.astNode.discriminant, ...this.astNode.cases], this.divisor)
    }

    if (this.astNode.type === 'SwitchCase') {
      return new BodyEntropy([
        ...this.astNode.test ? [this.astNode.test] : [],
        ...this.astNode.consequent
      ], this.divisor)
    }

    if (this.astNode.type === 'LogicalExpression') {
      return new BodyEntropy([this.astNode.left, this.astNode.right], this.divisor)
    }

    if (this.astNode.type === 'ExportNamedDeclaration' && !this.astNode.source) {
      const elements = [
        ...(this.astNode.declaration ? [this.astNode.declaration] : []),
        ...this.astNode.specifiers
      ]
      return new BodyEntropy(elements, this.divisor)
    }

    if (this.astNode.type === 'ExportDefaultDeclaration') {
      return new Entropy(this.astNode.declaration, this.divisor)
    }

    if (this.astNode.type === 'ExportSpecifier') {
      return new Entropy(this.astNode.local, this.divisor)
    }

    // TODO: Avoid duplication (ExportNamedDeclaration is handled twice)
    if (this.astNode.type === 'ExportAllDeclaration' || this.astNode.type === 'ExportNamedDeclaration') {
      // TODO: Handle this export (currently, exports are ignored)
      return new BodyEntropy([], this.divisor)
    }

    if (this.astNode.type === 'TryStatement') {
      return new Entropies([
        new BodyEntropy(this.astNode.block.body, this.divisor),
        new CatchEntropy(this.astNode.handler, this.divisor),
        ...this.astNode.finalizer ? [new BodyEntropy(this.astNode.finalizer.body, this.divisor)] : []
      ])
    }

    throw new Error(`Cannot create Delegate for: ${JSON.stringify(this.astNode)}`)
  }
}
