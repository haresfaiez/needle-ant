import Factor from './Factor.js'

export class AntTrail {
  constructor(ast) {
    this.ast = ast
  }

  scope() {
    if (this.ast?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      return new Factor(this.ast.body[0].expression.params).identifiers()
    }

    return []
  }

  steps() {
    let result = this.ast

    if (result?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      result = result?.body[0]?.expression.body
    }

    if (result.type === 'Program') {
      result = result.body[0].expression
    }

    return Array.isArray(result.body) ? result.body : [result]
  }
}
