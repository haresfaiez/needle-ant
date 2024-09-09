import { CodeBag } from './code/CodeBag.js'
import { BagEvaluation } from './evaluation/BagEvaluation.js'
import { NumericEvaluation } from './evaluation/NumericEvaluation.js'
import NeedleAnt from './NeedleAnt.js'

describe('Entropy evaluation', () => {
  xit('uses the exact literal in the actual/possibilities identifiers array', () => {
    const actual = new NeedleAnt('const a = 4;').entropy()

    const expectedActual = CodeBag.fromAcronNodes([{ name: 4, start: 10, end: 11}])
    const expectedPossible = CodeBag.fromAcronNodes([
      { name: 4, start: 10, end: 11},
      { name: 'a', start: 6, end: 7},
    ])
    const bagEvaluation = new BagEvaluation(expectedActual, expectedPossible, '4')
    const expected = new NumericEvaluation(1, 2, bagEvaluation)
    expect(actual.evaluate()).toEqual(expected)
  })

  it('calculates entropy value', () => {
    const actual = new NeedleAnt('const a = 4;').entropy()

    const expected = 0.5
    expect(actual.evaluate().calculate()).toEqual(expected)
  })
})
