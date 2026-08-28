/**
 * Workforce Planning Controller
 * Feature 02
 */

const { validateWorkforceRequest } = require('../utils/workforceValidator');
const { processWorkforcePlanning } = require('../services/workforceService');
const { getFacilityByName, createWorkforcePlan } = require('../services/supabaseService');

/**
 * POST /api/workforce/calculate
 */
async function handleWorkforceCalculation(req, res) {
  try {
    const validation = validateWorkforceRequest(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const result = processWorkforcePlanning(validation.sanitized);

    // Persist plan to Supabase
    try {
      const facility = await getFacilityByName(validation.sanitized.facility || 'Demo Hub');
      await createWorkforcePlan(facility ? facility.id : null, {
        planningDate: validation.sanitized.planningDate,
        totalVolume: result.summary.totalVolume,
        availableWorkers: validation.sanitized.availableWorkers,
        requiredWorkers: result.summary.requiredWorkers,
        workerGap: result.summary.workerGap,
        utilizationPercentage: result.summary.laborUtilizationPercent,
        status: result.status.code
      });
    } catch (dbErr) {
      // Safe non-blocking log
    }

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Workforce calculation error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while calculating workforce requirements.'
    });
  }
}

module.exports = {
  handleWorkforceCalculation
};
