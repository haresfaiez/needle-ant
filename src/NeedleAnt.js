import { Reflexion } from './reflexion/Reflexion.js'
import { Divisor } from './reflexion/Divisor.js'
import { CodeBag } from './code/CodeBag.js'
import { CodeSlice } from './code/CodeSlice.js'
import { Entropy } from './entropy/Entropy.js'

class NeedleAnt {
  constructor(code, dependencies = []) {
    this.code = code
    const deps = dependencies
      .map(dependency => Reflexion.parse(dependency, ast => ast.body).api())

    this.dependenciesApi = CodeBag.withNullCoordinates(deps)
  }

  entropy() {
    const jointEntropy = new Entropy(
      CodeSlice.parse(this.code),
      new Divisor(this.dependenciesApi)
    )

    // TODO: [DEPS] Use `new MultiModulesDivisor(new DependenciesReflexion(...` (next. release)
    return jointEntropy.evaluate()
  }
}

export default NeedleAnt
