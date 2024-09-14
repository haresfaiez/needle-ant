import { NullEvaluation } from '../evaluation/NullEvaluation.js'
import { CodeBag } from './CodeBag.js'

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

  static parse(pathString) {
    const path = pathString.split('/').filter(eachPart => !!eachPart)
    return new CodePath(path)
  }
}

export class FoundCodePath extends CodePath {
  constructor(path = [], evaluation = new NullEvaluation(), scope = CodeBag.empty()) {
    super(path)
    this.evaluation = evaluation
    this._scope = scope
  }

  // TODO: Rename to verb and use "scope" for attribute
  scope() {
    return this._scope
  }

  plus(otherFoundCodePath) {
    return new FoundCodePath(
      this.path,
      this.evaluate().plus(otherFoundCodePath.evaluate()),
      this.scope()
    )
  }

  evaluate() {
    return this.evaluation
  }
}

export class NotFoundCodePath extends CodePath {
}
