import Factor from './Factor.js'

export class AntTrail {
  constructor(ast, footsteps) {
    this.ast = ast
    this.footsteps = footsteps || []
  }

  scope() {
    if (this.ast?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      const functionParams = this.ast.body[0].expression.params
      this.footsteps.push(`AntTrail/scope/functionParams/${functionParams.length}`)
      return new Factor(functionParams, this.footsteps).identifiers()
    }

    return []
  }

  steps() {
    let result = this.ast

    if (result?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      result = result?.body[0]?.expression.body
      this.footsteps.push(`AntTrail/steps/ArrowFunctionExpression/${result}`)
    }

    if (result.type === 'Program') {
      result = result.body[0].expression
      this.footsteps.push(`AntTrail/steps/Program/${result}`)
    }

    result = Array.isArray(result.body) ? result.body : [result]

    this.footsteps.push(`AntTrail/steps/result/${result.length}`)
    return result
  }
}
