import { Evaluation, NullEvaluation } from './Evalution.js'

describe('Evaluations', () => {
  it('evaluates its members', () => {
    const identifiersEvaluation =
      new Evaluation(['a'], ['a', 'b'])
        .plus(new Evaluation(['a', 'b'],['a', 'b', 'c', 'd']))

    expect(identifiersEvaluation.evaluate())
      .toEqual(new Evaluation(1, 2).plus(new Evaluation(2, 4)))
  })
})

describe('Evaluation constructor', () => {
  it('transfroms Evaluation with identifiers to Evaluation with numbers', () => {
    expect(new Evaluation(['a', 'b'], ['c', 'cd', 'x']).evaluate()).toEqual(new Evaluation(2, 3))
  })
})

describe('Product', () => {
  it('times(2) double the evaluation', () => {
    expect(new Evaluation(5, 8).times(2))
      .toEqual(new Evaluation(5, 8).plus(new Evaluation(5, 8)))
  })
})

describe('Sum', () => {
  it('with NullEvaluation is an identity function', () => {
    expect(new NullEvaluation().plus(new Evaluation(1, 2)))
      .toEqual(new Evaluation(1, 2))
  })
})

describe('Evaluation equality', () => {
  it('checks actual and possible', () => {
    expect(new Evaluation(1, 2)).toEqual(new Evaluation(1, 2))
  })
})
