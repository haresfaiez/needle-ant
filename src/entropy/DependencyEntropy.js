import { Surface } from '../reflection/Surface.js'
import { MonoEntropy } from './MonoEntropy.js'
import { ExpressionEntropy } from './ExpressionEntropy.js'

export class DependencyEntropy extends MonoEntropy  {
  // TODO: [DEPS] Uncomment & fix when handling inter-module depencies
  evaluate() {
    // if (this.divisor.shouldCheckAdjacentModules()) {
    //   const importParts = new Spectrum(dividend).api()
    //   const importSpecifiers = importParts[0]
    //   const importSource = importParts[1]

    //   return new Entropy(importSpecifiers, new Surface(this.divisor.importedModulesNames())).evaluate()
    //     .plus(new Entropy(importSource, new Surface(this.divisor.adjacentModules())).evaluate())
    // }

    const isWildcardImport = (this.astNode.type === 'ImportDeclaration')
      && (this.astNode.specifiers[0].type === 'ImportNamespaceSpecifier')

    this.divisor.extend(this.dividend.identifiers())

    if (isWildcardImport || this.divisor.shouldFocusOnCurrentModule()) {
      const nextSurface = new Surface(this.divisor.identifiers())
      return new ExpressionEntropy(this.astNode, nextSurface).evaluate()
    }

    throw ('DepencyEntropy#evaluate does not handle this case yet')
  }
}