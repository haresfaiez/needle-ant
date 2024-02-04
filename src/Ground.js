import * as AcornWalk from 'acorn-walk'

export class Ground {
  constructor(ast) {
    this.ast = ast
  }

  factorize() {
    throw new Error('Not implemented yet!')
  }

  static create(ast) {
    if (Array.isArray(ast)) {
      return new JointGround(ast)
    }

    if (ast.type === 'Program') {
      return new ProgramGround(ast)
    }
    if (ast.type === 'IfStatement') {
      return new ConditionalGround(ast)
    }

    if (ast.type === 'ArrowFunctionExpression') {
      return new FunctionGround(ast)
    }

    if (ast.type === 'ReturnStatement'
      || ast.type === 'BinaryExpression'
      || ast.type === 'ExpressionStatement') {
      return new ExpressionGround(ast)
    }

    throw new Error(`Ast type "${ast.type}" not handeled yet!`)
  }
}

class JointGround extends Ground {
  constructor(sources) {
    super(null)
    this.sources = sources
  }

  factorize() {
    let result = new Set()
    this.sources
      .map(source => Ground.create(source).factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }

  _factorizeOnly(expanded) {
    let result = new Set()
    this.sources
      .map(source => !expanded.includes(source.type) ? [source] : Ground.create(source).factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }

  factorizeOnly(expanded) {
    let result = new Set()
    this.sources
      .map(source => !expanded.includes(source.expression.type) ? [source] : Ground.create(source.expression).factorize())
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
