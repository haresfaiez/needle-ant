import { Spectrum } from '../reflection/Spectrum.js'
import { Surface } from '../reflection/Surface.js'
import { Entropy } from './Entropy.js'
import { MonoEntropy } from './MonoEntropy.js'

export class ClassMemberEntropy extends MonoEntropy {
  evaluate() {
    const reflexion = Spectrum.fromAcornNodes(this.astNode.value.params)
    const paramsAsIdentifiers = reflexion.identifiers()
    const declarationSurface = Surface.clone(this.divisor, paramsAsIdentifiers)
    return new Entropy(this.astNode.value, declarationSurface).evaluate()
  }
}