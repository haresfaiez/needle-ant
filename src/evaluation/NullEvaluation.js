import { NumericEvaluation } from './NumericEvaluation.js'

export class NullEvaluation extends NumericEvaluation {
  plus(otherEvaluation) {
    return otherEvaluation
  }

  calculate() {
    return 0
  }
}
