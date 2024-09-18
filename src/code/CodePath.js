export class CodePath {
  constructor(path = []) {
    this.path = path
  }

  head() {
    const [head] = this.path
    return head
  }

  tail() {
    const [, ...tail] = this.path
    return new CodePath(tail)
  }

  hasSubPath() {
    return !this.tail().isRoot()
  }

  isRoot() {
    return !this.path.length
  }

  static isBoundary(astNode) {
    const functionsTypes = [
      'ArrowFunctionExpression',
      'FunctionExpression',
    ]
    return functionsTypes.includes(astNode.init.type)
  }

  static fromAncestors(ancestorAstNodes) {
    const ancestorTypes = [
      'FunctionDeclaration',
      'VariableDeclarator',
    ]
    const pathComponents =
      ancestorAstNodes
        .filter(eachNode => ancestorTypes.includes(eachNode.type))
        .map(eachNode => eachNode.id.name)

    return new CodePath(pathComponents)
  }

  static parse(pathString) {
    const path = pathString.split('/').filter(eachPart => !!eachPart)
    return new CodePath(path)
  }
}

export class FoundCodePath extends CodePath {
  constructor(path = [], evaluation, scope) {
    super(path)
    this.evaluation = evaluation
    this.scope = scope
  }

  captureScope() {
    return this.scope
  }

  plus(otherFoundCodePath) {
    return new FoundCodePath(
      this.path,
      this.evaluate().plus(otherFoundCodePath.evaluate()),
      this.captureScope().plus(otherFoundCodePath.captureScope())
    )
  }

  evaluate() {
    return this.evaluation
  }
}

export class NotFoundCodePath extends CodePath {
}
