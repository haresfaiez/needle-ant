import { Evaluations } from './Evalution.js'

beforeAll(() => {
  jasmine.addMatchers({
    toEvaluateTo: function(matchersUtil) {
      return {
        compare: function(actual, expected) {
          const result = {}
          const isEvaluations = actual instanceof Evaluations
          if(!isEvaluations || (actual.evaluations.length !== expected.evaluations.length)) {
            if (!expected.source) {
              result.pass =
                matchersUtil.equals(actual.actual, expected.actual)
                  && matchersUtil.equals(actual.possible, expected.possible)
            } else {
              result.pass = matchersUtil.equals(actual, expected)
            }
            return result
          }

          actual.evaluations.find((eachActual, i) => {
            const eachExpected = expected.evaluations[i]
            if (!eachExpected.source) {
              result.pass =
                matchersUtil.equals(eachActual.actual, eachExpected.actual)
                  && matchersUtil.equals(eachActual.possible, eachExpected.possible)
            } else {
              result.pass = matchersUtil.equals(eachActual, eachExpected)
            }

            return !result.pass
          })

          return result
        }
      }
    }
  })
})