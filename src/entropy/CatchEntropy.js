import { MonoEntropy } from './MonoEntropy.js'
import { Divisor } from '../reflexion/Divisor.js'
import { CodeBag } from '../code/CodeBag.js'
import { BodyEntropy } from './BodyEntropy.js'

// TODO: Create a construct based on the params/body dual (next. release)
export class CatchEntropy extends MonoEntropy {
  evaluate() {
    const dividend = this.dividend.sources[0]
    const newDivisor = Divisor.clone(this.divisor)
    newDivisor.extend(CodeBag.fromAcronNodes([dividend.param]))
    return new BodyEntropy([dividend.body], newDivisor).evaluate()
  }
}