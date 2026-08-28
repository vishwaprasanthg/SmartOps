/**
 * Input Validator for Operations Efficiency Dashboard API
 * Feature 04
 */

const { isValidCalendarDate } = require('./validator');

/**
 * Validates the operations efficiency request payload.
 */
function validateOperationsRequest(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object.' };
  }

  const { facility, startDate, endDate, records } = body;

  // 1. Facility
  if (!facility || typeof facility !== 'string' || !facility.trim()) {
    return { isValid: false, error: 'Facility is required.' };
  }

  // 2. Start Date
  if (!startDate || typeof startDate !== 'string' || !isValidCalendarDate(startDate.trim())) {
    return {
      isValid: false,
      error: `Invalid or missing start date '${startDate}'. Must be a valid date in YYYY-MM-DD format.`
    };
  }

  // 3. End Date
  if (!endDate || typeof endDate !== 'string' || !isValidCalendarDate(endDate.trim())) {
    return {
      isValid: false,
      error: `Invalid or missing end date '${endDate}'. Must be a valid date in YYYY-MM-DD format.`
    };
  }

  const cleanStartDate = startDate.trim();
  const cleanEndDate = endDate.trim();

  // 4. Start Date <= End Date
  if (cleanStartDate > cleanEndDate) {
    return {
      isValid: false,
      error: `Start date '${cleanStartDate}' cannot be after end date '${cleanEndDate}'.`
    };
  }

  // 5. Records Array
  if (!records || !Array.isArray(records)) {
    return {
      isValid: false,
      error: 'Records array is required and must contain at least 1 operational record.'
    };
  }

  if (records.length === 0) {
    return {
      isValid: false,
      error: 'Records array cannot be empty. Please provide at least 1 operational record.'
    };
  }

  const sanitizedRecords = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r || typeof r !== 'object') {
      return { isValid: false, error: `Record at row ${i + 1} must be an object with operational metrics.` };
    }

    // Date
    if (!r.date || typeof r.date !== 'string' || !isValidCalendarDate(r.date.trim())) {
      return { isValid: false, error: `Row ${i + 1}: Invalid or missing date '${r.date}'. Must be in YYYY-MM-DD format.` };
    }
    const cleanDate = r.date.trim();

    // Inbound Volume (>= 0)
    if (r.inbound === null || r.inbound === undefined || r.inbound === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Inbound volume is required.` };
    }
    const inboundNum = typeof r.inbound === 'number' ? r.inbound : Number(String(r.inbound).trim());
    if (isNaN(inboundNum) || !isFinite(inboundNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Inbound volume must be a valid number.` };
    }
    if (inboundNum < 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Inbound volume cannot be negative (${inboundNum}).` };
    }

    // Outbound Volume (>= 0)
    if (r.outbound === null || r.outbound === undefined || r.outbound === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Outbound volume is required.` };
    }
    const outboundNum = typeof r.outbound === 'number' ? r.outbound : Number(String(r.outbound).trim());
    if (isNaN(outboundNum) || !isFinite(outboundNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Outbound volume must be a valid number.` };
    }
    if (outboundNum < 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Outbound volume cannot be negative (${outboundNum}).` };
    }

    // Processed Volume (>= 0)
    if (r.processed === null || r.processed === undefined || r.processed === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Processed volume is required.` };
    }
    const processedNum = typeof r.processed === 'number' ? r.processed : Number(String(r.processed).trim());
    if (isNaN(processedNum) || !isFinite(processedNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Processed volume must be a valid number.` };
    }
    if (processedNum < 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Processed volume cannot be negative (${processedNum}).` };
    }

    // Available Capacity (> 0)
    if (r.availableCapacity === null || r.availableCapacity === undefined || r.availableCapacity === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Available capacity is required.` };
    }
    const capNum = typeof r.availableCapacity === 'number' ? r.availableCapacity : Number(String(r.availableCapacity).trim());
    if (isNaN(capNum) || !isFinite(capNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Available capacity must be a valid number.` };
    }
    if (capNum <= 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Available capacity must be greater than zero (${capNum}).` };
    }

    // Available Workers (integer >= 0)
    if (r.availableWorkers === null || r.availableWorkers === undefined || r.availableWorkers === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Available workers is required.` };
    }
    const workersNum = typeof r.availableWorkers === 'number' ? r.availableWorkers : Number(String(r.availableWorkers).trim());
    if (isNaN(workersNum) || !isFinite(workersNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Available workers must be a valid number.` };
    }
    if (!Number.isInteger(workersNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Available workers must be an integer (whole number).` };
    }
    if (workersNum < 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Available workers cannot be negative (${workersNum}).` };
    }

    // Working Hours (> 0)
    if (r.workingHours === null || r.workingHours === undefined || r.workingHours === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Working hours is required.` };
    }
    const hoursNum = typeof r.workingHours === 'number' ? r.workingHours : Number(String(r.workingHours).trim());
    if (isNaN(hoursNum) || !isFinite(hoursNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Working hours must be a valid number.` };
    }
    if (hoursNum <= 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Working hours must be greater than zero (${hoursNum}).` };
    }

    // On-Time Processed (>= 0 and <= processed)
    if (r.onTimeProcessed === null || r.onTimeProcessed === undefined || r.onTimeProcessed === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): On-time processed volume is required.` };
    }
    const onTimeNum = typeof r.onTimeProcessed === 'number' ? r.onTimeProcessed : Number(String(r.onTimeProcessed).trim());
    if (isNaN(onTimeNum) || !isFinite(onTimeNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): On-time processed volume must be a valid number.` };
    }
    if (onTimeNum < 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): On-time processed volume cannot be negative (${onTimeNum}).` };
    }
    if (onTimeNum > processedNum) {
      return {
        isValid: false,
        error: `Row ${i + 1} (${cleanDate}): On-time processed volume (${onTimeNum}) cannot exceed total processed volume (${processedNum}).`
      };
    }

    // Exceptions (integer >= 0)
    if (r.exceptions === null || r.exceptions === undefined || r.exceptions === '') {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Exception count is required.` };
    }
    const excNum = typeof r.exceptions === 'number' ? r.exceptions : Number(String(r.exceptions).trim());
    if (isNaN(excNum) || !isFinite(excNum)) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Exception count must be a valid number.` };
    }
    if (excNum < 0) {
      return { isValid: false, error: `Row ${i + 1} (${cleanDate}): Exception count cannot be negative (${excNum}).` };
    }

    // Filter to date range
    if (cleanDate >= cleanStartDate && cleanDate <= cleanEndDate) {
      sanitizedRecords.push({
        date: cleanDate,
        inbound: inboundNum,
        outbound: outboundNum,
        processed: processedNum,
        availableCapacity: capNum,
        availableWorkers: workersNum,
        workingHours: hoursNum,
        onTimeProcessed: onTimeNum,
        exceptions: excNum
      });
    }
  }

  if (sanitizedRecords.length === 0) {
    return {
      isValid: false,
      error: `No operational records found within the selected date range (${cleanStartDate} to ${cleanEndDate}).`
    };
  }

  return {
    isValid: true,
    sanitized: {
      facility: facility.trim(),
      startDate: cleanStartDate,
      endDate: cleanEndDate,
      records: sanitizedRecords
    }
  };
}

module.exports = {
  validateOperationsRequest
};
