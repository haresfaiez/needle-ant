import { BodyEntropy } from './BodyEntropy.js'
import { CodeBag } from '../code/CodeBag.js'
import { PolyEntropy } from './PolyEntropy.js'
import { DeclarationEntropy } from './DeclarationEntropy.js'

// TODO: Extract into a composition of classes (next. release)
export class DeclarationsEntropy extends PolyEntropy  {
  evaluate() {
    if (this.astNodes.length === 1) {
      return new DeclarationEntropy(this.astNodes[0], this.divisor).evaluate()
    }

    this.astNodes
      .filter(eachDeclaration => eachDeclaration.id)
      .forEach(eachDeclaration => this.divisor.extend(CodeBag.fromAcronNode(eachDeclaration.id)))

    this.astNodes
      .filter(eachDeclaration => eachDeclaration.type === 'FunctionDeclaration')
      .forEach((eachDeclaration, i) => this.astNodes[i] = eachDeclaration.body)

    return new BodyEntropy(this.astNodes, this.divisor).evaluate()
  }
}