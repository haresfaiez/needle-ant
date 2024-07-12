// BASED ON: https://github.com/GoogleChrome/lighthouse/blob/main/core/lib/traces/metric-trace-events.js
export default {
  code: `
    import log from 'lighthouse-logger';
    import {TraceProcessor} from '../tracehouse/trace-processor.js';

    function getUberMetrics(auditResults) {
      const metricsAudit = auditResults.metrics;
      if (!metricsAudit || !metricsAudit.details || !('items' in metricsAudit.details))
        return;

      return metricsAudit.details.items[0];
    }
  `,
  expected: [
    {'actual':1,'possible':1,'source':'import log from\'lighthouse-logger\';'},
    {'actual':1,'possible':2,'source':'import{TraceProcessor}from\'../tracehouse/trace-processor.js\';'},
    {'actual':1,'possible':5,'source':'auditResults'},
    {'actual':1,'possible':1,'source':'metrics'},
    {'actual':1,'possible':5,'source':'metricsAudit'},
    {'actual':1,'possible':5,'source':'metricsAudit'},
    {'actual':1,'possible':2,'source':'details'},
    {'actual':1,'possible':6,'source':'\'items\''},
    {'actual':1,'possible':5,'source':'metricsAudit'},
    {'actual':1,'possible':2,'source':'details'},
    {'actual':1,'possible':5,'source':'metricsAudit'},
    {'actual':1,'possible':2,'source':'details'},
    {'actual':1,'possible':3,'source':'items'},
    {'actual':1,'possible':6,'source':'0'}
  ]
}
