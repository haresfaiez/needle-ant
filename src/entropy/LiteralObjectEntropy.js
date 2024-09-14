import { Entropies } from './Entropies.js'
import { MonoEntropy } from './MonoEntropy.js'
import { Entropy } from './Entropy.js'

export class LiteralObjectEntropy extends MonoEntropy {
  evaluate() {
    this.surface.extendAccesses(this.dividend.properties())

    return new Entropies(
      this.astNode
        .properties
        .map(eachSource => new Entropy(eachSource.value, this.surface))
    ).evaluate()
  }
}