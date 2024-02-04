import * as AcornWalk from 'acorn-walk'

class Ground {
  constructor(ast) {
    this.ast = ast
  }

  factorize() {
    throw new Error('Not implemented yet!')
  }
}

export class AstGround extends Ground {
  constructor(ast) {
    super(ast)
    this.delegate = this.createDelegate()
  }

  createDelegate() {
    if (this.ast.type === 'Program') {
      return new ProgramGround(this.ast)
    }
    if (this.ast.type === 'IfStatement') {
      return new ConditionalGround(this.ast)
    }

    if (this.ast.type === 'ArrowFunctionExpression') {
      return new FunctionGround(this.ast)
    }

    if (this.ast.type === 'ReturnStatement'
      || this.ast.type === 'BinaryExpression'
      || this.ast.type === 'ExpressionStatement') {
      return new ExpressionGround(this.ast)
    }

    throw new Error(`Ast type "${this.ast.type}" not handeled yet!`)
  }

  factorize() {
    return this.delegate.factorize()
  }
}

export class JointGround extends Ground {
  constructor(sources) {
    super(null)
    this.sources = sources
  }

  ground(ast) {
    if (Array.isArray(ast)) {
      return new JointGround(ast)
    }

    return new AstGround(ast)
  }

  factorize() {
    let result = new Set()
    this.sources
      .map(source => this.ground(source).factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }

  _factorizeOnly(expanded) {
    let result = new Set()
    this.sources
      .map(source => !expanded.includes(source.type) ? [source] : this.ground(source).factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }

  factorizeOnly(expanded) {
    let result = new Set()
    this.sources
      .map(source => !expanded.includes(source.expression.type) ? [source] : this.ground(source.expression).factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }
}

class ProgramGround extends Ground {
  factorize() {
    return new JointGround(this.ast.body).factorizeOnly(['ArrowFunctionExpression'])
  }
}

class FunctionGround extends Ground {
  factorize() {
    if (!Array.isArray(this.ast.body.body)) {
      return [this.ast.body] // function without brackets.
    }

    return new JointGround(this.ast.body.body)._factorizeOnly(['IfStatement'])
  }
}

class ExpressionGround extends Ground {
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

class ConditionalGround extends Ground {
  factorize() {
    const test = this.ast.test
    const consequent = this.ast.consequent?.body || []
    const alternate = this.ast.alternate?.body || []
    return [
      test,
      ...new JointGround(consequent)._factorizeOnly(['IfStatement']),
      ...new JointGround(alternate)._factorizeOnly(['IfStatement']),
    ]
  }
}
