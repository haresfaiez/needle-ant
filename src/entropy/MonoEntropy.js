import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'

export class MonoEntropy {
  constructor(astNode, divisor = new Divisor()) {
    this.astNode = astNode
    this.dividend = Reflexion.fromAcornNodes([astNode])
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`MonoEntropy#evaluate` not implemented yet in `MonoEntropy`!')
  }
}