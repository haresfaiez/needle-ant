import { MonoEntropy } from './MonoEntropy.js'
import { Divisor } from '../reflexion/Divisor.js'
import { Entropy } from './Entropy.js'

export class ObjectAccessEntropy extends MonoEntropy {
  evaluate() {
    // TODO: Is this true?
    this.divisor.extendAccesses(this.dividend.identifiers())
    const nextDivisor = Divisor.fromAccesses(this.divisor)
    return new Entropy(this.astNode, nextDivisor).evaluate()
  }
}