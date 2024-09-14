import { FoundCodePath, NotFoundCodePath } from '../code/CodePath.js'
import { NullEvaluation } from '../evaluation/NullEvaluation.js'
import { Divisor } from '../reflexion/Divisor.js'
import { Entropies } from './Entropies.js'
import { Entropy } from './Entropy.js'
import { PolyEntropy } from './PolyEntropy.js'

export class BodyEntropy extends PolyEntropy  {
  navigate(path) {
    const matchingDelagates =
      this.delegate
        .entropies
        .map(each => each.navigate(path))
        .filter(each => !(each instanceof NotFoundCodePath))

    if (!matchingDelagates.length) {
      return new NotFoundCodePath()
    }

    return matchingDelagates.reduce(
      (acc, each) => {
        return new FoundCodePath(acc.path, acc.evaluate().plus(each.evaluate()), this.divisor.identifiers())
      },
      new FoundCodePath(path, new NullEvaluation(), this.divisor.identifiers())
    )
  }

  evaluate() {
    const newDivisor = Divisor.clone(this.divisor)
    const entropies = this.astNodes.map(eachSource => new Entropy(eachSource, newDivisor))
    this.delegate = new Entropies(entropies)
    return this.delegate.evaluate()
  }
}