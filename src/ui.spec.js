import { CodeBag } from './CodeBag.js'
import { BagEvaluation, NumericEvaluation } from './Evalution.js'
import NeedleAnt from './NeedleAnt.js'

describe('Entropy evaluation', () => {
  it('uses the exact literal in the actual/possibilities identifiers array', () => {
    const actual = new NeedleAnt('const a = 4;').entropy()

    const expectedActual = CodeBag.fromNodes([{ name: 4, start: 10, end: 11}])
    const expectedPossible = CodeBag.fromNodes([
      { name: 4, start: 10, end: 11},
      { name: 'a', start: 6, end: 7},
    ])
    const bagEvaluation = new BagEvaluation(expectedActual, expectedPossible, '4')
    const expected = new NumericEvaluation(1, 2, bagEvaluation)
    expect(actual.evaluate()).toEqual(expected)
  })
})
