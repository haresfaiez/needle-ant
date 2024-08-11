export class Evaluation {
  plus() {
    throw new Error('Cannot add this instance. Check Evalutaion sub-class used here.')
  }

  times(multiplier) {
    // TODO: Implement multiplication properly
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