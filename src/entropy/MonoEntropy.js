import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'

// TODO: rename or remove this
export class MonoEntropy {
  constructor(dividend, divisor = new Divisor()) {
    // TODO: Create different factories for each condition
    // dividend.sources && console.log('source/', dividend, new Error().stack)
    // (!dividend.sources && Array.isArray(dividend) && dividend.length > 1) && console.log('dividend/', new Error().stack)
    const reflexion = (Array.isArray(dividend) ? Reflexion.fromAcornNodes(dividend) : Reflexion.fromAcornNodes([dividend]))

    this.dividend = reflexion
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  }
}