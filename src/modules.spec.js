import lighthouse from '../spec/fixtures/lighthouse.js'
import NeedleAnt from './NeedleAnt.js'
import { NumericEvaluation } from './evaluation/NumericEvaluation.js'
import { NullEvaluation } from './evaluation/NullEvaluation.js'
import metricTraceEvents from '../spec/fixtures/metricTraceEvents.js'
import fullMetricTraceEvents from '../spec/fixtures/fullMetricTraceEvents.js'

const buildExpected = (expected) =>
  expected
    .reduce(
      (acc, e) =>acc.plus(new NumericEvaluation(e.actual, e.possible, e.source)),
      new NullEvaluation()
    )

describe('Module entropy', () => {
  it('calculates entropy of one function defintion', () => {
    const actual = new NeedleAnt(lighthouse.code).entropy()

    const expected = buildExpected(lighthouse.expected)
    expect(actual.evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class definition', () => {
    const actual = new NeedleAnt(metricTraceEvents.code).entropy()

    const expected = buildExpected(metricTraceEvents.expected)
    expect(actual.evaluate()).toEvaluateTo(expected)
  })

  it('calculates entropy of class definition with two methods', () => {
    const actual = new NeedleAnt(fullMetricTraceEvents.code).entropy()

    const expected = buildExpected(fullMetricTraceEvents.expected)
    expect(actual.evaluate()).toEvaluateTo(expected)
  })
})
  