import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import { Entropy } from './Entropy.js'

class AntTrail {
  constructor(trees, footsteps) {
    this.trees = Array.isArray(trees) ? trees : [trees]
    this.footsteps = footsteps || []
  }

  scope() {
    const ast = this.trees[0]
    if (ast?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      const functionParams = ast.body[0].expression.params
      this.footsteps.push(`AntTrail/scope/functionParams/${functionParams.length}`)
      return new AntTrail(functionParams, this.footsteps).identifiers()
    }

    return []
  }

  steps() {
    const ast = this.trees[0]

    let result = ast

    if (result?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      result = result?.body[0]?.expression.body
      this.footsteps.push(`AntTrail/steps/ArrowFunctionExpression/${result}`)
    }

    if (result.type === 'Program') {
      result = result.body[0].expression
      this.footsteps.push(`AntTrail/steps/Program/${result}`)
    }

    result = Array.isArray(result.body) ? result.body : [result]

    result = result.reduce((acc, each) => {
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

    this.footsteps.push(`AntTrail/steps/result/${result.length}`)
    return result
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
          footsteps.push(`AntTrail/identifiers/Identifier/${node.name}`)
          result.push(node.name)
        }
      })
    })
    this.footsteps.push(`AntTrail/identifiers/result/${result}`)
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
    return new AntTrail(Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' }))
  }
}

export default AntTrail
