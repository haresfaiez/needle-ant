import { Evaluations } from './Evalution.js'

const failedComparisonMessage = (actual, expected, failingComparisonIndex) => {
  return `Evaluations are not the same (Comparison failed at evaluation with index: ${failingComparisonIndex}).
\n
  - expected:
    ${expected.evaluations.map(JSON.stringify).join(',\n    ')}
\n
  - got:
    ${actual.evaluations.map(JSON.stringify).join(',\n    ')}`
}

beforeAll(() => {
  jasmine.addMatchers({
    toEvaluateTo: function(matchersUtil) {
      return {
        compare: function(actual, expected) {
          const result = {}
          const isEvaluations = actual instanceof Evaluations
          if(!isEvaluations) {
            if (!expected.source) {
              result.pass =
                matchersUtil.equals(actual.actual, expected.actual)
                  && matchersUtil.equals(actual.possible, expected.possible)
            } else {
              result.pass = matchersUtil.equals(actual, expected)
            }
            return result
          }

          if(actual.evaluations.length !== expected.evaluations.length) {
            result.message = `Evaluations length is not the same.
  - expected: ${expected.evaluations.length}
  - got: ${actual.evaluations.length}
\n\n
${failedComparisonMessage(actual, expected)}`

            result.pass = matchersUtil.equals(actual.evaluations.length, expected.evaluations.length)
            return result
          }

          const failingComparisonIndex = actual.evaluations.find((eachActual, i) => {
            const eachExpected = expected.evaluations[i]
            if (!eachExpected.source) {
              result.pass =
                matchersUtil.equals(eachActual.actual, eachExpected.actual)
                  && matchersUtil.equals(eachActual.possible, eachExpected.possible)
            } else {
              result.pass = matchersUtil.equals(eachActual, eachExpected)
            }

            return !result.pass && i
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
