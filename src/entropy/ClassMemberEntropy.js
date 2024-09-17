import { NotFoundCodePath } from '../code/CodePath.js'
import { Spectrum } from '../reflection/Spectrum.js'
import { Surface } from '../reflection/Surface.js'
import { Entropy } from './Entropy.js'
import { MonoEntropy } from './MonoEntropy.js'

export class ClassMemberEntropy extends MonoEntropy {
  navigate(path) {
    if (path.head() === this.astNode.key?.name) {
      return path.hasSubPath()
        ? this.delegate.navigate(path.tail())
        : this.createFoundCodePath(path)
    }

    return this.delegate
      ? this.delegate.navigate(path)
      : new NotFoundCodePath(path)
  }

  evaluate() {
    const spectrum = Spectrum.fromAcornNodes(this.astNode.value.params)
    const paramsAsIdentifiers = spectrum.identifiers()
    const declarationSurface = Surface.clone(this.surface, paramsAsIdentifiers)
    return new Entropy(this.astNode.value, declarationSurface).evaluate()
  }
}