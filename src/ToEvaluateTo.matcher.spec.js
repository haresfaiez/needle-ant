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
                matchersUtil.equals(actual.actualCount, expected.actualCount)
                  && matchersUtil.equals(actual.possibleCount, expected.possibleCount)
            } else {
              result.pass = matchersUtil.equals(actual, expected)
            }
            return result
          }

          actual.evaluations.find((eachActual, i) => {
            const eachExpected = expected.evaluations[i]
            if (!eachExpected.source) {
              result.pass =
                matchersUtil.equals(eachActual.actualCount, eachExpected.actualCount)
                  && matchersUtil.equals(eachActual.possibleCount, eachExpected.possibleCount)
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