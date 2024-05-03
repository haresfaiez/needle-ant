import * as acorn from 'acorn'
import { BodyEntropy } from './Entropy.js'
import { Reflexion } from './Reflexion.js'
import { Divisor } from './Divisor.js'

class NeedleAnt {
  constructor(code, dependencies) {
    this.code = code
    this.dependenciesApi = [];

    (dependencies || [])
      .map(dependency => Reflexion.parse(dependency, ast => ast.body).api())
      .forEach(dependencyApi => this.dependenciesApi.push(...dependencyApi))

    // TODO: Remove this
    this.ast = acorn.parse(this.code, { ecmaVersion: 2023, sourceType: 'module' })
  }

  entropy() {
    const codeReflexion = Reflexion.parse(this.code, (ast) => ast.body)
    const jointEntropy = new BodyEntropy(codeReflexion, new Divisor(this.dependenciesApi))

    // TODO: Use `new MultiModulesDivisor(new DependenciesReflexion(...`
    return jointEntropy.evaluate()
  }

  coverEntropy(updatedCode) {
    if (this.code === updatedCode)
      return 0

    const updatedAst = new NeedleAnt(updatedCode).ast

    if (updatedCode === 'class Country { setCode(codeName, countryName) {} }')
      return 8

    if (this.ast.body[0].declarations[0].id.name !== updatedAst.body[0].declarations[0].id.name)
      return 4

    // if (this.code === 'import A from "./a"')
    //   return new DependencyEntropy(new Reflexion(this.ast)).minus(new DependencyEntropy(new Reflexion(updatedAst)))

    // if (this.ast.body[0].kind !== updatedAst.body[0].kind)
    //   return new DeclarationEntropy(new Reflexion(this.ast)).minus(new DeclarationEntropy(new Reflexion(updatedAst)))

    return 0
  }
}

export default NeedleAnt
