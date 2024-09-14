import { MonoEntropy } from './MonoEntropy.js'
import { Surface } from '../reflection/Surface.js'
import { Entropy } from './Entropy.js'

export class ObjectAccessEntropy extends MonoEntropy {
  evaluate() {
    // TODO: Is this true?
    this.surface.extendAccesses(this.dividend.identifiers())
    const nextSurface = Surface.fromAccesses(this.surface)
    return new Entropy(this.astNode, nextSurface).evaluate()
  }
}