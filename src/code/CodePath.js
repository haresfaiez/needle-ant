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

export class NotFoundCodePath extends CodePath {
}
