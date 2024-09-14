import { BodyEntropy } from './BodyEntropy.js'
import { Entropy } from './Entropy.js'
import { Spectrum } from '../reflection/Spectrum.js'
import { NullEvaluation } from '../evaluation/NullEvaluation.js'
import { Surface } from '../reflection/Surface.js'
import { CodeBag } from '../code/CodeBag.js'
import { MonoEntropy } from './MonoEntropy.js'
import { NotFoundCodePath } from '../code/CodePath.js'

export class DeclarationEntropy extends MonoEntropy  {
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
    if (this.astNode.id) {
      this.divisor.extend(CodeBag.fromAcronNodes([this.astNode.id]))
    }

    const functionsTypes = ['ArrowFunctionExpression', 'FunctionDeclaration']
    if (functionsTypes.includes(this.astNode.type)) {
      const paramsAsIdentifiers = Spectrum.fromAcornNodes(this.astNode.params).identifiers()
      const declarationSurface = Surface.clone(this.divisor, paramsAsIdentifiers)
      this.delegate = new BodyEntropy([this.astNode.body], declarationSurface)
      return this.delegate.evaluate()
    }

    if (!this.astNode.init) {
      return new NullEvaluation()
    }

    const paramsAsIdentifiers = Spectrum.fromAcornNodes(this.astNode.init.params).identifiers()
    const declarationSurface = Surface.clone(this.divisor, paramsAsIdentifiers)
    this.delegate = new Entropy(this.astNode.init, declarationSurface)
    return this.delegate.evaluate()
  }
}