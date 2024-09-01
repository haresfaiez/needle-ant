import { MonoEntropy } from './MonoEntropy.js'
import { Divisor } from '../reflexion/Divisor.js'
import { CodeBag } from '../code/CodeBag.js'
import { BodyEntropy } from './BodyEntropy.js'

// TODO: Create a construct based on the params/body dual (next. release)
export class CatchEntropy extends MonoEntropy {
  evaluate() {
    const newDivisor = Divisor.clone(this.divisor)
    newDivisor.extend(CodeBag.fromAcronNodes([this.astNode.param]))
    return new BodyEntropy([this.astNode.body], newDivisor).evaluate()
  }
}