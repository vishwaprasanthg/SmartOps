/**
 * Operations Trend Calculator
 * Feature 04: Operations Efficiency Dashboard
 * 
 * Deterministic daily time-series aggregation and trend direction evaluation.
 */

/**
 * Calculates daily trend metrics and trend directions.
 * 
 * @param {Array<object>} records Sanitized operational records
 * @returns {object} { trends: Array<object>, trendDirections: object, latestTrend: object }
 */
function calculateOperationsTrends(records) {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return {
      trends: [],
      trendDirections: {},
      latestTrend: { metric: 'capacityUtilizationPercent', direction: 'STABLE' }
    };
  }

  // 1. Group and aggregate records by date
  const dateMap = new Map();

  for (const r of records) {
    const d = r.date;
    if (!dateMap.has(d)) {
      dateMap.set(d, {
        date: d,
        inbound: 0,
        outbound: 0,
        processed: 0,
        availableCapacity: 0,
        totalWorkerHours: 0,
        onTimeProcessed: 0,
        exceptions: 0
      });
    }

    const curr = dateMap.get(d);
    curr.inbound += Number(r.inbound || 0);
    curr.outbound += Number(r.outbound || 0);
    curr.processed += Number(r.processed || 0);
    curr.availableCapacity += Number(r.availableCapacity || 0);
    curr.totalWorkerHours += Number(r.availableWorkers || 0) * Number(r.workingHours || 0);
    curr.onTimeProcessed += Number(r.onTimeProcessed || 0);
    curr.exceptions += Number(r.exceptions || 0);
  }

  // 2. Sort chronologically by date ascending
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => a.localeCompare(b));

  // 3. Compute daily metrics for each date
  const trends = sortedDates.map(dateStr => {
    const d = dateMap.get(dateStr);

    let capacityUtilizationPercent = 0;
    if (d.availableCapacity > 0) {
      capacityUtilizationPercent = Math.round(((d.processed / d.availableCapacity) * 100) * 100) / 100;
    }

    let throughput = 0;
    if (d.totalWorkerHours > 0) {
      throughput = Math.round((d.processed / d.totalWorkerHours) * 100) / 100;
    }

    let onTimeRatePercent = 0;
    if (d.processed > 0) {
      onTimeRatePercent = Math.round(((d.onTimeProcessed / d.processed) * 100) * 100) / 100;
    }

    let exceptionRatePercent = 0;
    if (d.processed > 0) {
      exceptionRatePercent = Math.round(((d.exceptions / d.processed) * 100) * 10000) / 10000;
    }

    return {
      date: dateStr,
      inbound: Math.round(d.inbound),
      outbound: Math.round(d.outbound),
      processed: Math.round(d.processed),
      availableCapacity: Math.round(d.availableCapacity),
      workerHours: Math.round(d.totalWorkerHours * 100) / 100,
      capacityUtilizationPercent,
      throughput,
      workforceProductivity: throughput,
      onTimeRatePercent,
      exceptionRatePercent
    };
  });

  // 4. Compute trend directions by comparing latest vs previous
  const metrics = [
    'inbound',
    'outbound',
    'processed',
    'capacityUtilizationPercent',
    'throughput',
    'workforceProductivity',
    'onTimeRatePercent',
    'exceptionRatePercent'
  ];

  const trendDirections = {};

  if (trends.length >= 2) {
    const prev = trends[trends.length - 2];
    const latest = trends[trends.length - 1];

    metrics.forEach(m => {
      const prevVal = prev[m];
      const latestVal = latest[m];

      if (m === 'exceptionRatePercent') {
        // Lower is better
        if (latestVal < prevVal) {
          trendDirections[m] = 'IMPROVING';
        } else if (latestVal > prevVal) {
          trendDirections[m] = 'DECLINING';
        } else {
          trendDirections[m] = 'STABLE';
        }
      } else {
        // Higher is better
        if (latestVal > prevVal) {
          trendDirections[m] = 'IMPROVING';
        } else if (latestVal < prevVal) {
          trendDirections[m] = 'DECLINING';
        } else {
          trendDirections[m] = 'STABLE';
        }
      }
    });
  } else {
    metrics.forEach(m => {
      trendDirections[m] = 'STABLE';
    });
  }

  return {
    trends,
    trendDirections,
    latestTrend: {
      metric: 'capacityUtilizationPercent',
      direction: trendDirections.capacityUtilizationPercent || 'STABLE'
    }
  };
}

module.exports = {
  calculateOperationsTrends
};
