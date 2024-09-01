import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'
import { Entropy } from './Entropy.js'
import { MonoEntropy } from './MonoEntropy.js'

export class ClassMemberEntropy extends MonoEntropy {
  evaluate() {
    const reflexion = Reflexion.fromAcornNodes(this.astNode.value.params)
    const paramsAsIdentifiers = reflexion.identifiers()
    const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
    return new Entropy(this.astNode.value, declarationDivisor).evaluate()
  }
}