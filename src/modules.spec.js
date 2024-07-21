import lighthouse from '../spec/fixtures/lighthouse.js'
import NeedleAnt from './NeedleAnt.js'
import { NumericEvaluation, NullEvaluation } from './Evalution.js'
import metricTraceEvents from '../spec/fixtures/metricTraceEvents.js'

describe('Module entropy', () => {
  it('calculates entropy of one function defintion', () => {
    const actual = new NeedleAnt(lighthouse.code).entropy()

    const expected = lighthouse
      .expected
      .reduce(
        (acc, e) =>acc.plus(new NumericEvaluation(e.actual, e.possible, e.source)),
        new NullEvaluation()
      )
    expect(actual.evaluate()).toEvaluateTo(expected)
  })

  // TODO: turn-on and fix these
  xit('calculates entropy of class definition', () => {
    const actual = new NeedleAnt(metricTraceEvents.code).entropy()

    const expected = metricTraceEvents
      .expected
      .reduce(
        (acc, e) =>acc.plus(new NumericEvaluation(e.actual, e.possible, e.source)),
        new NullEvaluation()
      )
    expect(actual.evaluate()).toEvaluateTo(expected)
  })

  // TODO: turn-on and fix these
  xit('', () => {
    const code = `
    class MetricTraceEvents {
        gatherMetrics() {
        const uberMetrics = getUberMetrics(this._auditResults);
        if (!uberMetrics) {
            return [];
        }

        return uberMetrics;
        }

        getTimeOriginEvt(metrics, uberMetrics) {
        const resolvedMetrics = [];
        MetricTraceEvents.metricsDefinitions.forEach(metric => {
            const ts = uberMetrics[metric.tsKey];
            if (ts === undefined) {
            log.error('pwmetrics-events', ` + '`${metric.name} timestamp not found`' + `);
            return;
            }

            resolvedMetrics.push({
            id: metric.id,
            name: metric.name,
            ts,
            });
        });

        const timeOriginMetric = metrics.find(e => e.id === 'timeorigin');
        if (!timeOriginMetric) return {errorMessage: 'timeorigin Metric not found in definitions'};
        try {
            const frameIds = TraceProcessor.findMainFrameIds(this._traceEvents);
            return {pid: frameIds.startingPid, tid: 1, ts: timeOriginMetric.ts};
        } catch (err) {
            return {errorMessage: err.message};
        }
        }
    }
    `
    const actual = new NeedleAnt(code).entropy()

    const expected = new NumericEvaluation(2, 3)
      .plus(new NumericEvaluation(2, 3))
      .plus(new NumericEvaluation(1, 3))
      .plus(new NumericEvaluation(1, 3))
    expect(actual.evaluate()).toEvaluateTo(expected)
  })
})
  