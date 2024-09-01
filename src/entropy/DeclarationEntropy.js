import { BodyEntropy } from './BodyEntropy.js'
import { Entropy } from './Entropy.js'
import { Reflexion } from '../reflexion/Reflexion.js'
import { NullEvaluation } from '../evaluation/NullEvaluation.js'
import { Divisor } from '../reflexion/Divisor.js'
import { CodeBag } from '../code/CodeBag.js'
import { MonoEntropy } from './MonoEntropy.js'

// TODO: Extract into a composition of classes (next. release)
export class DeclarationEntropy extends MonoEntropy  {
  evaluate() {
    if (this.astNode.id) {
      this.divisor.extend(CodeBag.fromAcronNodes([this.astNode.id]))
    }

    const functionsTypes = ['ArrowFunctionExpression', 'FunctionDeclaration']
    if (functionsTypes.includes(this.astNode.type)) {
      const paramsAsIdentifiers = Reflexion.fromAcornNodes(this.astNode.params).identifiers()
      const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
      return new BodyEntropy([this.astNode.body], declarationDivisor).evaluate()
    }

    if (!this.astNode.init) {
      return new NullEvaluation()
    }

    const paramsAsIdentifiers = Reflexion.fromAcornNodes(this.astNode.init.params).identifiers()
    const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
    return new Entropy(this.astNode.init, declarationDivisor).evaluate()
  }
}