import { Evaluation, NullEvaluation } from './Evalution.js'

describe('Sum', () => {
  it('with NullEvaluation is an identity function', () => {
    expect(new NullEvaluation().plus(new Evaluation(1, 2)))
      .toEqual(new Evaluation(1, 2))
  })
})

describe('Evaluation equality', () => {
  it('checks actualCount and possibleCount', () => {
    expect(new Evaluation(1, 2)).toEqual(new Evaluation(1, 2))
  })
})
