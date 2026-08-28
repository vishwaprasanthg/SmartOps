/**
 * Scenario Request Validator
 * SMARTOPS What-if Operational Simulator
 */

function validateWhatIfRequest(body) {
  if (!body || typeof body !== 'object') {
    return {
      isValid: false,
      error: 'Request body must be a JSON object.'
    };
  }

  const { scenario, customParams, baselineState } = body;

  // 1. Scenario text check
  if (!scenario && !customParams) {
    return {
      isValid: false,
      error: 'Please provide either a "scenario" natural language string or "customParams" operational modifiers.'
    };
  }

  if (scenario !== undefined && (typeof scenario !== 'string' || !scenario.trim())) {
    return {
      isValid: false,
      error: 'The "scenario" field must be a non-empty string.'
    };
  }

  // 2. Custom parameters check if provided
  if (customParams) {
    if (typeof customParams !== 'object') {
      return {
        isValid: false,
        error: 'The "customParams" field must be an object.'
      };
    }

    const { inboundVolumeChangePercent, outboundVolumeChangePercent, workerAvailabilityChangePercent } = customParams;

    if (inboundVolumeChangePercent !== undefined && isNaN(Number(inboundVolumeChangePercent))) {
      return { isValid: false, error: 'inboundVolumeChangePercent must be a valid number.' };
    }
    if (outboundVolumeChangePercent !== undefined && isNaN(Number(outboundVolumeChangePercent))) {
      return { isValid: false, error: 'outboundVolumeChangePercent must be a valid number.' };
    }
    if (workerAvailabilityChangePercent !== undefined && isNaN(Number(workerAvailabilityChangePercent))) {
      return { isValid: false, error: 'workerAvailabilityChangePercent must be a valid number.' };
    }
  }

  // 3. Baseline State check if provided
  if (baselineState) {
    if (typeof baselineState !== 'object') {
      return {
        isValid: false,
        error: 'The "baselineState" field must be an object.'
      };
    }
    if (baselineState.inboundVolume !== undefined && (isNaN(Number(baselineState.inboundVolume)) || Number(baselineState.inboundVolume) < 0)) {
      return { isValid: false, error: 'baselineState.inboundVolume must be a non-negative number.' };
    }
    if (baselineState.outboundVolume !== undefined && (isNaN(Number(baselineState.outboundVolume)) || Number(baselineState.outboundVolume) < 0)) {
      return { isValid: false, error: 'baselineState.outboundVolume must be a non-negative number.' };
    }
    if (baselineState.inboundWorkers !== undefined && (isNaN(Number(baselineState.inboundWorkers)) || Number(baselineState.inboundWorkers) < 0)) {
      return { isValid: false, error: 'baselineState.inboundWorkers must be a non-negative number.' };
    }
    if (baselineState.outboundWorkers !== undefined && (isNaN(Number(baselineState.outboundWorkers)) || Number(baselineState.outboundWorkers) < 0)) {
      return { isValid: false, error: 'baselineState.outboundWorkers must be a non-negative number.' };
    }
  }

  return {
    isValid: true,
    sanitized: {
      scenario: scenario ? scenario.trim() : null,
      customParams: customParams || null,
      baselineState: baselineState || null
    }
  };
}

module.exports = {
  validateWhatIfRequest
};
