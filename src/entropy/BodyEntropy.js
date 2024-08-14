import { Divisor } from '../Divisor.js'
import { Entropies } from './Entropies.js'
import { Entropy } from './Entropy.js'
import { SingleEntropy } from './SingleEntropy.js'

export class BodyEntropy extends SingleEntropy  {
  evaluate() {
    const newDivisor = Divisor.clone(this.divisor)
    const entropies = this.dividend
      .sources
      .map(eachSource => new Entropy(eachSource, newDivisor))
    return new Entropies(entropies).evaluate()
  }
}