import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'

export class PolyEntropy {
  constructor(astNodes, divisor = new Divisor()) {
    this.astNodes = astNodes.filter(astNode => astNode.type !== 'EmptyStatement')
    this.dividend = Reflexion.fromAcornNodes(astNodes)
    this.divisor = divisor
  }

  evaluate() {
    throw new Error('`PolyEntropy#evaluate` not implemented yet in `PolyEntropy`!')
  } 
}