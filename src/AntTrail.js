import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'


export class Reflexion {
  constructor(sources, footsteps) {
    this.sources = Array.isArray(sources) ? sources : [sources]
    this.footsteps = footsteps || []
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
      .filter(source => source.type !== 'EmptyStatement')
      .map(source => this.factorizeEach(source))
      .forEach(ast => ast.forEach(result.add.bind(result)))
    return [...result]
  }
}

class HorizontalReflexion extends Reflexion {
  constructor(source, typesToExpand, checkExp) {
    super(source)
    this.typesToExpand = typesToExpand
    this.checkExp = checkExp
  }

  factorizeEach(ast) {
    if (this.checkExp) {
      if (!this.typesToExpand.includes(ast.expression.type)) {
        return [ast]
      }
  
      return new JointGround(ast.expression).factorize()
    }

    if (!this.typesToExpand.includes(ast.type)) {
      return [ast]
    }

    return new JointGround(ast).factorize()
  }
}

class ProgramGround extends Reflexion {
  factorizeEach(ast) {
    if (ast.body[0].type === 'ExportNamedDeclaration') {
      return new HorizontalReflexion(ast.body, ['ExportNamedDeclaration']).factorize()
    }

    return new HorizontalReflexion(ast.body, ['ArrowFunctionExpression'], true).factorize()
  }
}

class JointGround extends Reflexion {
  factorizeEach(ast) {
    return this.createDelegate(ast).factorize()
  }
}

class FunctionGround extends Reflexion {
  factorizeEach(ast) {
    if (!Array.isArray(ast.body.body)) {
      return [ast.body] // function without brackets.
    }

    return new HorizontalReflexion(ast.body.body, ['IfStatement']).factorize()
  }
}

class ConditionalGround extends Reflexion {
  factorizeEach(conditional) {
    const test = conditional.test
    const consequent = conditional.consequent?.body || []
    const alternate = conditional.alternate?.body || []
    return [
      test,
      ...new HorizontalReflexion(consequent, ['IfStatement']).factorize(),
      ...new HorizontalReflexion(alternate, ['IfStatement']).factorize()
    ]
  }
}

class ExpressionGround extends Reflexion {
  factorizeEach(expression) {
    const result = new Set()
    AcornWalk.simple(expression, {
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

