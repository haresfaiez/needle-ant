import { CodeBag } from './CodeBag.js'
import { NumericEvaluation, NullEvaluation, BagEvaluation } from './Evalution.js'

describe('Evaluations', () => {
  it('evaluates its members', () => {
    const aEvaluation = new BagEvaluation(
      CodeBag.withNullCoordinates(['a']),
      CodeBag.withNullCoordinates(['a', 'b']),
    )
    const abEvaluation = new BagEvaluation(
      CodeBag.withNullCoordinates(['a', 'b']),
      CodeBag.withNullCoordinates(['a', 'b', 'c', 'd']),
    )
    const identifiersEvaluation = aEvaluation.plus(abEvaluation)

    expect(identifiersEvaluation.evaluate())
      .toEqual(new NumericEvaluation(1, 2, aEvaluation).plus(new NumericEvaluation(2, 4, abEvaluation)))
  })
})

describe('BagEvaluation', () => {
  it('transfroms BagEvaluation with identifiers to NumericEvaluation with numbers', () => {
    const actualsBag = CodeBag.withNullCoordinates(['a', 'b'])
    const possiblesBag = CodeBag.withNullCoordinates(['c', 'd', 'x'])
    const rawEvaluation = new BagEvaluation(actualsBag, possiblesBag)
    expect(rawEvaluation.evaluate()).toEqual(new NumericEvaluation(2, 3, rawEvaluation))
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
