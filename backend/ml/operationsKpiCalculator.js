/**
 * Operations KPI Calculator
 * Feature 04: Operations Efficiency Dashboard
 * 
 * Deterministic calculation of aggregated operational KPIs and status evaluations.
 */

/**
 * Calculates aggregate KPIs and health status from operational records.
 * 
 * @param {Array<object>} records Sanitized operational records
 * @returns {object} Summary KPIs and Status evaluations
 */
function calculateOperationsKpis(records) {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return {
      summary: {
        totalInbound: 0,
        totalOutbound: 0,
        totalProcessed: 0,
        totalCapacity: 0,
        totalWorkerHours: 0,
        totalOnTimeProcessed: 0,
        totalExceptions: 0,
        capacityUtilizationPercent: 0,
        throughput: 0,
        workforceProductivity: 0,
        onTimeRatePercent: 0,
        exceptionRatePercent: 0
      },
      status: {
        capacityUtilization: 'LOW',
        onTimeRate: 'CRITICAL',
        exceptionRate: 'HEALTHY'
      }
    };
  }

  let totalInbound = 0;
  let totalOutbound = 0;
  let totalProcessed = 0;
  let totalCapacity = 0;
  let totalWorkerHours = 0;
  let totalOnTimeProcessed = 0;
  let totalExceptions = 0;

  for (const r of records) {
    totalInbound += Number(r.inbound || 0);
    totalOutbound += Number(r.outbound || 0);
    totalProcessed += Number(r.processed || 0);
    totalCapacity += Number(r.availableCapacity || 0);
    const workerHours = Number(r.availableWorkers || 0) * Number(r.workingHours || 0);
    totalWorkerHours += workerHours;
    totalOnTimeProcessed += Number(r.onTimeProcessed || 0);
    totalExceptions += Number(r.exceptions || 0);
  }

  // 1. Capacity Utilization = (Total Processed / Total Capacity) * 100
  let capacityUtilizationPercent = 0;
  if (totalCapacity > 0) {
    capacityUtilizationPercent = Math.round(((totalProcessed / totalCapacity) * 100) * 100) / 100;
  }

  // Capacity Status Thresholds:
  // < 70% -> LOW
  // 70% - 90% -> HEALTHY
  // > 90% -> HIGH
  let capacityStatus = 'LOW';
  if (capacityUtilizationPercent < 70) {
    capacityStatus = 'LOW';
  } else if (capacityUtilizationPercent <= 90) {
    capacityStatus = 'HEALTHY';
  } else {
    capacityStatus = 'HIGH';
  }

  // 2. Throughput / Workforce Productivity = Total Processed / Total Worker Hours
  let throughput = 0;
  if (totalWorkerHours > 0) {
    throughput = Math.round((totalProcessed / totalWorkerHours) * 100) / 100;
  }
  const workforceProductivity = throughput;

  // 3. On-Time Processing Rate = (Total On-Time / Total Processed) * 100
  let onTimeRatePercent = 0;
  if (totalProcessed > 0) {
    onTimeRatePercent = Math.round(((totalOnTimeProcessed / totalProcessed) * 100) * 100) / 100;
  }

  // On-Time Status Thresholds:
  // >= 95% -> HEALTHY
  // 90% - 94.99% -> WARNING
  // < 90% -> CRITICAL
  let onTimeStatus = 'CRITICAL';
  if (totalProcessed === 0) {
    onTimeStatus = 'HEALTHY';
  } else if (onTimeRatePercent >= 95) {
    onTimeStatus = 'HEALTHY';
  } else if (onTimeRatePercent >= 90) {
    onTimeStatus = 'WARNING';
  } else {
    onTimeStatus = 'CRITICAL';
  }

  // 4. Exception Rate = (Total Exceptions / Total Processed) * 100
  let exceptionRatePercent = 0;
  if (totalProcessed > 0) {
    exceptionRatePercent = Math.round(((totalExceptions / totalProcessed) * 100) * 10000) / 10000;
  }

  // Exception Status Thresholds:
  // <= 1% -> HEALTHY
  // > 1% and <= 3% -> WARNING
  // > 3% -> CRITICAL
  let exceptionStatus = 'HEALTHY';
  if (totalProcessed === 0) {
    exceptionStatus = 'HEALTHY';
  } else if (exceptionRatePercent <= 1) {
    exceptionStatus = 'HEALTHY';
  } else if (exceptionRatePercent <= 3) {
    exceptionStatus = 'WARNING';
  } else {
    exceptionStatus = 'CRITICAL';
  }

  return {
    summary: {
      totalInbound: Math.round(totalInbound),
      totalOutbound: Math.round(totalOutbound),
      totalProcessed: Math.round(totalProcessed),
      totalCapacity: Math.round(totalCapacity),
      totalWorkerHours: Math.round(totalWorkerHours * 100) / 100,
      totalOnTimeProcessed: Math.round(totalOnTimeProcessed),
      totalExceptions: Math.round(totalExceptions),
      capacityUtilizationPercent,
      throughput,
      workforceProductivity,
      onTimeRatePercent,
      exceptionRatePercent
    },
    status: {
      capacityUtilization: capacityStatus,
      onTimeRate: onTimeStatus,
      exceptionRate: exceptionStatus
    }
  };
}

module.exports = {
  calculateOperationsKpis
};
