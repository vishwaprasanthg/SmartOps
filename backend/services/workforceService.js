/**
 * Workforce Planning Service
 * Feature 02
 */

const { calculateWorkforce } = require('../ml/workforceCalculator');

/**
 * Orchestrates workforce calculation.
 * 
 * @param {object} params Validated workforce inputs
 * @returns {object} Structured result payload
 */
function processWorkforcePlanning(params) {
  const {
    planningDate,
    facility,
    inboundVolume,
    outboundVolume,
    availableWorkers,
    hoursPerWorker,
    inboundProductivity,
    outboundProductivity,
    staffingBufferPercent
  } = params;

  const result = calculateWorkforce({
    inboundVolume,
    outboundVolume,
    availableWorkers,
    hoursPerWorker,
    inboundProductivity,
    outboundProductivity,
    staffingBufferPercent
  });

  return {
    planningDate,
    facility,
    inputs: {
      inboundVolume,
      outboundVolume,
      availableWorkers,
      hoursPerWorker,
      inboundProductivity,
      outboundProductivity,
      staffingBufferPercent
    },
    ...result
  };
}

module.exports = {
  processWorkforcePlanning
};
