import * as AcornWalk from 'acorn-walk'

export class Ground {
  constructor(ast) {
    this.ast = ast
  }
  
  factorize() {
    let _result  = this.ast

    if (this.ast.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      _result = new FunctionGround(this.ast.body[0]?.expression).factorize()
    }

    _result = Array.isArray(_result.body) ? _result.body : [_result]

    _result = _result.reduce((acc, each) => {
      if (each.type === 'IfStatement') {
        return [...acc, ...new ConditionalGround(each).factorize()]
      }

      return [...acc, each]
    }, [])
    return _result
  }

  static create(ast) {
    return ast.type === 'Program' ? new Ground(ast) : new ExpressionGround(ast)
  }
}

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
