import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import { Entropy } from './Entropy.js'

class Factor {
  constructor(trees, footsteps) {
    this.trees = Array.isArray(trees) ? trees : [trees]
    this.footsteps = footsteps || []
  }

  entropies(scope) {
    return this.trees.map(e => Entropy.of(e, scope))
  }

  identifiers() {
    let result = []
    const footsteps = this.footsteps
    this.trees.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Identifier(node) {
          footsteps.push(`Factor/identifiers/Identifier/${node.name}`)
          result.push(node.name)
        }
      })
    })
    this.footsteps.push(`Factor/identifiers/result/${result}`)
    return result
  }

  literalsWeight() {
    let result = []
    this.trees.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Literal(node) {
          result.push(node.value)
        }
      })
    })
    return result.length ? 1 : 0
  }

  factorize() {
    let result = []
    this.trees.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Identifier(node) {
          result.push(node)
        },
        Literal(node) {
          result.push(node)
        }
      })
    })
    return result
  }

  static parse(sourceCode) {
    return new Factor(Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' }))
  }
}

export default Factor
