import { Evaluation } from './Evaluation.js'
import { Evaluations } from './Evaluations.js'

export class NumericEvaluation extends Evaluation {
  constructor(actual = 0, possible = 0, rawEvaluation) {
    super()
    this.actual = actual
    this.possible = possible
    this.raw = rawEvaluation
  }

  plus(otherEvaluation) {
    if (this.shouldIgnoreAdding(otherEvaluation)) {
      return this
    }

    if (otherEvaluation.evaluations) {
      return new Evaluations([this, ...otherEvaluation.evaluations])
    }

    return new Evaluations([this, otherEvaluation])
  }

  possibilitiesCount(primitiveAndGlobalsCount = 0) {
    if (this.actual) {
      primitiveAndGlobalsCount = 1
    }

    const combinationsCount =
      this.actual > 1
        ? this.combination(this.possible + primitiveAndGlobalsCount, this.actual)
        : 0
  
    const possibilitiesWeight =
      this.actual < this.possible
        ? this.possible
        : 0

    return (this.actual || possibilitiesWeight) + combinationsCount
  }

  probability() {
    return 1 / this.possibilitiesCount()
  }

  calculate() {
    if (this.actual === this.possible)
      return 0

    if (this.probability() === 1)
      return 0

    return this.probability() * Math.log2(this.probability()) * (-1)
  }

  permutation(n, k) {
    if (n < 0 || k < 0)
      throw new RangeError(`${n < 0 ? n : k} is out of range`)

    if (0 == k)
      return 1

    if (n < k)
      return 0

    let [bn, bk, bp] = [n, k, 1]
    while (bk--)
      bp *= bn--

    return bp
  }

  combination(n, k) {
    if ((0 == k) || (n == k))
      return 1

    if (n < k)
      return 0

    return this.permutation(n, k) / this.permutation(k, k)
  }
}