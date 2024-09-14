import { MonoEntropy } from './MonoEntropy.js'
import { Entropy } from './Entropy.js'
import { BodyEntropy } from './BodyEntropy.js'
import { Entropies } from './Entropies.js'
import { ObjectAccessEntropy } from './ObjectAccessEntropy.js'

// TODO: Create a construct based on the params/body dual (all classes)
export class CallEntropy extends MonoEntropy  {
  evaluate() {
    const isMethodInvocation = this.astNode?.callee?.type === 'MemberExpression'

    if (isMethodInvocation) {
      return new Entropies([
        new Entropy(this.astNode.callee.object, this.surface),
        new ObjectAccessEntropy(this.astNode.callee.property, this.surface),
        new BodyEntropy(this.astNode.arguments, this.surface)
      ]).evaluate()
    }

    return new Entropies([
      new Entropy(this.astNode.callee, this.surface),
      new BodyEntropy(this.astNode.arguments, this.surface)
    ]).evaluate()
  }
}