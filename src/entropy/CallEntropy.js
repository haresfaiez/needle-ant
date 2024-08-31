import { MonoEntropy } from './MonoEntropy.js'
import { Entropy } from './Entropy.js'
import { BodyEntropy } from './BodyEntropy.js'
import { Entropies } from './Entropies.js'
import { ObjectAccessEntropy } from './ObjectAccessEntropy.js'

// TODO: Create a construct based on the params/body dual (next. release)
export class CallEntropy extends MonoEntropy  {
  // TODO: Simplify this (next. release)
  evaluate() {
    const dividend = this.dividend.sources[0]

    const isMethodInvocation = dividend?.callee?.type === 'MemberExpression'

    if (isMethodInvocation) {
      return new Entropies([
        new Entropy(dividend.callee.object, this.divisor),
        new ObjectAccessEntropy(dividend.callee.property, this.divisor),
        new BodyEntropy(dividend.arguments, this.divisor)
      ]).evaluate()
    }

    return new Entropies([
      new Entropy(dividend.callee, this.divisor),
      new BodyEntropy(dividend.arguments, this.divisor)
    ]).evaluate()
  }
}