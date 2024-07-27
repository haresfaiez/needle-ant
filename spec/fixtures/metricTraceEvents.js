// BASED ON: https://github.com/GoogleChrome/lighthouse/blob/main/core/lib/traces/metric-trace-events.js
export default {
  code: `
      let chrome;

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
            },
          ];
        }
      }

      export {MetricTraceEvents};
  `,
  expected: [
    {'actual':1, 'possible':5, 'source':'this'},
    {'actual':1, 'possible':2, 'source':'_traceEvents'},
    {'actual':1, 'possible':4, 'source':'traceEvents'},
    {'actual':1, 'possible':5, 'source':'this'},
    {'actual':1, 'possible':3, 'source':'_auditResults'},
    {'actual':1, 'possible':4, 'source':'auditResults'},
    {'actual':1, 'possible':3, 'source':'\'Time Origin\''},
    {'actual':1, 'possible':3, 'source':'\'timeorigin\''},
    {'actual':1, 'possible':2, 'source':'MetricTraceEvents'},
  ]
}
