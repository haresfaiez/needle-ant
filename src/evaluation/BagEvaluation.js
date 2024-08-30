import * as escodegen from 'escodegen'
import { CodeBag } from '../code/CodeBag.js'
import { NumericEvaluation } from './NumericEvaluation.js'
import { Evaluation } from './Evaluation.js'
import { Evaluations } from './Evaluations.js'

export class BagEvaluation extends Evaluation {
  constructor(actual = new CodeBag(), possible = new CodeBag(), source) {
    super()
    this.actual = actual
    this.possible = possible
    this.source = source
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

  evaluate() {
    const actuals = this.actual.raws()
    const possibles = this.possible.raws()
    // TODO: Do not put the whole `this`, pick only a needed view
    return new NumericEvaluation(actuals.length, possibles.length, this)
  }

  static fromAstNode(actual, possible, source) {
    const nodeToSourceCode = escodegen.generate(source, { format: escodegen.FORMAT_MINIFY })
    return new BagEvaluation(actual, possible, nodeToSourceCode)
  }
}