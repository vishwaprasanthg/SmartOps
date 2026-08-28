/**
 * Input Validator for Resource Optimization Engine API
 * Feature 03
 */

const { isValidCalendarDate } = require('./validator');

/**
 * Validates resource optimization request body.
 */
function validateResourceRequest(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object.' };
  }

  const { planningDate, facility, forecastedVolume, resources } = body;

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

  // 3. Forecasted Volume (>= 0)
  let cleanForecastedVolume = 0;
  if (forecastedVolume !== undefined && forecastedVolume !== null && forecastedVolume !== '') {
    const fvNum = typeof forecastedVolume === 'number' ? forecastedVolume : Number(String(forecastedVolume).trim());
    if (isNaN(fvNum) || !isFinite(fvNum)) {
      return { isValid: false, error: 'Forecasted volume must be a valid number.' };
    }
    if (fvNum < 0) {
      return { isValid: false, error: `Forecasted volume cannot be negative (${fvNum}).` };
    }
    cleanForecastedVolume = fvNum;
  }

  // 4. Resources Array
  if (!resources || !Array.isArray(resources)) {
    return {
      isValid: false,
      error: 'Resources array is required and must contain at least 1 resource row.'
    };
  }

  if (resources.length === 0) {
    return {
      isValid: false,
      error: 'Resources list cannot be empty. Please provide at least 1 resource.'
    };
  }

  const seenResourceNames = new Set();
  const sanitizedResources = [];

  for (let i = 0; i < resources.length; i++) {
    const row = resources[i];
    if (!row || typeof row !== 'object') {
      return { isValid: false, error: `Row ${i + 1} must be an object with name, unit, required, and available capacities.` };
    }

    // Resource Name
    if (!row.name || typeof row.name !== 'string' || !row.name.trim()) {
      return { isValid: false, error: `Row ${i + 1}: Resource name is required.` };
    }
    const cleanName = row.name.trim();
    const nameLower = cleanName.toLowerCase();
    if (seenResourceNames.has(nameLower)) {
      return { isValid: false, error: `Duplicate resource name detected for '${cleanName}' at row ${i + 1}. Resource names must be unique.` };
    }
    seenResourceNames.add(nameLower);

    // Unit
    if (!row.unit || typeof row.unit !== 'string' || !row.unit.trim()) {
      return { isValid: false, error: `Row ${i + 1}: Unit is required for resource '${cleanName}'.` };
    }
    const cleanUnit = row.unit.trim();

    // Required Capacity (>= 0)
    if (row.required === null || row.required === undefined || row.required === '') {
      return { isValid: false, error: `Row ${i + 1}: Required capacity is required for '${cleanName}'.` };
    }
    const reqNum = typeof row.required === 'number' ? row.required : Number(String(row.required).trim());
    if (isNaN(reqNum) || !isFinite(reqNum)) {
      return { isValid: false, error: `Row ${i + 1}: Required capacity must be a valid number for '${cleanName}'.` };
    }
    if (reqNum < 0) {
      return { isValid: false, error: `Row ${i + 1}: Required capacity cannot be negative for '${cleanName}' (${reqNum}).` };
    }

    // Available Capacity (>= 0)
    if (row.available === null || row.available === undefined || row.available === '') {
      return { isValid: false, error: `Row ${i + 1}: Available capacity is required for '${cleanName}'.` };
    }
    const availNum = typeof row.available === 'number' ? row.available : Number(String(row.available).trim());
    if (isNaN(availNum) || !isFinite(availNum)) {
      return { isValid: false, error: `Row ${i + 1}: Available capacity must be a valid number for '${cleanName}'.` };
    }
    if (availNum < 0) {
      return { isValid: false, error: `Row ${i + 1}: Available capacity cannot be negative for '${cleanName}' (${availNum}).` };
    }

    sanitizedResources.push({
      name: cleanName,
      unit: cleanUnit,
      required: reqNum,
      available: availNum
    });
  }

  return {
    isValid: true,
    sanitized: {
      planningDate: planningDate.trim(),
      facility: facility.trim(),
      forecastedVolume: cleanForecastedVolume,
      resources: sanitizedResources
    }
  };
}

module.exports = {
  validateResourceRequest
};
