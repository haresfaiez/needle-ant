import { CodeBag } from '../code/CodeBag.js'
import { NullEvaluation } from '../evaluation/NullEvaluation.js'

export class Entropies {
  constructor(entropies) {
    this.entropies = entropies
  }

  scope() {
    return this.entropies.reduce(
      (acc, each) => acc.plus(each.scope()),
      CodeBag.empty()
    )
  }

  evaluate() {
    return this.entropies.reduce(
      (sumEvalution, eachEntropy) => sumEvalution.plus(eachEntropy.evaluate()),
      new NullEvaluation()
    )
  }
}