import { BodyEntropy } from './BodyEntropy.js'
import { CodeBag } from '../code/CodeBag.js'
import { PolyEntropy } from './PolyEntropy.js'
import { DeclarationEntropy } from './DeclarationEntropy.js'

export class DeclarationsEntropy extends PolyEntropy  {
  navigate(path) {
    return this.delegate.navigate(path)
  }

  createDelegate() {
    if (this.astNodes.length === 1) {
      return new DeclarationEntropy(this.astNodes[0], this.surface)
    }

    this.astNodes
      .filter(eachDeclaration => eachDeclaration.id)
      .forEach(eachDeclaration => this.surface.extend(CodeBag.fromAcronNode(eachDeclaration.id)))

    return new BodyEntropy(this.astNodes, this.surface)
  }

  evaluate() {
    this.delegate = this.createDelegate()
    return this.delegate.evaluate()
  }
}