import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'

export class PolyEntropy {
  constructor(dividend, divisor = new Divisor()) {
    // TODO: Create different factories for each condition
    // dividend.sources && console.log('source/', dividend, new Error().stack)
    // (!dividend.sources && Array.isArray(dividend) && dividend.length > 1) && console.log('dividend/', new Error().stack.includes('at new BodyEntropy (file:///workspaces/needle-ant/src/entropy/BodyEntropy.js:6:8)'))
    (dividend.sources) && console.log('dividend/', dividend, new Error().stack)
    const reflexion = (Array.isArray(dividend) ? Reflexion.fromAcornNodes(dividend) : Reflexion.fromAcornNodes([dividend]))

    this.dividend = reflexion
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`Entropy#evaluate` not implemented yet in `Entropy`!')
  } 
}