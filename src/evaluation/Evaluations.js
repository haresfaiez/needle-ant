import { Evaluation } from './Evaluation.js'

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
