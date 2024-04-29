import { Evaluation } from './Evalution.js'

beforeAll(() => {
  jasmine.addMatchers({
    toEvaluateTo: function() {
      return {
        compare: function(actual, expected) {
          const actualLength = actual.evaluations?.length
          if(!actualLength || (actualLength !== expected.evaluations?.length)) {
            if (!expected.source) {
              expect(Object.assign(new Evaluation(), actual, { source: undefined}))
                .toEqual(expected)
            } else {
              expect(actual).toEqual(expected)
            }
            return { pass: true }
          }

          actual.evaluations.forEach((eachActual, i) => {
            const eachExpected = expected.evaluations[i]
            if (!eachExpected.source) {
              expect(Object.assign(new Evaluation(), eachActual, { source: undefined}))
                .toEqual(eachExpected)
            } else {
              expect(eachActual).toEqual(eachExpected)
            }
          })

          return { pass: true }
        }
      }
    }
  })
})