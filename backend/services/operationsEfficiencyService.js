/**
 * Operations Efficiency Service
 * Feature 04
 */

const { calculateOperationsKpis } = require('../ml/operationsKpiCalculator');
const { calculateOperationsTrends } = require('../ml/operationsTrendCalculator');

/**
 * Processes operational data to generate KPIs, status, and daily trends.
 * 
 * @param {object} params Validated request payload
 * @returns {object} Full operations efficiency analysis
 */
function processOperationsEfficiency(params) {
  const { facility, startDate, endDate, records } = params;

  // 1. Calculate Aggregate KPIs & Status
  const kpiResult = calculateOperationsKpis(records);

  // 2. Calculate Daily Trends & Direction
  const trendResult = calculateOperationsTrends(records);

  return {
    facility,
    startDate,
    endDate,
    daysCount: trendResult.trends.length,
    summary: kpiResult.summary,
    status: kpiResult.status,
    trends: trendResult.trends,
    trendDirections: trendResult.trendDirections,
    latestTrend: trendResult.latestTrend
  };
}

module.exports = {
  processOperationsEfficiency
};
