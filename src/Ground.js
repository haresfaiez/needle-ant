import * as AcornWalk from 'acorn-walk'

export class Ground {
  constructor(ast) {
    this.ast = ast
  }

  factorize() {
    throw new Error('Not implemented yet!')
  }

  static create(ast) {
    return ast.type === 'Program' ? new ProgramGround(ast) : new ExpressionGround(ast)
  }
}

export class JointGround extends Ground {
  constructor(sources) {
    super(null)
    this.sources = sources
  }

  factorize() {
    let result = new Set()
    this.sources
      .map(Ground.create)
      .map(ground => ground.factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }
}

export class ProgramGround extends Ground {
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
}

export class ExpressionGround extends Ground {
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

export class ConditionalGround extends Ground {
  factorize() {
    return [
      this.ast.test,
      ...(this.ast.consequent?.body || []),
      ...(this.ast.alternate?.body || [])
    ]
  }
}

export class FunctionGround extends Ground {
  factorize() {
    return this.ast.body
  }
}
