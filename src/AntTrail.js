import * as Acorn from 'acorn'
import * as AcornWalk from 'acorn-walk'
import { ExpressionEntropy } from './Entropy.js'
import { ConditionalGround, ExpressionGround, FunctionGround } from './Ground.js'

class AntTrail {
  constructor(sources, footsteps) {
    this.sources = Array.isArray(sources) ? sources : [sources]
    this.footsteps = footsteps || []
  }

  entropies(scope) {
    return this.sources.map(eachSource => new ExpressionEntropy(new AntTrail(eachSource), scope))
  }

  paint() {
    this.sources = this.steps()
  }

  steps(isLowLevel) {
    if (isLowLevel) {
      let result = new Set()
      this.sources
        .map(source => new ExpressionGround(source).factorize())
        .forEach(eachAst => [...eachAst].forEach(result.add.bind(result)))
      return [...result]
    }

    const ast = this.sources[0]

    let eachAst = ast

    if (eachAst.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      eachAst = new FunctionGround(eachAst.body[0]?.expression).factorize()
    }

    eachAst = Array.isArray(eachAst.body) ? eachAst.body : [eachAst]

    eachAst = eachAst.reduce((acc, each) => {
      if (each.type === 'IfStatement') {
        return [
          ...acc,
          ...new ConditionalGround(each).factorize()
        ]
      }

      return [...acc, each]
    }, [])

    return eachAst
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

  static parse(sourceCode) {
    return new AntTrail(Acorn.parse(sourceCode, { ecmaVersion: 2023, sourceType: 'module' }))
  }
}

export default AntTrail
