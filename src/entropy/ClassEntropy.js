import { MonoEntropy } from './MonoEntropy.js'
import { BagEvaluation } from '../evaluation/BagEvaluation.js'
import { CodeBag } from '../code/CodeBag.js'
import { Entropy } from './Entropy.js'
import { NotFoundCodePath } from '../code/CodePath.js'

export class ClassEntropy extends MonoEntropy {
  static IGNORED_IDENTIFIERS = ['constructor']

  navigate(path) {
    if (path.head() === this.astNode.id?.name) {
      return path.hasSubPath()
        ? this.delegate.navigate(path.tail())
        : this.createFoundCodePath(path)
    }

    return this.delegate
      ? this.delegate.navigate(path)
      : new NotFoundCodePath(path)
  }

  evaluate() {
    const superClassesBag = CodeBag.fromAcronNode(this.astNode.superClass)

    this.surface.extend(superClassesBag)

    const superClassEvaluation = new BagEvaluation(superClassesBag, this.surface.identifiers())

    this.surface.extend(CodeBag.fromAcronNode(this.astNode.id))

    const members = this.astNode.body.body
      .filter(eachDeclaration => ['MethodDefinition', 'PropertyDefinition'].includes(eachDeclaration.type))
      .filter(eachDeclaration => !ClassEntropy.IGNORED_IDENTIFIERS.includes(eachDeclaration.key.name))
      .map(eachDeclaration => eachDeclaration.key)

    this.surface.extendAccesses(CodeBag.fromAcronNodes(members))

    const mainEntropy = new Entropy(this.astNode.body, this.surface)
    this.delegate = mainEntropy
    return mainEntropy.evaluate().plus(superClassEvaluation)
  }
}