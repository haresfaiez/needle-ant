import * as AcornWalk from 'acorn-walk'

export class ExpressionGround {
  constructor(ast) {
    this.ast = ast
  }

  factorize() {
    const result = new Set()
    AcornWalk.simple(this.ast, {
      Identifier(node) {
        result.add(node)
      },
      Literal(node) {
        result.add(node)
      }
    })
    return result
  }
}

export class ConditionalGround {
  constructor(ast) {
    this.ast = ast
  }

  factorize() {
    return [
      this.ast.test,
      ...(this.ast.consequent?.body || []),
      ...(this.ast.alternate?.body || [])
    ]
  }
}

export class FunctionGround {
  constructor(ast) {
    this.ast = ast
  }
  
  factorize() {
    return this.ast.body
  }
}
