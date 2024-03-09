import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import { JointGround } from './Ground.js'

export class AntTrail {
  constructor(sources, footsteps) {
    this.sources = Array.isArray(sources) ? sources : [sources]
    this.footsteps = footsteps || []
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

class AstStructure extends AntTrail {
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

class DependenciesStructure extends AntTrail {
  files = []

  add(file) {
    this.files.push(file)
    return this
  }

  odds() {
    return this.files
  }
}

