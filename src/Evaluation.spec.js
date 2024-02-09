import { Evaluation } from './Evalution.js'

describe('Evaluation equality', () => {
  it('checks actualCount and possibleCount', () => {
    expect(new Evaluation(1, 2)).toEqual(new Evaluation(1, 2))
  })
})
