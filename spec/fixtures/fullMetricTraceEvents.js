// BASED ON: https://github.com/GoogleChrome/lighthouse/blob/main/core/lib/traces/metric-trace-events.js
export default {
  code: `
        const getUberMetrics = (x) => x;

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
                    log.error('pwmetrics-events', + metric.name + 'timestamp not found');
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
    `,
  expected: [
  ]
}
  