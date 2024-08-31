import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'

export class PolyEntropy {
  constructor(dividend, divisor = new Divisor()) {
    this.dividend = Reflexion.fromAcornNodes(dividend)
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`PolyEntropy#evaluate` not implemented yet in `PolyEntropy`!')
  } 
}