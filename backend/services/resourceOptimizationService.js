/**
 * Resource Optimization Service
 * Feature 03
 */

const { optimizeResources } = require('../ml/resourceOptimizer');

/**
 * Executes resource optimization workflow.
 * 
 * @param {object} params Validated resource optimization request
 * @returns {object} Structured resource optimization result
 */
function processResourceOptimization(params) {
  const { planningDate, facility, forecastedVolume, resources } = params;

  const result = optimizeResources(resources);

  return {
    planningDate,
    facility,
    forecastedVolume,
    ...result
  };
}

module.exports = {
  processResourceOptimization
};
