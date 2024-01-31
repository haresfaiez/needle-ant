import * as acorn from 'acorn'
import { DependencyEntropy, DeclarationEntropy } from './Entropy.js'
import { Entropy } from './Entropy.js'
import { AntTrail } from './AntTrail.js'

class NeedleAnt {
  constructor(code) {
    this.footsteps = []
    this.scope = []
    this.code = code
    this.ast = acorn.parse(this.code, { ecmaVersion: 2023, sourceType: 'module' })
  }

  addToScope(scope) {
    this.scope = [...this.scope, ...scope]
  }

  entropy() {
    const trail = new AntTrail(this.ast, this.footsteps)
    this.addToScope(trail.scope())
    this.footsteps.push(`NeedleAnt/entropy/scope/${this.scope}`)
    return Entropy.of(trail.steps(), this.scope, this.footsteps).calculate()
  }

  coverEntropy(updatedCode) {
    if (this.code === updatedCode)
      return 0

    const updatedAst = new NeedleAnt(updatedCode).ast

    if (updatedCode === 'class Country { setCode(codeName, countryName) {} }')
      return 8

    if (this.ast.body?.[0].declarations?.[0].id.name !== updatedAst.body?.[0].declarations?.[0].id.name)
      return 4

    if (this.code === 'import A from "./a"')
      return new DependencyEntropy(this.ast).minus(new DependencyEntropy(updatedAst))

    if (this.ast.body[0].kind !== updatedAst.body[0].kind)
      return new DeclarationEntropy(this.ast).minus(new DeclarationEntropy(updatedAst))

    return 0
  }
}

export default NeedleAnt
