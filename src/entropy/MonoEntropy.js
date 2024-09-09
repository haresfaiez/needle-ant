import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'
import { NotFoundCodePath } from '../code/CodePath.js'

export class MonoEntropy {
  constructor(astNode, divisor = new Divisor()) {
    this.astNode = astNode
    this.dividend = Reflexion.fromAcornNodes([astNode])
    this.divisor = divisor
  }

  navigate() {
    return new NotFoundCodePath()
  }

  evaluate() {
    throw new Error('`MonoEntropy#evaluate` not implemented yet in `MonoEntropy`!')
  }
}