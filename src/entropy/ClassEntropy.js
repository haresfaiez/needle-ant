import { SingleEntropy } from './SingleEntropy.js'
import { BagEvaluation } from '../evaluation/BagEvaluation.js'
import { CodeBag } from '../code/CodeBag.js'
import { BodyEntropy } from './BodyEntropy.js'

export class ClassEntropy extends SingleEntropy {
  static IGNORED_IDENTIFIERS = ['constructor']

  // TODO: simplify this (next. release)
  evaluate() {
    const superClassesNodes = this.dividend.sources
      .filter(eachDeclaration => ['ClassDeclaration'].includes(eachDeclaration.type))
      .filter(eachDeclaration => eachDeclaration.superClass)
      .map(eachDeclaration => eachDeclaration.superClass)
    const superClassesBag = CodeBag.fromAcronNodes(superClassesNodes)

    this.divisor.extend(superClassesBag)

    // TODO: Use CodeBag here
    const superClassEvaluation = new BagEvaluation(superClassesBag, this.divisor.identifiers())

    const declarations = this.dividend.sources
    const bodyAsDividends = declarations.map(eachDeclaration => eachDeclaration.body)
    declarations.forEach(eachDeclaration => this.divisor.extend(CodeBag.fromAcronNodes([eachDeclaration.id])))

    const members = bodyAsDividends[0].body
      .filter(eachDeclaration => ['MethodDefinition', 'PropertyDefinition'].includes(eachDeclaration.type))
      .filter(eachDeclaration => !ClassEntropy.IGNORED_IDENTIFIERS.includes(eachDeclaration.key.name))
      .map(eachDeclaration => eachDeclaration.key)

    this.divisor.extendAccesses(CodeBag.fromAcronNodes(members))

    const mainEntropy = new BodyEntropy(bodyAsDividends, this.divisor).evaluate()

    // TODO: Generalize this to one `return` (next. release)
    // TODO: Use CodeBag instead
    if (superClassesNodes.length) {
      return mainEntropy.plus(superClassEvaluation)
    }
    return mainEntropy
  }
}