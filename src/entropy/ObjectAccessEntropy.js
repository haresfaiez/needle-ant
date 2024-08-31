import { MonoEntropy } from './MonoEntropy.js'
import { Divisor } from '../reflexion/Divisor.js'
import { Entropy } from './Entropy.js'

// TODO: Search other-similar occurences and abstract (next. release)
export class ObjectAccessEntropy extends MonoEntropy {
  // TODO: Simplify this (next. release)
  evaluate() {
    // TODO: Is this true?
    this.divisor.extendAccesses(this.dividend.identifiers())
    const nextDivisor = Divisor.fromAccesses(this.divisor)
    return new Entropy(this.dividend, nextDivisor).evaluate()
  }
}