// BASED ON: https://github.com/GoogleChrome/lighthouse/blob/main/core/lib/traces/metric-trace-events.js
export default {
  code: `
      class MetricTraceEvents {
        constructor(traceEvents, auditResults) {
          this._traceEvents = traceEvents;
          this._auditResults = auditResults;
        }

        static get metricsDefinitions() {
          return [
            {
              name: 'Time Origin',
              id: 'timeorigin',
              tsKey: 'observedTimeOriginTs',
            },
            {
              name: 'First Contentful Paint',
              id: 'ttfcp',
              tsKey: 'observedFirstContentfulPaintTs',
            },
          ];
        }
      }

      export {MetricTraceEvents};
  `,
  expected: [
    {'actual':1,'possible':1,'source':'import log from\'lighthouse-logger\';'},
    {'actual':1,'possible':2,'source':'import{TraceProcessor}from\'../tracehouse/trace-processor.js\';'},
    {'actual':1,'possible':4,'source':'auditResults'},
    {'actual':1,'possible':1,'source':'metrics'},
    {'actual':1,'possible':4,'source':'metricsAudit'},
    {'actual':1,'possible':4,'source':'metricsAudit'},
    {'actual':1,'possible':2,'source':'details'},
    {'actual':1,'possible':5,'source':'\'items\''},
    {'actual':1,'possible':4,'source':'metricsAudit'},
    {'actual':1,'possible':2,'source':'details'},
    {'actual':1,'possible':4,'source':'metricsAudit'},
    {'actual':1,'possible':2,'source':'details'},
    {'actual':1,'possible':3,'source':'items'},
    {'actual':1,'possible':5,'source':'0'}
  ]
}
