import { Evaluation } from './evaluation/Evaluation.js'
import { Evaluations } from './evaluation/Evaluations.js'

const evaluationToString = (evaluation) => {
  // If it's BagEvaluation
  if (evaluation?.raw?.actual?.elements) {
    return JSON.stringify({
      actual: evaluation.actual,
      possible: evaluation.possible,
      raw: {
        actual: Array.from(evaluation.raw.actual.elements.keys()),
        possible: Array.from(evaluation.raw.possible.elements.keys()),
        source: evaluation.raw.source
      }
    })
  }

  return JSON.stringify(evaluation)
}

const failedComparisonMessage = (actual, expected, failingComparisonIndex) => {
  return `Evaluations are not the same (Comparison failed at evaluation with index: ${failingComparisonIndex}).
\n
  - expected:
    ${(expected.evaluations || [expected]).map(evaluationToString).join(',\n    ')}
\n
  - got:
    ${(actual.evaluations || [actual] ).map(evaluationToString).join(',\n    ')}`
}

beforeAll(() => {
  jasmine.addMatchers({
    toEvaluateTo: function(matchersUtil) {
      return {
        compare: function(actual, expected) {
          const result = {}
          if (!(actual instanceof Evaluation) || !(expected instanceof Evaluation)) {
            result.pass = false
            result.message = 'Either "actual" or "expected" is not an Evaluation'
            return result
          }

          const isEvaluations = actual instanceof Evaluations
          if(!isEvaluations) {
            if (!expected.source) {
              result.pass =
              matchersUtil.equals(actual.actual, expected.actual)
                && matchersUtil.equals(actual.possible, expected.possible)
            } else {
              result.pass =
              matchersUtil.equals(actual.actual, expected.actual)
                && matchersUtil.equals(actual.possible, expected.possible)
                && matchersUtil.equals(actual.source, expected.source)
            }
            if (!result.pass) {
              result.message = `${failedComparisonMessage(actual, expected)}`
            }
            return result
          }

          const isExpectedAnEvaluations = expected instanceof Evaluations
          if(!isExpectedAnEvaluations || (actual.evaluations.length !== expected.evaluations.length)) {
            result.message = `Evaluations length is not the same.
  - expected: ${expected.evaluations?.length}
  - got: ${actual.evaluations.length}
\n\n
${failedComparisonMessage(actual, expected)}`

            result.pass = matchersUtil.equals(actual.evaluations.length, expected.evaluations?.length)
            return result
          }

          const failingComparisonIndex = actual.evaluations.findIndex((eachActual, i) => {
            const eachExpected = expected.evaluations[i]
            if (!eachExpected.source) {
              result.pass =
                matchersUtil.equals(eachActual.actual, eachExpected.actual)
                  && matchersUtil.equals(eachActual.possible, eachExpected.possible)
            } else {
              result.pass =
              matchersUtil.equals(eachActual.actual, eachExpected.actual)
                && matchersUtil.equals(eachActual.possible, eachExpected.possible)
                && matchersUtil.equals(eachActual.source, eachExpected.source)
            }

            return !result.pass
          })

          if (!result.pass) {
            result.message = failedComparisonMessage(actual, expected, failingComparisonIndex)
          }

          return result
        }
      }
    }
  })
})
