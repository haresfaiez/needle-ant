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
    const bitShifting = isBitShiftingOperation
      ? CodeBag.fromNamedNode(this.astNode, '1')
      : CodeBag.empty()

    const thisExpression = this.astNode.type === 'ThisExpression'
      ? CodeBag.fromNamedNode(this.astNode, 'this')
      : CodeBag.empty()

    // TODO: Remove this check (next. release)
    const isImport = this.astNode.type.includes('mport')
    const literals = !isImport ? this.dividend.literals().plus(bitShifting) : CodeBag.empty()

    const actuals = literals
      .plus(thisExpression)
      .plus(this.dividend.identifiers())

    const possibles = literals
      .plus(thisExpression)
      .plus(this.divisor.identifiers())

    return BagEvaluation.fromAstNode(actuals, possibles, this.astNode)
  }
}