import { Divisor } from '../reflexion/Divisor.js'
import { Entropies } from './Entropies.js'
import { Entropy } from './Entropy.js'
import { PolyEntropy } from './PolyEntropy.js'

export class BodyEntropy extends PolyEntropy  {
  evaluate() {
    const newDivisor = Divisor.clone(this.divisor)
    const entropies = this.astNodes.map(eachSource => new Entropy(eachSource, newDivisor))
    return new Entropies(entropies).evaluate()
  }
}