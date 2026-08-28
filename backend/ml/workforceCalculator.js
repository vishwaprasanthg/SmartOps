/**
 * Deterministic Workforce Requirement Calculator
 * Feature 02: Smart Workforce Planning
 * 
 * Mathematical Formulas:
 * 1. Inbound Labor Hours = Inbound Volume / Inbound Productivity
 * 2. Outbound Labor Hours = Outbound Volume / Outbound Productivity
 * 3. Total Labor Hours = Inbound Labor Hours + Outbound Labor Hours
 * 4. Base Required Workers = Total Labor Hours / Hours per Worker
 * 5. Required Workers = ceil(Base Required Workers * (1 + Staffing Buffer % / 100))
 * 6. Staffing Gap = Required Workers - Available Workers
 * 
 * Status Logic:
 * - Gap > 0  => UNDERSTAFFED
 * - Gap == 0 => ADEQUATELY STAFFED
 * - Gap < 0  => EXCESS CAPACITY
 */

/**
 * Generates an operational recommendation string based on gap and status.
 */
function generateRecommendation(status, staffingGap, requiredWorkers, availableWorkers) {
  if (status === 'UNDERSTAFFED') {
    return `${staffingGap} additional ${staffingGap === 1 ? 'worker is' : 'workers are'} required to handle the projected workload.`;
  }
  if (status === 'ADEQUATELY STAFFED') {
    return 'Available workforce matches the calculated requirement.';
  }
  if (status === 'EXCESS CAPACITY') {
    const excess = Math.abs(staffingGap);
    return `${excess} ${excess === 1 ? 'worker is' : 'workers are'} above the calculated requirement; consider reallocating capacity where appropriate.`;
  }
  return 'Workforce capacity is balanced.';
}

/**
 * Computes workforce requirements and capacity gap.
 * 
 * @param {object} params
 * @param {number} params.inboundVolume
 * @param {number} params.outboundVolume
 * @param {number} params.availableWorkers
 * @param {number} params.hoursPerWorker
 * @param {number} params.inboundProductivity
 * @param {number} params.outboundProductivity
 * @param {number} params.staffingBufferPercent
 * @returns {object} Calculated labor hours, worker requirements, gap, status, and recommendation.
 */
function calculateWorkforce({
  inboundVolume,
  outboundVolume,
  availableWorkers,
  hoursPerWorker,
  inboundProductivity,
  outboundProductivity,
  staffingBufferPercent
}) {
  // Safe zero workload handling: if both volumes are 0, required workers is 0
  if (inboundVolume === 0 && outboundVolume === 0) {
    const requiredWorkers = 0;
    const staffingGap = requiredWorkers - availableWorkers;
    let status = 'ADEQUATELY STAFFED';
    if (staffingGap > 0) status = 'UNDERSTAFFED';
    else if (staffingGap < 0) status = 'EXCESS CAPACITY';

    return {
      calculations: {
        inboundLaborHours: 0,
        outboundLaborHours: 0,
        totalLaborHours: 0,
        baseRequiredWorkers: 0,
        requiredWorkers: 0,
        availableWorkers,
        staffingGap
      },
      status,
      recommendation: generateRecommendation(status, staffingGap, requiredWorkers, availableWorkers)
    };
  }

  // 1. Labor hours per flow
  const inboundLaborHours = Math.round((inboundVolume / inboundProductivity) * 100) / 100;
  const outboundLaborHours = Math.round((outboundVolume / outboundProductivity) * 100) / 100;
  const totalLaborHours = Math.round((inboundLaborHours + outboundLaborHours) * 100) / 100;

  // 2. Base required workers (raw unbuffered head count)
  const baseRequiredWorkers = Math.round((totalLaborHours / hoursPerWorker) * 100) / 100;

  // 3. Required workers with buffer applied: ceil(baseRequiredWorkers * (1 + buffer / 100))
  const bufferMultiplier = 1 + (staffingBufferPercent / 100);
  const bufferedWorkersExact = baseRequiredWorkers * bufferMultiplier;
  const requiredWorkers = Math.ceil(bufferedWorkersExact);

  // 4. Staffing gap = required workers - available workers
  const staffingGap = requiredWorkers - availableWorkers;

  // 5. Operational Status
  let status = 'ADEQUATELY STAFFED';
  if (staffingGap > 0) {
    status = 'UNDERSTAFFED';
  } else if (staffingGap < 0) {
    status = 'EXCESS CAPACITY';
  }

  // 6. Actionable Recommendation
  const recommendation = generateRecommendation(status, staffingGap, requiredWorkers, availableWorkers);

  return {
    calculations: {
      inboundLaborHours,
      outboundLaborHours,
      totalLaborHours,
      baseRequiredWorkers,
      requiredWorkers,
      availableWorkers,
      staffingGap
    },
    status,
    recommendation
  };
}

module.exports = {
  calculateWorkforce,
  generateRecommendation
};
