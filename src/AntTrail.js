import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import { Entropy } from './Entropy.js'

class AntTrail {
  constructor(trees, footsteps) {
    this.trees = Array.isArray(trees) ? trees : [trees]
    this.footsteps = footsteps || []
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

  steps() {
    const ast = this.trees[0]

    let eachAst = ast

    if (eachAst?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      eachAst = eachAst?.body[0]?.expression.body
      this.footsteps.push(`AntTrail/steps/ArrowFunctionExpression/${eachAst}`)
    }

    if (eachAst.type === 'Program') {
      eachAst = eachAst.body[0].expression
      this.footsteps.push(`AntTrail/steps/Program/${eachAst}`)
    }

    eachAst = Array.isArray(eachAst.body) ? eachAst.body : [eachAst]

    eachAst = eachAst.reduce((acc, each) => {
      if (each.type === 'IfStatement') {
        this.footsteps.push(`AntTrail/steps/IfStatement/${JSON.stringify(each)}`)
        return [
          ...acc,
          each.test,
          ...(each.consequent?.body || []),
          ...(each.alternate?.body || [])
        ]
      }

      return [...acc, each]
    }, [])

    this.footsteps.push(`AntTrail/steps/result/${eachAst.length}`)
    return eachAst
  }

  entropies(scope) {
    return this.trees.map(e => Entropy.of(e, scope))
  }

  scope() {
    return this.identifiers()
  }

  identifiers() {
    let result = new Set()
    const footsteps = this.footsteps
    this.trees.forEach(eachAst => {
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
    this.trees.forEach(eachAst => {
      AcornWalk.simple(eachAst, {
        Literal(node) {
          result.push(node.value)
        }
      })
    })
    return result.length ? 1 : 0
  }

  static parse(sourceCode) {
    return new AntTrail(Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' }))
  }
}

export default AntTrail
