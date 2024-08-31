import { BodyEntropy } from './entropy/BodyEntropy.js'
import { Reflexion } from './reflexion/Reflexion.js'
import { Divisor } from './reflexion/Divisor.js'
import { CodeBag } from './code/CodeBag.js'
import { CodeSlice } from './code/CodeSlice.js'

class NeedleAnt {
  constructor(code, dependencies = []) {
    this.code = code
    const deps = dependencies
      .map(dependency => Reflexion.parse(dependency, ast => ast.body).api())

    this.dependenciesApi = CodeBag.withNullCoordinates(deps)
  }

  entropy() {
    const jointEntropy = new BodyEntropy(
      CodeSlice.parse(this.code),
      new Divisor(this.dependenciesApi)
    )

    // TODO: Use `new MultiModulesDivisor(new DependenciesReflexion(...` (next. release)
    return jointEntropy.evaluate()
  }
}

export default NeedleAnt
