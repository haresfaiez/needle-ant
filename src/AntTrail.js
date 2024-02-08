import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import { JointGround } from './Ground.js'

export class AntTrail {
  constructor(sources, footsteps) {
    this.sources = Array.isArray(sources) ? sources : [sources]
    this.footsteps = footsteps || []
  }

  paint() {
    this.sources = this.steps()
  }

  steps() {
    return new JointGround(this.sources).factorize()
  }

  scope() {
    return this.identifiers()
  }

  exports() {
    let result = new Set()
    this.sources.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        ExportNamedDeclaration(node) {
          result.add(node)
        }
      })
    })
    return [...result]
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

  static parse(sourceCode, transformer) {
    const ast = Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' })
    return new AntTrail(transformer ? transformer(ast) : ast)
  }
}

export default AntTrail
