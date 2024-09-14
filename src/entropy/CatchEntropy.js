import { MonoEntropy } from './MonoEntropy.js'
import { Surface } from '../reflection/Surface.js'
import { CodeBag } from '../code/CodeBag.js'
import { BodyEntropy } from './BodyEntropy.js'

export class CatchEntropy extends MonoEntropy {
  evaluate() {
    const newSurface = Surface.clone(this.divisor)
    newSurface.extend(CodeBag.fromAcronNodes([this.astNode.param]))
    return new BodyEntropy([this.astNode.body], newSurface).evaluate()
  }
}