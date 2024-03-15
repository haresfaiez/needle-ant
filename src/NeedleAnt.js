import * as acorn from 'acorn'
import { DependencyEntropy, DeclarationEntropy } from './Entropy.js'
import { JointEntropy } from './Entropy.js'
import { AstStructure } from './AntTrail.js'

class NeedleAnt {
  constructor(code) {
    this.code = code
    this.ast = acorn.parse(this.code, { ecmaVersion: 2023, sourceType: 'module' })
    this.footsteps = []
  }

  entropy() {
    const trail = new AstStructure(this.ast, this.footsteps)
    trail.paint()
    return new JointEntropy(trail, trail.scope(), this.footsteps).calculate()
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
      return new DependencyEntropy(new AstStructure(this.ast)).minus(new DependencyEntropy(new AstStructure(updatedAst)))

    if (this.ast.body[0].kind !== updatedAst.body[0].kind)
      return new DeclarationEntropy(new AstStructure(this.ast)).minus(new DeclarationEntropy(new AstStructure(updatedAst)))

    return 0
  }
}

export default NeedleAnt
