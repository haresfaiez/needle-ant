import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import { Entropy } from './Entropy.js'

class Factor {
  constructor(trees) {
    this.trees = Array.isArray(trees) ? trees : [trees]
  }

  entropies(scope) {
    return this.trees.map(e => Entropy.of(e, scope))
  }

  identifiers() {
    let result = []
    this.trees.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Identifier(node) {
          result.push(node.name)
        }
      })
    })
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
