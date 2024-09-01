import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'

export class MonoEntropy {
  constructor(dividend, divisor = new Divisor()) {
    this.dividend = Reflexion.fromAcornNodes([dividend])
    this.astNode = this.dividend.sources[0]
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`MonoEntropy#evaluate` not implemented yet in `MonoEntropy`!')
  }
}