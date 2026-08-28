/**
 * CSV Parsing & Validation Service
 * Feature 01: Volume Forecasting
 */

const { isValidCalendarDate } = require('../utils/validator');

const COLUMN_ALIASES = {
  date: ['date', 'Date', 'timestamp', 'Timestamp'],
  inbound: ['inbound', 'Inbound', 'inbound_volume', 'inbound_volume_units'],
  outbound: ['outbound', 'Outbound', 'outbound_volume', 'outbound_volume_units'],
  inventory: ['inventory', 'Inventory', 'inventory_volume', 'inventory_units']
};

/**
 * Parses and validates historical operational CSV data.
 * 
 * @param {string} csvContent Raw CSV text
 * @returns {object} { isValid: boolean, data?: Array, gaps?: Array, minDate?: string, maxDate?: string, recordCount?: number, error?: string }
 */
function parseAndValidateCsv(csvContent) {
  if (!csvContent || typeof csvContent !== 'string' || !csvContent.trim()) {
    return { isValid: false, error: 'CSV file is empty or missing.' };
  }

  const lines = csvContent
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { isValid: false, error: 'CSV file is empty.' };
  }

  // 1. Parse Header
  const headerLine = lines[0];
  const rawHeaders = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  if (rawHeaders.length === 0 || rawHeaders.every(h => h === '')) {
    return { isValid: false, error: 'CSV file has no valid headers.' };
  }

  const columnIndices = {
    date: -1,
    inbound: -1,
    outbound: -1,
    inventory: -1
  };

  rawHeaders.forEach((header, index) => {
    const cleanHeader = header.toLowerCase();
    for (const [colKey, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.some(alias => alias.toLowerCase() === cleanHeader)) {
        if (columnIndices[colKey] === -1) {
          columnIndices[colKey] = index;
        }
      }
    }
  });

  // Verify all 4 required columns were matched
  const missingCols = [];
  if (columnIndices.date === -1) missingCols.push('date');
  if (columnIndices.inbound === -1) missingCols.push('inbound');
  if (columnIndices.outbound === -1) missingCols.push('outbound');
  if (columnIndices.inventory === -1) missingCols.push('inventory');

  if (missingCols.length > 0) {
    return {
      isValid: false,
      error: `Invalid CSV: required column(s) '${missingCols.join(', ')}' were not found.`
    };
  }

  if (lines.length < 2) {
    return { isValid: false, error: 'CSV contains headers but no data rows.' };
  }

  // 2. Parse Data Rows
  const parsedRecords = [];
  const seenDates = new Map();

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1; // 1-indexed for user-friendly error messages
    const rowText = lines[i];
    const cells = rowText.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

    // Check Date
    const rawDate = cells[columnIndices.date];
    if (!rawDate) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — date value is missing.` };
    }

    if (!isValidCalendarDate(rawDate)) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — invalid date format '${rawDate}'. Expected YYYY-MM-DD.` };
    }

    // Check Inbound
    const rawInbound = cells[columnIndices.inbound];
    if (rawInbound === undefined || rawInbound === '') {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — inbound value is missing.` };
    }
    const inboundNum = Number(rawInbound);
    if (isNaN(inboundNum) || !isFinite(inboundNum)) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — inbound volume must be a valid number ('${rawInbound}').` };
    }
    if (inboundNum < 0) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — inbound volume cannot be negative (${inboundNum}).` };
    }

    // Check Outbound
    const rawOutbound = cells[columnIndices.outbound];
    if (rawOutbound === undefined || rawOutbound === '') {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — outbound volume is missing.` };
    }
    const outboundNum = Number(rawOutbound);
    if (isNaN(outboundNum) || !isFinite(outboundNum)) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — outbound volume must be a valid number ('${rawOutbound}').` };
    }
    if (outboundNum < 0) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — outbound volume cannot be negative (${outboundNum}).` };
    }

    // Check Inventory
    const rawInventory = cells[columnIndices.inventory];
    if (rawInventory === undefined || rawInventory === '') {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — inventory value is missing.` };
    }
    const inventoryNum = Number(rawInventory);
    if (isNaN(inventoryNum) || !isFinite(inventoryNum)) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — inventory volume must be a valid number ('${rawInventory}').` };
    }
    if (inventoryNum < 0) {
      return { isValid: false, error: `CSV validation failed: Row ${rowNum} — inventory cannot be negative (${inventoryNum}).` };
    }

    // Check Duplicates
    if (seenDates.has(rawDate)) {
      return {
        isValid: false,
        error: `CSV validation failed: Duplicate historical date detected: ${rawDate} (Row ${rowNum} and Row ${seenDates.get(rawDate)}).`
      };
    }
    seenDates.set(rawDate, rowNum);

    parsedRecords.push({
      date: rawDate,
      inbound: inboundNum,
      outbound: outboundNum,
      inventory: inventoryNum
    });
  }

  // 3. Chronological sorting
  parsedRecords.sort((a, b) => a.date.localeCompare(b.date));

  // 4. Detect gaps in dates
  const detectedGaps = [];
  for (let j = 0; j < parsedRecords.length - 1; j++) {
    const current = new Date(parsedRecords[j].date + 'T00:00:00Z');
    const next = new Date(parsedRecords[j + 1].date + 'T00:00:00Z');
    const diffDays = Math.round((next - current) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      detectedGaps.push({
        from: parsedRecords[j].date,
        to: parsedRecords[j + 1].date,
        missingDays: diffDays - 1
      });
    }
  }

  const minDate = parsedRecords[0].date;
  const maxDate = parsedRecords[parsedRecords.length - 1].date;

  return {
    isValid: true,
    data: parsedRecords,
    gaps: detectedGaps,
    minDate,
    maxDate,
    recordCount: parsedRecords.length
  };
}

module.exports = {
  parseAndValidateCsv
};
