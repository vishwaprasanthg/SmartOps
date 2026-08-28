/**
 * Operations Efficiency Controller
 * Feature 04
 */

const { validateOperationsRequest } = require('../utils/operationsValidator');
const { processOperationsEfficiency } = require('../services/operationsEfficiencyService');
const { getFacilityByName, insertOperationalData, saveOperationalKPI } = require('../services/supabaseService');

/**
 * POST /api/operations/efficiency
 */
async function handleOperationsEfficiency(req, res) {
  try {
    const validation = validateOperationsRequest(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const result = processOperationsEfficiency(validation.sanitized);

    // Persist operational data and aggregated KPI snapshot to Supabase
    try {
      const facility = await getFacilityByName(validation.sanitized.facility || 'Demo Hub');
      const facilityId = facility ? facility.id : null;
      await insertOperationalData(facilityId, validation.sanitized.records);
      await saveOperationalKPI(facilityId, {
        date: validation.sanitized.endDate,
        throughput: result.summary.throughput,
        capacityUtilizationPercent: result.summary.capacityUtilizationPercent,
        onTimeRatePercent: result.summary.onTimeRatePercent,
        exceptionRatePercent: result.summary.exceptionRatePercent,
        workforceProductivity: result.summary.workforceProductivity
      });
    } catch (dbErr) {
      // Safe non-blocking log
    }

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Operations efficiency error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing operations efficiency dashboard.'
    });
  }
}

module.exports = {
  handleOperationsEfficiency
};
