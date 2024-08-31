import * as Acorn from 'acorn'

export class CodeSlice {
  constructor(raw = '', start = 0, end = 0) {
    this.raw = raw
    this.start = start
    this.end = end
  }

  static parse(sourceCode) {
    const ast = Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' })
    return ast.body
  }
}
