import { NumericEvaluation, NullEvaluation, IdentifiersEvaluation } from './Evalution.js'

describe('Evaluations', () => {
  it('evaluates its members', () => {
    const identifiersEvaluation =
      new IdentifiersEvaluation(['a'], ['a', 'b'])
        .plus(new IdentifiersEvaluation(['a', 'b'],['a', 'b', 'c', 'd']))

    expect(identifiersEvaluation.evaluate())
      .toEqual(new NumericEvaluation(1, 2).plus(new NumericEvaluation(2, 4)))
  })
})

describe('Evaluation constructor', () => {
  it('transfroms NumericEvaluation with identifiers to NumericEvaluation with numbers', () => {
    expect(new IdentifiersEvaluation(['a', 'b'], ['c', 'cd', 'x']).evaluate()).toEqual(new NumericEvaluation(2, 3))
  })
})

describe('Product', () => {
  it('times(2) double the evaluation', () => {
    expect(new  NumericEvaluation(5, 8).times(2))
      .toEqual(new NumericEvaluation(5, 8).plus(new NumericEvaluation(5, 8)))
  })
})

describe('Sum', () => {
  it('with NullEvaluation is an identity function', () => {
    expect(new NullEvaluation().plus(new NumericEvaluation(1, 2)))
      .toEqual(new NumericEvaluation(1, 2))
  })
})

describe('Evaluation equality', () => {
  it('checks actual and possible', () => {
    expect(new NumericEvaluation(1, 2)).toEqual(new NumericEvaluation(1, 2))
  })
})
