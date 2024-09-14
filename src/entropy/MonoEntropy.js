import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'
import { FoundCodePath, NotFoundCodePath } from '../code/CodePath.js'

export class MonoEntropy {
  constructor(astNode, divisor = new Divisor()) {
    this.astNode = astNode
    this.dividend = Reflexion.fromAcornNodes([astNode])
    this.divisor = divisor
  }

  createFoundCodePath(path) {
    return new FoundCodePath(
      path,
      this.evaluate(),
      this.divisor.identifiers()
    )
  }

  navigate(path) {
    return new NotFoundCodePath(path)
  }

  evaluate() {
    throw new Error('`MonoEntropy#evaluate` not implemented yet in `MonoEntropy`!')
  }
}