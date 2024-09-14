import { Spectrum } from './reflection/Spectrum.js'
import { Surface } from './reflection/Surface.js'
import { CodeBag } from './code/CodeBag.js'
import { CodeSlice } from './code/CodeSlice.js'
import { Entropy } from './entropy/Entropy.js'

class NeedleAnt {
  constructor(code, dependencies = []) {
    this.code = code
    const deps = dependencies
      .map(dependency => Spectrum.parse(dependency, ast => ast.body).api())

    this.dependenciesApi = CodeBag.withNullCoordinates(deps)
  }

  entropy() {
    const jointEntropy = new Entropy(
      CodeSlice.parse(this.code),
      new Surface(this.dependenciesApi)
    )

    // TODO: [DEPS] Use `new MultiModulesSurface(new DependenciesSpectrum(...` (next. release)
    return jointEntropy.evaluate()
  }
}

export default NeedleAnt
