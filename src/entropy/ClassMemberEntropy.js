import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'
import { Entropy } from './Entropy.js'
import { DeclarationEntropy } from './DeclarationEntropy.js'

export class ClassMemberEntropy extends DeclarationEntropy {
  evaluate() {
    const declarations = this.dividend.sources
    const declaration = declarations[0]

    const reflexion = Reflexion.fromAcornNodes(declaration.value.params)
    const paramsAsIdentifiers = reflexion.identifiers()
    const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
    return new Entropy(declaration.value, declarationDivisor).evaluate()
  }
}