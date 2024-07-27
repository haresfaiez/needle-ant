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
    {'actual':1,'possible':2,'raw':{'actual':['x'],'possible':['getUberMetrics','x'],'source':'x'},'source':'x'},
    {'actual':1,'possible':3,'raw':{'actual':['getUberMetrics'],'possible':['getUberMetrics','MetricTraceEvents','uberMetrics'],'source':'getUberMetrics'},'source':'getUberMetrics'},
    {'actual':1,'possible':4,'raw':{'actual':['this'],'possible':['getUberMetrics','MetricTraceEvents','uberMetrics','this'],'source':'this'},'source':'this'},
    {'actual':1,'possible':3,'raw':{'actual':['_auditResults'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults'],'source':'_auditResults'},'source':'_auditResults'},
    {'actual':1,'possible':3,'raw':{'actual':['uberMetrics'],'possible':['getUberMetrics','MetricTraceEvents','uberMetrics'],'source':'uberMetrics'},'source':'uberMetrics'},
    {'actual':1,'possible':3,'raw':{'actual':['uberMetrics'],'possible':['getUberMetrics','MetricTraceEvents','uberMetrics'],'source':'uberMetrics'},'source':'uberMetrics'},
    {'actual':1,'possible':5,'raw':{'actual':['MetricTraceEvents'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics'],'source':'MetricTraceEvents'},'source':'MetricTraceEvents'},
    {'actual':1,'possible':4,'raw':{'actual':['metricsDefinitions'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions'],'source':'metricsDefinitions'},'source':'metricsDefinitions'},
    {'actual':1,'possible':5,'raw':{'actual':['forEach'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach'],'source':'forEach'},'source':'forEach'},
    {'actual':1,'possible':7,'raw':{'actual':['uberMetrics'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'uberMetrics'},'source':'uberMetrics'},
    {'actual':1,'possible':7,'raw':{'actual':['metric'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'metric'},'source':'metric'},
    {'actual':1,'possible':6,'raw':{'actual':['tsKey'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey'],'source':'tsKey'},'source':'tsKey'},
    {'actual':1,'possible':7,'raw':{'actual':['ts'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'ts'},'source':'ts'},
    {'actual':1,'possible':7,'raw':{'actual':['undefined'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'undefined'},'source':'undefined'},
    {'actual':1,'possible':7,'raw':{'actual':['log'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'log'},'source':'log'},
    {'actual':1,'possible':7,'raw':{'actual':['error'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error'],'source':'error'},'source':'error'},
    {'actual':1,'possible':8,'raw':{'actual':[1],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts',1],'source':'\'pwmetrics-events\''},'source':'\'pwmetrics-events\''},
    {'actual':1,'possible':7,'raw':{'actual':['metric'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'metric'},'source':'metric'},
    {'actual':1,'possible':8,'raw':{'actual':['name'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name'],'source':'name'},'source':'name'},
    {'actual':1,'possible':8,'raw':{'actual':[1],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts',1],'source':'\'timestamp not found\''},'source':'\'timestamp not found\''},
    {'actual':1,'possible':7,'raw':{'actual':['resolvedMetrics'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'resolvedMetrics'},'source':'resolvedMetrics'},
    {'actual':1,'possible':9,'raw':{'actual':['push'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push'],'source':'push'},'source':'push'},
    {'actual':1,'possible':7,'raw':{'actual':['metric'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'metric'},'source':'metric'},
    {'actual':1,'possible':11,'raw':{'actual':['id'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts'],'source':'id'},'source':'id'},
    {'actual':1,'possible':7,'raw':{'actual':['metric'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'metric'},'source':'metric'},
    {'actual':1,'possible':11,'raw':{'actual':['name'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts'],'source':'name'},'source':'name'},
    {'actual':1,'possible':7,'raw':{'actual':['ts'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','metric','ts'],'source':'ts'},'source':'ts'},
    {'actual':1,'possible':6,'raw':{'actual':['metrics'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric'],'source':'metrics'},'source':'metrics'},
    {'actual':1,'possible':12,'raw':{'actual':['find'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts','find'],'source':'find'},'source':'find'},
    {'actual':1,'possible':7,'raw':{'actual':['e'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','e'],'source':'e'},'source':'e'},
    {'actual':1,'possible':12,'raw':{'actual':['id'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts','find'],'source':'id'},'source':'id'},
    {'actual':1,'possible':8,'raw':{'actual':[1],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','e',1],'source':'\'timeorigin\''},'source':'\'timeorigin\''},
    {'actual':1,'possible':6,'raw':{'actual':['timeOriginMetric'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric'],'source':'timeOriginMetric'},'source':'timeOriginMetric'},
    {'actual':1,'possible':7,'raw':{'actual':[1],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric',1],'source':'\'timeorigin Metric not found in definitions\''},'source':'\'timeorigin Metric not found in definitions\''},
    {'actual':1,'possible':7,'raw':{'actual':['TraceProcessor'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','frameIds'],'source':'TraceProcessor'},'source':'TraceProcessor'},
    {'actual':1,'possible':14,'raw':{'actual':['findMainFrameIds'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts','find','errorMessage','findMainFrameIds'],'source':'findMainFrameIds'},'source':'findMainFrameIds'},
    {'actual':1,'possible':8,'raw':{'actual':['this'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','frameIds','this'],'source':'this'},'source':'this'},
    {'actual':1,'possible':15,'raw':{'actual':['_traceEvents'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts','find','errorMessage','findMainFrameIds','_traceEvents'],'source':'_traceEvents'},'source':'_traceEvents'},
    {'actual':1,'possible':7,'raw':{'actual':['frameIds'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','frameIds'],'source':'frameIds'},'source':'frameIds'},
    {'actual':1,'possible':18,'raw':{'actual':['startingPid'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts','find','errorMessage','findMainFrameIds','_traceEvents','pid','tid','startingPid'],'source':'startingPid'},'source':'startingPid'},
    {'actual':1,'possible':8,'raw':{'actual':[1],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','frameIds',1],'source':'1'},'source':'1'},
    {'actual':1,'possible':7,'raw':{'actual':['timeOriginMetric'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','frameIds'],'source':'timeOriginMetric'},'source':'timeOriginMetric'},
    {'actual':1,'possible':18,'raw':{'actual':['ts'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts','find','errorMessage','findMainFrameIds','_traceEvents','pid','tid','startingPid'],'source':'ts'},'source':'ts'},
    {'actual':1,'possible':7,'raw':{'actual':['err'],'possible':['getUberMetrics','MetricTraceEvents','metrics','uberMetrics','resolvedMetrics','timeOriginMetric','err'],'source':'err'},'source':'err'},
    {'actual':1,'possible':19,'raw':{'actual':['message'],'possible':['gatherMetrics','getTimeOriginEvt','_auditResults','metricsDefinitions','forEach','tsKey','error','name','push','id','ts','find','errorMessage','findMainFrameIds','_traceEvents','pid','tid','startingPid','message'],'source':'message'},'source':'message'}
  ]
}
  