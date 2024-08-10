import { IdentifiersEvaluation, NumericEvaluation } from './Evalution.js'
import NeedleAnt from './NeedleAnt.js'

describe('Entropy evaluation', () => {
  it('uses the exact literal in the actual/possibilities identifiers array', () => {
    const code = 'const a = 4;'
    const actual = new NeedleAnt(code).entropy()
 
    const expected = new NumericEvaluation(1, 2, new IdentifiersEvaluation([4], ['a', 4], '4'))
    expect(actual.evaluate()).toEqual(expected)
  })
})
// import { CodeSlice } from './CodeSlice.js'
// import { IdentifiersEvaluation, NumericEvaluation, UiEvaluation } from './Evalution.js'
// import NeedleAnt from './NeedleAnt.js'

// TODO: Uncomment and fix these
// describe('Entropy evaluation', () => {
//   it('uses the exact literal in the actual/possibilities identifiers array', () => {
//     const code = 'const a = 4;'
//     const actual = new NeedleAnt(code).entropy().evaluate()

//     const literalCodeSlice = new CodeSlice('4', 10, 11)
//     const identifiersEvaluation = new IdentifiersEvaluation([literalCodeSlice], ['a', literalCodeSlice], '4')
//     const expected = new NumericEvaluation(1, 2, identifiersEvaluation)

//     expect(actual).toEqual(expected)
//   })
// })

//   // TODO: Add a test to highlight also the possiblities
//   describe('Entropy UI evaluation', () => {
//   it('contains a literal position in code', () => {
//     const code = 'const a = 4;'
//     const actual = new NeedleAnt(code).entropy().draw()

//     const literalCodeSlice = new CodeSlice('4', 10, 11)
//     const identifiersEvaluation = new IdentifiersEvaluation([literalCodeSlice], ['a', literalCodeSlice], '4')
//     const numericEvaluation = new NumericEvaluation(1, 2, identifiersEvaluation)
//     const expected = new UiEvaluation(numericEvaluation, [literalCodeSlice])

//     expect(actual).toEqual(expected)
//   })

  // it('', () => {
  //   const code = 'const increment = (aNumber) => aNumber + 1; const result = increment(2);'
  //   const actual = new NeedleAnt(code).entropy()

  //   const expected = new

  //   const expected = new NumericEvaluation(1, 2)
  //     .plus(new NumericEvaluation(1, 3))
  //     .plus(new NumericEvaluation(1, 3))
  //     .plus(new NumericEvaluation(1, 2))
  //     .plus(new NumericEvaluation(1, 3))
  //   expect(actual.evaluate()).toEvaluateTo(expected)
  // })
// })
