import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'


class Reflexion {
  constructor(sources, footsteps) {
    this.sources = Array.isArray(sources) ? sources : [sources]
    this.footsteps = footsteps || []
  }

  // TODO: Rename this
  ground(ast) {
    if (Array.isArray(ast)) {
      return new JointGround(ast)
    }

    return new AstGround(ast)
  }

  createDelegate(ast) {
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
      || ast.type === 'ExpressionStatement'
      || ast.type === 'ImportSpecifier') {
      return new ExpressionGround(ast)
    }

    if (ast.type === 'ImportDeclaration') {
      return new DependenciesStructure(ast)
    }

    if (ast.type === 'ExportNamedDeclaration') {
      return new ExpressionGround(ast)
    }

    throw new Error(`Ast type "${ast.type}" not handeled yet!`)
  }

  // TODO: remove this
  paint() {
    this.sources = this.odds()
  }

  odds() {
    throw new Error('Not implemented yet!')
  }

  add() {
    throw new Error('Not implemented yet!')
  }
  factorize() {
    let result = new Set()
    this.sources
      .map(source => this.factorizeEach(source))
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }
}

export class AstGround extends Reflexion {
  // TODO: Merge this with Reflexion...
  constructor(ast) {
    super(ast)
    this.delegate = this.sources.map(e => this.createDelegate(e))[0]
  }

  factorize() {
    return this.delegate.factorize()
  }
}

class JointGround extends Reflexion {
  // TODO: keep only one factorize()
  factorizeEach(ast) {
    return this.ground(ast).factorize()
  }

  _factorizeOnly(expanded) {
    let result = new Set()
    this.sources
      .filter(source => source.type !== 'EmptyStatement')
      .map(source => !expanded.includes(source.type) ? [source] : this.ground(source).factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }

  factorizeOnly(expanded) {
    if (this.sources[0].type === 'ExportNamedDeclaration') {
      return this._factorizeOnly(['ExportNamedDeclaration'])
    }

    let result = new Set()
    this.sources
      .filter(e => e.type !== 'EmptyStatement')
      .map(source => !expanded.includes(source.expression.type) ? [source] : this.ground(source.expression).factorize())
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }
}

class ProgramGround extends Reflexion {
  factorizeEach(ast) {
    return new JointGround(ast.body).factorizeOnly(['ArrowFunctionExpression'])
  }
}

class FunctionGround extends Reflexion {
  factorizeEach(ast) {
    if (!Array.isArray(ast.body.body)) {
      return [ast.body] // function without brackets.
    }

    return new JointGround(ast.body.body)._factorizeOnly(['IfStatement'])
  }
}

class ExpressionGround extends Reflexion {
  factorizeEach(ast) {
    const result = new Set()
    AcornWalk.simple(ast, {
      Identifier(node) {
        result.add(node)
      },
      Literal(node) {
        result.add(node)
      },
      ExportNamedDeclaration(node) {
        result.add(node)
      },
      ImportSpecifier(node) {
        result.add(node.imported.name)
      }
    })
    return result
  }
}

class ConditionalGround extends Reflexion {
  factorizeEach(ast) {
    const test = ast.test
    const consequent = ast.consequent?.body || []
    const alternate = ast.alternate?.body || []
    return [
      test,
      ...new JointGround(consequent)._factorizeOnly(['IfStatement']),
      ...new JointGround(alternate)._factorizeOnly(['IfStatement']),
    ]
  }
}

export class AntTrail extends Reflexion {
  static parse(sourceCode, transformer) {
    const ast = Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' })
    return new AstStructure(transformer ? transformer(ast) : ast)
  }

  static dependency(code, modules) {
    const ast = AntTrail.parse(code, (ast) => ast.body)
    // TODO: use instance instead of literal object
    return { importedModuleExports: ast.api(), otherModules: modules }
  }

  static from(ast, footsteps) {
    return new AstStructure(ast, footsteps)
  }

  static create() {
    return new DependenciesStructure()
  }
}

class AstStructure extends Reflexion {
  odds() {
    return new JointGround(this.sources).factorize()
  }

  // TODO: Use Ground.factorize() instead of this
  scope() {
    return this.identifiers()
  }

  // TODO: remove all these, and use Ground.factorize()
  identifiers() {
    let result = new Set()
    const footsteps = this.footsteps
    this.sources.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Identifier(node) {
          footsteps.push(`AntTrail/identifiers/Identifier/${node.name}`)
          result.add(node.name)
        },
        ImportSpecifier(node) {
          footsteps.push(`AntTrail/identifiers/Identifier/${node.imported.name}`)
          result.add(node.imported.name)
        }
      })
    })
    this.footsteps.push(`AntTrail/identifiers/result/${result}`)
    return [...result]
  }

  api() {
    let result = new Set()
    const footsteps = this.footsteps
    this.sources.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        ExportNamedDeclaration(node) {
          footsteps.push(`AntTrail/api/Identifier/${node.name}`)
          result.add(node.declaration?.id?.name)
        },
      })
    })
    this.footsteps.push(`AntTrail/api/result/${result}`)
    return [...result]
  }

  literalsWeight() {
    let result = []
    this.sources.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Literal(node) {
          result.push(node.value)
        }
      })
    })
    return result.length ? 1 : 0
  }
}

class DependenciesStructure extends Reflexion {
  files = []

  add(file) {
    this.files.push(file)
    return this
  }

  odds() {
    return this.files
  }

  // TODO: keep only one factorize()
  __factorize() {
    return [
      this.sources[0].specifiers,
      this.sources[0].source
    ]
  }

  factorize() {
    return [
      ...this.sources[0].specifiers
    ]
  }
}

