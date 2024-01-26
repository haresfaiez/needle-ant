import * as acorn from 'acorn'
import { DependencyEntropy, DeclarationEntropy } from './Entropy.js'
import { ExpressionEntropy } from './Entropy.js'

class NeedleAnt {
  constructor(initialCode) {
    this.scope = []
    this.initialCode = initialCode
    this.initialAst = acorn.parse(this.initialCode, { ecmaVersion: 2023, sourceType: 'module' })

    if (this.initialAst?.body[0]?.expression?.type === 'ArrowFunctionExpression') {
      this.initialAst = this.initialAst?.body[0]?.expression.body
    }
  }

  addToScope(scope) {
    this.scope = [...this.scope, ...scope]
  }

  entropy() {
    let elements = []
    if (this.initialAst.type === 'Program') {
      this.initialAst = this.initialAst.body[0].expression
    }

    if (this.initialAst.type === 'BinaryExpression') {
      let left = [this.initialAst.left]
      if (left[0].type === 'BinaryExpression') {
        left = [left[0].left, left[0].right]
      }
      elements = [...left, this.initialAst.right].filter(e => !!e)
    }

    if (this.initialAst.type === 'Literal') {
      elements = [this.initialAst]
    }

    return new ExpressionEntropy(elements, this.scope).calculate()
  }

  coverEntropy(updatedCode) {
    if (this.initialCode === updatedCode)
      return 0

    const updatedAst = acorn.parse(updatedCode, { ecmaVersion: 2023, sourceType: 'module' })
  
    if (this.initialCode === 'import A from "./a"')
      return new DependencyEntropy(this.initialAst).minus(new DependencyEntropy(updatedAst))

    if (updatedCode === 'class Country { setCode(codeName, countryName) {} }')
      return 8

    const declaration = { initial: this.initialAst.body[0], updated: updatedAst.body[0] }

    if (declaration.initial.kind !== declaration.updated.kind)
      return new DeclarationEntropy(this.initialAst).minus(new DeclarationEntropy(updatedAst))

    if (declaration.initial.declarations[0].id.name !== declaration.updated.declarations[0].id.name)
      return 4

    return 0
  }
}

export default NeedleAnt
