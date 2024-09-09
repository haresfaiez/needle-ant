import { MonoEntropy } from './MonoEntropy.js'
import { Entropy } from './Entropy.js'
import { BodyEntropy } from './BodyEntropy.js'
import { Entropies } from './Entropies.js'
import { ObjectAccessEntropy } from './ObjectAccessEntropy.js'
import { NotFoundCodePath } from '../code/CodePath.js'

// TODO: Create a construct based on the params/body dual (all classes)
export class CallEntropy extends MonoEntropy  {
  navigate() {
    return new NotFoundCodePath()
  }

  evaluate() {
    const isMethodInvocation = this.astNode?.callee?.type === 'MemberExpression'

    if (isMethodInvocation) {
      return new Entropies([
        new Entropy(this.astNode.callee.object, this.divisor),
        new ObjectAccessEntropy(this.astNode.callee.property, this.divisor),
        new BodyEntropy(this.astNode.arguments, this.divisor)
      ]).evaluate()
    }

    return new Entropies([
      new Entropy(this.astNode.callee, this.divisor),
      new BodyEntropy(this.astNode.arguments, this.divisor)
    ]).evaluate()
  }
}