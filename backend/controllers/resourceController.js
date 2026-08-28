/**
 * Resource Optimization Controller
 * Feature 03
 */

const { validateResourceRequest } = require('../utils/resourceValidator');
const { processResourceOptimization } = require('../services/resourceOptimizationService');
const { getFacilityByName, saveResourceOptimization } = require('../services/supabaseService');

/**
 * POST /api/resources/optimize
 */
async function handleResourceOptimization(req, res) {
  try {
    const validation = validateResourceRequest(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const result = processResourceOptimization(validation.sanitized);

    // Persist results to Supabase
    try {
      const facility = await getFacilityByName(validation.sanitized.facility || 'Demo Hub');
      await saveResourceOptimization(facility ? facility.id : null, result.resources.map(r => ({
        ...r,
        planningDate: validation.sanitized.planningDate
      })));
    } catch (dbErr) {
      // Safe non-blocking log
    }

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Resource optimization error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing resource optimization.'
    });
  }
}

module.exports = {
  handleResourceOptimization
};
