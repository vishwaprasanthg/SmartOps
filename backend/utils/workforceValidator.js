/**
 * Input Validator for Smart Workforce Planning API
 * Feature 02
 */

const { isValidCalendarDate } = require('./validator');

/**
 * Validates workforce calculation request body.
 */
function validateWorkforceRequest(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object.' };
  }

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
  } = body;

  // 1. Planning Date
  if (!planningDate || typeof planningDate !== 'string' || !isValidCalendarDate(planningDate.trim())) {
    return {
      isValid: false,
      error: `Invalid or missing planning date '${planningDate}'. Must be a valid date in YYYY-MM-DD format.`
    };
  }

  // 2. Facility
  if (!facility || typeof facility !== 'string' || !facility.trim()) {
    return {
      isValid: false,
      error: 'Facility is required.'
    };
  }

  // Helper to validate non-empty numeric fields
  function checkNumber(val, fieldName, options = { allowZero: true, mustBeInteger: false }) {
    if (val === null || val === undefined || val === '') {
      return { valid: false, error: `${fieldName} is required.` };
    }
    const num = typeof val === 'number' ? val : Number(String(val).trim());
    if (isNaN(num) || !isFinite(num)) {
      return { valid: false, error: `${fieldName} must be a valid number.` };
    }
    if (options.mustBeInteger && !Number.isInteger(num)) {
      return { valid: false, error: `${fieldName} must be a whole number (integer). Fractional workers are not allowed.` };
    }
    if (options.allowZero) {
      if (num < 0) {
        return { valid: false, error: `${fieldName} cannot be negative (${num}).` };
      }
    } else {
      if (num <= 0) {
        return { valid: false, error: `${fieldName} must be greater than zero (${num}).` };
      }
    }
    return { valid: true, value: num };
  }

  // 3. Inbound Volume (>= 0)
  const inVolCheck = checkNumber(inboundVolume, 'Forecasted inbound volume', { allowZero: true });
  if (!inVolCheck.valid) return { isValid: false, error: inVolCheck.error };

  // 4. Outbound Volume (>= 0)
  const outVolCheck = checkNumber(outboundVolume, 'Forecasted outbound volume', { allowZero: true });
  if (!outVolCheck.valid) return { isValid: false, error: outVolCheck.error };

  // 5. Available Workers (Integer >= 0)
  const workersCheck = checkNumber(availableWorkers, 'Available workers', { allowZero: true, mustBeInteger: true });
  if (!workersCheck.valid) return { isValid: false, error: workersCheck.error };

  // 6. Working Hours per Worker (> 0)
  const hoursCheck = checkNumber(hoursPerWorker, 'Working hours per worker', { allowZero: false });
  if (!hoursCheck.valid) return { isValid: false, error: hoursCheck.error };

  // 7. Inbound Productivity (> 0)
  const inProdCheck = checkNumber(inboundProductivity, 'Inbound productivity', { allowZero: false });
  if (!inProdCheck.valid) return { isValid: false, error: inProdCheck.error };

  // 8. Outbound Productivity (> 0)
  const outProdCheck = checkNumber(outboundProductivity, 'Outbound productivity', { allowZero: false });
  if (!outProdCheck.valid) return { isValid: false, error: outProdCheck.error };

  // 9. Staffing Buffer (>= 0)
  const bufferCheck = checkNumber(staffingBufferPercent, 'Staffing buffer percentage', { allowZero: true });
  if (!bufferCheck.valid) return { isValid: false, error: bufferCheck.error };

  return {
    isValid: true,
    sanitized: {
      planningDate: planningDate.trim(),
      facility: facility.trim(),
      inboundVolume: inVolCheck.value,
      outboundVolume: outVolCheck.value,
      availableWorkers: workersCheck.value,
      hoursPerWorker: hoursCheck.value,
      inboundProductivity: inProdCheck.value,
      outboundProductivity: outProdCheck.value,
      staffingBufferPercent: bufferCheck.value
    }
  };
}

module.exports = {
  validateWorkforceRequest
};
