import { Entropies } from './Entropies.js'
import { SingleEntropy } from './SingleEntropy.js'
import { Entropy } from './Entropy.js'

// TODO: Merge with DeclarationEntropy (next. release)
export class LiteralObjectEntropy extends SingleEntropy {
  // TODO: Simplify this (next. release)
  evaluate() {
    const declarations = this.dividend.sources
    const declaration = declarations[0]

    this.divisor.extendAccesses(this.dividend.properties())

    return new Entropies(
      declaration
        .properties
        .map(eachSource => new Entropy(eachSource.value, this.divisor))
    ).evaluate()
  }
}