/**
 * Deterministic Natural-Language Scenario Parser
 * SMARTOPS What-if Operational Simulator
 * 
 * Converts natural language operational queries into structured parameters.
 * Does NOT require external LLMs, ensuring 100% deterministic, explainable,
 * and confidential execution.
 */

/**
 * Parses a natural language scenario string into structured operational modifiers.
 * 
 * @param {string} rawText 
 * @returns {object} Parsed scenario parameters
 */
function parseScenario(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      isValid: false,
      error: 'Please enter a scenario description (e.g. "What happens if inbound volume increases by 20% and 10% of workers are unavailable?").'
    };
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();

  let inboundVolumeChangePercent = 0;
  let inboundVolumeChangeAbsolute = 0;
  let outboundVolumeChangePercent = 0;
  let outboundVolumeChangeAbsolute = 0;
  let workerAvailabilityChangePercent = 0;
  let workerAvailabilityChangeAbsolute = 0;
  let hasIdentifiedChanges = false;

  // 1. Check for combined "both" volume changes (e.g. "both +20%", "both inbound and outbound increase by 20%")
  const bothPercentMatch = lower.match(/both(?:\s+inbound\s+and\s+outbound)?\s*(?:increase|increases|grow|grows|up|\+)?\s*(?:by\s*)?(\d+(?:\.\d+)?)%/i);
  if (bothPercentMatch) {
    const val = parseFloat(bothPercentMatch[1]);
    const isNegative = lower.includes('both decrease') || lower.includes('both drop') || lower.includes('both down') || lower.includes('both -');
    inboundVolumeChangePercent = isNegative ? -val : val;
    outboundVolumeChangePercent = isNegative ? -val : val;
    hasIdentifiedChanges = true;
  }

  // 2. Inbound Volume Parsing
  if (!bothPercentMatch) {
    // Inbound percentage increase/decrease
    // e.g. "inbound volume increases by 20%", "inbound +20%", "+20% inbound", "inbound decreases by 10%"
    const inPercentIncrease = lower.match(/(?:inbound(?:\s+volume)?\s*(?:increases|increase|up|grow|grows|higher|rising|\+)\s*(?:by\s*)?|\+)(\d+(?:\.\d+)?)%(?:\s+inbound)?/i) ||
                             lower.match(/(\d+(?:\.\d+)?)%\s*(?:increase in\s+)?inbound/i);
    const inPercentDecrease = lower.match(/inbound(?:\s+volume)?\s*(?:decreases|decrease|down|drop|drops|lower|falling|\-)\s*(?:by\s*)?(\d+(?:\.\d+)?)%/i) ||
                             lower.match(/\-(\d+(?:\.\d+)?)%\s*inbound/i);

    if (inPercentIncrease && !lower.includes('decreas') && !lower.includes('drop') && !lower.includes('down') && !lower.includes('-')) {
      inboundVolumeChangePercent = parseFloat(inPercentIncrease[1]);
      hasIdentifiedChanges = true;
    } else if (inPercentDecrease) {
      inboundVolumeChangePercent = -Math.abs(parseFloat(inPercentDecrease[1]));
      hasIdentifiedChanges = true;
    } else if (lower.match(/\+?\s*(\d+(?:\.\d+)?)%\s*inbound/i)) {
      const match = lower.match(/\+?\s*(\d+(?:\.\d+)?)%\s*inbound/i);
      inboundVolumeChangePercent = parseFloat(match[1]);
      hasIdentifiedChanges = true;
    }

    // Inbound absolute packages
    // e.g. "inbound increases by 5000 packages", "+5000 inbound packages"
    const inAbsIncrease = lower.match(/inbound(?:\s+volume)?\s*(?:increases|increase|up|\+)\s*(?:by\s*)?([0-9,]+)\s*(?:packages|pkgs|units)?/i);
    const inAbsDecrease = lower.match(/inbound(?:\s+volume)?\s*(?:decreases|decrease|down|\-)\s*(?:by\s*)?([0-9,]+)\s*(?:packages|pkgs|units)?/i);
    
    if (inAbsIncrease) {
      inboundVolumeChangeAbsolute = parseInt(inAbsIncrease[1].replace(/,/g, ''), 10);
      hasIdentifiedChanges = true;
    } else if (inAbsDecrease) {
      inboundVolumeChangeAbsolute = -Math.abs(parseInt(inAbsDecrease[1].replace(/,/g, ''), 10));
      hasIdentifiedChanges = true;
    }
  }

  // 3. Outbound Volume Parsing
  if (!bothPercentMatch) {
    // Outbound percentage increase/decrease
    // e.g. "outbound volume increases by 15%", "outbound +15%", "+15% outbound", "outbound decreases by 20%"
    const outPercentIncrease = lower.match(/(?:outbound(?:\s+volume)?\s*(?:increases|increase|up|grow|grows|higher|rising|\+)\s*(?:by\s*)?|\+)(\d+(?:\.\d+)?)%(?:\s+outbound)?/i) ||
                              lower.match(/(\d+(?:\.\d+)?)%\s*(?:increase in\s+)?outbound/i);
    const outPercentDecrease = lower.match(/outbound(?:\s+volume)?\s*(?:decreases|decrease|down|drop|drops|lower|falling|\-)\s*(?:by\s*)?(\d+(?:\.\d+)?)%/i) ||
                              lower.match(/\-(\d+(?:\.\d+)?)%\s*outbound/i);

    if (outPercentIncrease && !lower.includes('outbound decreas') && !lower.includes('outbound drop') && !lower.includes('outbound down') && !lower.includes('outbound -') && !lower.includes('-' + (outPercentIncrease[1]) + '% outbound')) {
      outboundVolumeChangePercent = parseFloat(outPercentIncrease[1]);
      hasIdentifiedChanges = true;
    } else if (outPercentDecrease) {
      outboundVolumeChangePercent = -Math.abs(parseFloat(outPercentDecrease[1]));
      hasIdentifiedChanges = true;
    } else if (lower.match(/\+?\s*(\d+(?:\.\d+)?)%\s*outbound/i)) {
      const match = lower.match(/\+?\s*(\d+(?:\.\d+)?)%\s*outbound/i);
      outboundVolumeChangePercent = parseFloat(match[1]);
      hasIdentifiedChanges = true;
    }

    // Outbound absolute packages
    // e.g. "outbound volume increases by 5000 packages"
    const outAbsIncrease = lower.match(/outbound(?:\s+volume)?\s*(?:increases|increase|up|\+)\s*(?:by\s*)?([0-9,]+)\s*(?:packages|pkgs|units)?/i);
    const outAbsDecrease = lower.match(/outbound(?:\s+volume)?\s*(?:decreases|decrease|down|\-)\s*(?:by\s*)?([0-9,]+)\s*(?:packages|pkgs|units)?/i);
    
    if (outAbsIncrease) {
      outboundVolumeChangeAbsolute = parseInt(outAbsIncrease[1].replace(/,/g, ''), 10);
      hasIdentifiedChanges = true;
    } else if (outAbsDecrease) {
      outboundVolumeChangeAbsolute = -Math.abs(parseInt(outAbsDecrease[1].replace(/,/g, ''), 10));
      hasIdentifiedChanges = true;
    }
  }

  // General standalone package change (e.g. "+5,000 packages", "50,000 packages") if neither inbound nor outbound specified
  if (!hasIdentifiedChanges && (inboundVolumeChangePercent === 0 && outboundVolumeChangePercent === 0)) {
    const generalPackageMatch = lower.match(/(?:\+|\badd\s+)?([0-9,]+)\s*(?:more\s+)?(?:packages|pkgs|units)\b/i);
    if (generalPackageMatch) {
      const count = parseInt(generalPackageMatch[1].replace(/,/g, ''), 10);
      // If unspecified, assume inbound volume increase
      inboundVolumeChangeAbsolute = count;
      hasIdentifiedChanges = true;
    }
  }

  // 4. Worker Availability Parsing
  // Percentages: "10% of workers are unavailable", "-10% workers", "workers down 15%", "add 10% workers"
  const workerPercentUnavailable = lower.match(/(\d+(?:\.\d+)?)%\s*(?:of\s+)?(?:the\s+)?workers?\s*(?:are\s+)?(?:unavailable|absent|sick|off|missing|reduced|cut|decrease|down|\-)/i) ||
                                  lower.match(/workers?\s*(?:decrease|drop|down|unavailable|absent|\-)\s*(?:by\s*)?(\d+(?:\.\d+)?)%/i) ||
                                  lower.match(/\-(\d+(?:\.\d+)?)%\s*workers?/i);

  const workerPercentAdd = lower.match(/(?:add|increase|\+)\s*(\d+(?:\.\d+)?)%\s*(?:more\s+)?workers?/i) ||
                          lower.match(/workers?\s*(?:increase|up|\+)\s*(?:by\s*)?(\d+(?:\.\d+)?)%/i) ||
                          lower.match(/\+(\d+(?:\.\d+)?)%\s*workers?/i);

  if (workerPercentUnavailable) {
    workerAvailabilityChangePercent = -Math.abs(parseFloat(workerPercentUnavailable[1]));
    hasIdentifiedChanges = true;
  } else if (workerPercentAdd) {
    workerAvailabilityChangePercent = parseFloat(workerPercentAdd[1]);
    hasIdentifiedChanges = true;
  }

  // Absolute worker count: "5 workers are unavailable", "add 4 workers", "-5 workers", "lose 3 workers"
  const workerAbsUnavailable = lower.match(/([0-9]+)\s*workers?\s*(?:are\s+)?(?:unavailable|absent|sick|off|missing|leave|quit)/i) ||
                              lower.match(/(?:lose|remove|cut|reduce|\-)\s*([0-9]+)\s*workers?/i) ||
                              lower.match(/\-([0-9]+)\s*workers?/i);

  const workerAbsAdd = lower.match(/(?:add|hire|bring in|bring on|\+)\s*([0-9]+)\s*(?:more\s+)?workers?/i) ||
                      lower.match(/\+([0-9]+)\s*workers?/i);

  if (workerAbsUnavailable) {
    workerAvailabilityChangeAbsolute = -Math.abs(parseInt(workerAbsUnavailable[1], 10));
    hasIdentifiedChanges = true;
  } else if (workerAbsAdd) {
    workerAvailabilityChangeAbsolute = parseInt(workerAbsAdd[1], 10);
    hasIdentifiedChanges = true;
  }

  if (!hasIdentifiedChanges) {
    return {
      isValid: false,
      error: `Could not recognize operational changes from: "${rawText}". Please specify inbound/outbound volume changes (e.g. "+20% inbound") or worker changes (e.g. "10% workers unavailable").`
    };
  }

  return {
    isValid: true,
    originalText: rawText,
    inboundVolumeChangePercent,
    inboundVolumeChangeAbsolute,
    outboundVolumeChangePercent,
    outboundVolumeChangeAbsolute,
    workerAvailabilityChangePercent,
    workerAvailabilityChangeAbsolute
  };
}

module.exports = {
  parseScenario
};
