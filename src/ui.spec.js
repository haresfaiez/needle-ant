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
