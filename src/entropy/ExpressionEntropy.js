import { BagEvaluation } from '../evaluation/BagEvaluation.js'
import { CodeBag } from '../code/CodeBag.js'
import { MonoEntropy } from './MonoEntropy.js'
import { Entropies } from './Entropies.js'
import { Entropy } from './Entropy.js'
import { ObjectAccessEntropy } from './ObjectAccessEntropy.js'

export class ExpressionEntropy extends MonoEntropy {
  evaluate() {
    const dividend = this.dividend.sources[0]
    const isMemberAccess = dividend?.left?.type === 'MemberExpression'

    if (isMemberAccess) {
      return new Entropies([
        new Entropy(dividend.left.object, this.divisor),
        new ObjectAccessEntropy(dividend.left.property, this.divisor),
        new Entropy(dividend.right, this.divisor)
      ]).evaluate()
    }

    const isBitShiftingOperation = ['++', '--'].includes(dividend.operator)

    // TODO: Remove this check (next. release)
    const isImport = dividend.type.includes('mport')

    // TODO: Simplify these
    const literals = !isImport
      ? this.dividend.literals().plus(isBitShiftingOperation ? CodeBag.fromNamedNode(dividend, '1') : CodeBag.empty())
      : CodeBag.empty()

    const thisExpression = dividend.type === 'ThisExpression'
      ? CodeBag.fromNamedNode(dividend, 'this')
      : CodeBag.empty()

    const actualsBag = literals.plus(thisExpression).plus(this.dividend.identifiers())
    const possiblesBag = literals.plus(thisExpression).plus(this.divisor.identifiers())
    return BagEvaluation.fromAstNode(actualsBag, possiblesBag, dividend)
  }
}