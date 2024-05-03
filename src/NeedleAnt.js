import { BodyEntropy } from './Entropy.js'
import { Reflexion } from './Reflexion.js'
import { Divisor } from './Divisor.js'

class NeedleAnt {
  constructor(code, dependencies = []) {
    this.code = code
    this.dependenciesApi = []

    dependencies
      .map(dependency => Reflexion.parse(dependency, ast => ast.body).api())
      .forEach(dependencyApi => this.dependenciesApi.push(...dependencyApi))
  }

  entropy() {
    const codeReflexion = Reflexion.parse(this.code, (ast) => ast.body)
    const jointEntropy = new BodyEntropy(codeReflexion, new Divisor(this.dependenciesApi))

    // TODO: Use `new MultiModulesDivisor(new DependenciesReflexion(...`
    return jointEntropy.evaluate()
  }
}

export default NeedleAnt
