import { Reflexion } from '../reflexion/Reflexion.js'
import { Divisor } from '../reflexion/Divisor.js'
import { Entropy } from './Entropy.js'
import { DeclarationsEntropy } from './DeclarationsEntropy.js'

export class ClassMemberEntropy extends DeclarationsEntropy {
  evaluate() {
    const declarations = this.dividend.sources
    const declaration = declarations[0]

    const reflexion = Reflexion.fromAcornNodes(declaration.value.params)
    const paramsAsIdentifiers = reflexion.identifiers()
    const declarationDivisor = Divisor.clone(this.divisor, paramsAsIdentifiers)
    return new Entropy(declaration.value, declarationDivisor).evaluate()
  }
}