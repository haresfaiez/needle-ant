import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'

// TODO: rename or remove this
export class SingleEntropy {
  constructor(dividend, divisor = new Divisor()) {
    // TODO: Create different factories for each condition
    const reflexion = dividend.sources
      ? dividend
      : (Array.isArray(dividend) ? Reflexion.fromAcornNodes(dividend) : Reflexion.fromAcornNodes([dividend]))

    this.dividend = reflexion
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  }
}