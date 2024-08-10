import * as escodegen from 'escodegen'

class Evaluation {
  plus(otherEvaluation) {
    if (this.shouldIgnoreAdding(otherEvaluation)) {
      return this
    }

    if (otherEvaluation.evaluations) {
      return new Evaluations([this, ...otherEvaluation.evaluations])
    }

    return new Evaluations([this, otherEvaluation])
  }

  times(multiplier) {
    if (multiplier > 2)
      return this.times(multiplier - 1).plus(this)

    return this.plus(this)
  }

  // TODO: Ignore adding null NumericEvaluation (actual == 0)
  shouldIgnoreAdding(otherEvaluation) {
    return !otherEvaluation.evaluations
      && !otherEvaluation.actual
  }

  evaluate() {
    throw new Error('Cannot evaluate this instance. Check Evalutaion sub-class used here.')
  }
}

export class IdentifiersEvaluation extends Evaluation {
  constructor(actual = [], possible = [], source) {
    super()
    this.actual = actual
    this.possible = possible
    // TODO: Simplify this
    this.source = source?.type
      ? escodegen.generate(source, { format: escodegen.FORMAT_MINIFY })
      : source
  }

  evaluate() {
    return new NumericEvaluation(this.actual.length, this.possible.length, this.source, this)
  }
}

export class NumericEvaluation extends Evaluation {

  // TODO: Make this always take an array
  // TODO: Keep the actual/possible names inside test failures
  constructor(actual = 0, possible = 0, source, raw) {
    super()
    this.actual = actual
    this.possible = possible
    this.raw = raw
    // TODO: Simplify this (next. release)
    this.source = source?.type
      ? escodegen.generate(source, { format: escodegen.FORMAT_MINIFY })
      : source
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

export class Evaluations extends Evaluation {
  constructor(evaluations) {
    super()
    this.evaluations = evaluations.filter(eachEvaluation => !this.shouldIgnoreAdding(eachEvaluation))
  }

  evaluate() {
    const result = new Evaluations(this.evaluations.map(each => each.evaluate()))
    return (result.evaluations.length === 1) ? result.evaluations[0] : result
  }

  plus(otherEvaluation) {
    if (this.shouldIgnoreAdding(otherEvaluation)) {
      return this
    }

    const sumEvaluations = [...this.evaluations]
    if (otherEvaluation.evaluations) {
      sumEvaluations.push(...otherEvaluation.evaluations)
    } else {
      sumEvaluations.push(otherEvaluation)
    }
    return new Evaluations(sumEvaluations)
  }

  calculate() {
    return this.evaluations.reduce((acc, eachEntropy) => acc + eachEntropy.calculate(), 0)
  }
}

export class NullEvaluation extends NumericEvaluation {
  plus(otherEvaluation) {
    return otherEvaluation
  }

  calculate() {
    return 0
  }
}
