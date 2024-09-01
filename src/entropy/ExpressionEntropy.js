import { BagEvaluation } from '../evaluation/BagEvaluation.js'
import { CodeBag } from '../code/CodeBag.js'
import { MonoEntropy } from './MonoEntropy.js'
import { Entropies } from './Entropies.js'
import { Entropy } from './Entropy.js'
import { ObjectAccessEntropy } from './ObjectAccessEntropy.js'

export class ExpressionEntropy extends MonoEntropy {
  evaluate() {
    const isMemberAccess = this.astNode.left?.type === 'MemberExpression'

    if (isMemberAccess) {
      return new Entropies([
        new Entropy(this.astNode.left.object, this.divisor),
        new ObjectAccessEntropy(this.astNode.left.property, this.divisor),
        new Entropy(this.astNode.right, this.divisor)
      ]).evaluate()
    }

    const isBitShiftingOperation = ['++', '--'].includes(this.astNode.operator)

    // TODO: Remove this check (next. release)
    const isImport = this.astNode.type.includes('mport')

    // TODO: Simplify these
    const literals = !isImport
      ? this.dividend.literals().plus(isBitShiftingOperation ? CodeBag.fromNamedNode(this.astNode, '1') : CodeBag.empty())
      : CodeBag.empty()

    const thisExpression = this.astNode.type === 'ThisExpression'
      ? CodeBag.fromNamedNode(this.astNode, 'this')
      : CodeBag.empty()

    const actualsBag = literals.plus(thisExpression).plus(this.dividend.identifiers())
    const possiblesBag = literals.plus(thisExpression).plus(this.divisor.identifiers())
    return BagEvaluation.fromAstNode(actualsBag, possiblesBag, this.astNode)
  }
}