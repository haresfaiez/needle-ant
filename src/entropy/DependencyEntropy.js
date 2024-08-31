import { Divisor } from '../reflexion/Divisor.js'
import { MonoEntropy } from './MonoEntropy.js'
import { ExpressionEntropy } from './ExpressionEntropy.js'

export class DependencyEntropy extends MonoEntropy  {
  // TODO: improve this (next. release)
  evaluate() {
    const dividend = this.dividend.sources[0]

    // TODO: Uncomment when handling inter-module depencies
    // if (this.divisor.shouldCheckAdjacentModules()) {
    //   const importParts = new Reflexion(dividend).api()
    //   const importSpecifiers = importParts[0]
    //   const importSource = importParts[1]

    //   return new Entropy(importSpecifiers, new Divisor(this.divisor.importedModulesNames())).evaluate()
    //     .plus(new Entropy(importSource, new Divisor(this.divisor.adjacentModules())).evaluate())
    // }

    const isWildcardImport = (dividend.type === 'ImportDeclaration')
      && (dividend.specifiers[0].type === 'ImportNamespaceSpecifier')

    this.divisor.extend(this.dividend.identifiers())

    if (isWildcardImport || this.divisor.shouldFocusOnCurrentModule()) {
      const nextDivisor = new Divisor(this.divisor.identifiers())
      return new ExpressionEntropy(this.dividend.sources[0], nextDivisor).evaluate()
    }

    throw ('DepencyEntropy#evaluate does not handle this case yet')
  }
}