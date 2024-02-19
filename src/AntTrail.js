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

  scope() {
    return this.identifiers()
  }

  identifiers() {
    let result = new Set()
    const footsteps = this.footsteps
    this.sources.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Identifier(node) {
          footsteps.push(`AntTrail/identifiers/Identifier/${node.name}`)
          result.add(node.name)
        }
      })
    })
    this.footsteps.push(`AntTrail/identifiers/result/${result}`)
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

