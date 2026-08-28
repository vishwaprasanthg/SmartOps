/**
 * Comprehensive Validation Utilities for UPS Operational Intelligence
 * Feature 01: Volume Forecasting with Chronos-2
 */

/**
 * Validates whether a date string is a real calendar date in YYYY-MM-DD format.
 */
function isValidCalendarDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * Generates an array of date strings [YYYY-MM-DD] between fromDate and toDate inclusive.
 */
function getDatesBetween(fromDateStr, toDateStr) {
  const dates = [];
  const curr = new Date(fromDateStr + 'T00:00:00Z');
  const end = new Date(toDateStr + 'T00:00:00Z');

  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}

/**
 * Validates request payload for POST /api/forecast (Chronos-2 Volume Forecasting)
 */
function validateForecastRequest(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a JSON object.' };
  }

  const { fromDate, toDate, historicalData, allowPastForecastForTesting } = body;

  // 1. Validate From Date
  if (!fromDate || typeof fromDate !== 'string' || !isValidCalendarDate(fromDate.trim())) {
    return {
      isValid: false,
      error: `Invalid or missing From Date '${fromDate}'. Must be a valid date in YYYY-MM-DD format.`
    };
  }

  // 2. Validate To Date
  if (!toDate || typeof toDate !== 'string' || !isValidCalendarDate(toDate.trim())) {
    return {
      isValid: false,
      error: `Invalid or missing To Date '${toDate}'. Must be a valid date in YYYY-MM-DD format.`
    };
  }

  const cleanFromDate = fromDate.trim();
  const cleanToDate = toDate.trim();

  // 3. From Date <= To Date
  if (cleanFromDate > cleanToDate) {
    return {
      isValid: false,
      error: `To Date (${cleanToDate}) must be greater than or equal to From Date (${cleanFromDate}).`
    };
  }

  // 4. Future Date Check (relative to today's date)
  if (!allowPastForecastForTesting) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (cleanFromDate < todayStr) {
      return {
        isValid: false,
        error: `Forecast dates must be in the future. From Date (${cleanFromDate}) is in the past.`
      };
    }
  }

  // 5. Validate Historical Data
  if (!historicalData || !Array.isArray(historicalData)) {
    return {
      isValid: false,
      error: 'Historical data array is required.'
    };
  }

  if (historicalData.length === 0) {
    return {
      isValid: false,
      error: 'Historical data cannot be empty. Please provide uploaded CSV records.'
    };
  }

  const seenDates = new Set();
  const sanitizedHistory = [];

  for (let i = 0; i < historicalData.length; i++) {
    const row = historicalData[i];
    const rowNum = i + 1;

    if (!row || typeof row !== 'object') {
      return { isValid: false, error: `Row ${rowNum}: Invalid record structure.` };
    }

    if (!row.date || typeof row.date !== 'string' || !isValidCalendarDate(row.date.trim())) {
      return { isValid: false, error: `Row ${rowNum}: Invalid or missing date '${row.date}'. Expected YYYY-MM-DD.` };
    }

    const cleanDate = row.date.trim();
    if (seenDates.has(cleanDate)) {
      return { isValid: false, error: `Duplicate historical date detected: ${cleanDate}.` };
    }
    seenDates.add(cleanDate);

    // Inbound
    if (row.inbound === undefined || row.inbound === null || row.inbound === '') {
      return { isValid: false, error: `Row ${rowNum}: inbound volume is missing.` };
    }
    const inboundNum = typeof row.inbound === 'number' ? row.inbound : Number(String(row.inbound).trim());
    if (isNaN(inboundNum) || !isFinite(inboundNum)) {
      return { isValid: false, error: `Row ${rowNum}: inbound volume must be a valid number.` };
    }
    if (inboundNum < 0) {
      return { isValid: false, error: `Row ${rowNum}: inbound volume cannot be negative (${inboundNum}).` };
    }

    // Outbound
    if (row.outbound === undefined || row.outbound === null || row.outbound === '') {
      return { isValid: false, error: `Row ${rowNum}: outbound volume is missing.` };
    }
    const outboundNum = typeof row.outbound === 'number' ? row.outbound : Number(String(row.outbound).trim());
    if (isNaN(outboundNum) || !isFinite(outboundNum)) {
      return { isValid: false, error: `Row ${rowNum}: outbound volume must be a valid number.` };
    }
    if (outboundNum < 0) {
      return { isValid: false, error: `Row ${rowNum}: outbound volume cannot be negative (${outboundNum}).` };
    }

    // Inventory
    if (row.inventory === undefined || row.inventory === null || row.inventory === '') {
      return { isValid: false, error: `Row ${rowNum}: inventory volume is missing.` };
    }
    const inventoryNum = typeof row.inventory === 'number' ? row.inventory : Number(String(row.inventory).trim());
    if (isNaN(inventoryNum) || !isFinite(inventoryNum)) {
      return { isValid: false, error: `Row ${rowNum}: inventory volume must be a valid number.` };
    }
    if (inventoryNum < 0) {
      return { isValid: false, error: `Row ${rowNum}: inventory cannot be negative (${inventoryNum}).` };
    }

    sanitizedHistory.push({
      date: cleanDate,
      inbound: inboundNum,
      outbound: outboundNum,
      inventory: inventoryNum
    });
  }

  // Sort history chronologically
  sanitizedHistory.sort((a, b) => a.date.localeCompare(b.date));

  const maxHistoricalDate = sanitizedHistory[sanitizedHistory.length - 1].date;

  // 6. Forecast period must start AFTER the latest historical date
  if (cleanFromDate <= maxHistoricalDate) {
    return {
      isValid: false,
      error: `Forecast period must start after the latest historical date (${maxHistoricalDate}).`
    };
  }

  return {
    isValid: true,
    sanitized: {
      fromDate: cleanFromDate,
      toDate: cleanToDate,
      historicalData: sanitizedHistory,
      horizon: getDatesBetween(cleanFromDate, cleanToDate).length,
      forecastDates: getDatesBetween(cleanFromDate, cleanToDate)
    }
  };
}

module.exports = {
  isValidCalendarDate,
  getDatesBetween,
  validateForecastRequest
};
