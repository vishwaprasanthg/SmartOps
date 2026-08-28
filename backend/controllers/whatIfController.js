/**
 * What-if Operational Simulator Controller
 * SMARTOPS
 */

const { validateWhatIfRequest } = require('../utils/scenarioValidator');
const { parseScenario } = require('../services/scenarioParser');
const { evaluateScenario } = require('../services/simulatorService');
const { makeDecision } = require('../services/decisionService');

/**
 * POST /api/optimization/what-if
 */
async function handleWhatIfSimulation(req, res) {
  try {
    const validation = validateWhatIfRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const { scenario, customParams, baselineState } = validation.sanitized;

    let parsedParams;

    if (customParams) {
      parsedParams = {
        isValid: true,
        originalText: scenario || 'Custom parameter simulation',
        inboundVolumeChangePercent: Number(customParams.inboundVolumeChangePercent || 0),
        inboundVolumeChangeAbsolute: Number(customParams.inboundVolumeChangeAbsolute || 0),
        outboundVolumeChangePercent: Number(customParams.outboundVolumeChangePercent || 0),
        outboundVolumeChangeAbsolute: Number(customParams.outboundVolumeChangeAbsolute || 0),
        workerAvailabilityChangePercent: Number(customParams.workerAvailabilityChangePercent || 0),
        workerAvailabilityChangeAbsolute: Number(customParams.workerAvailabilityChangeAbsolute || 0)
      };
    } else {
      const parsed = parseScenario(scenario);
      if (!parsed.isValid) {
        return res.status(400).json({
          success: false,
          error: parsed.error
        });
      }
      parsedParams = parsed;
    }

    // 1. Run digital-twin simulation on modified state
    const evalResult = evaluateScenario(parsedParams, baselineState || {});

    // 2. Compute the single deterministic recommendation
    const decision = makeDecision(evalResult);

    return res.status(200).json({
      success: true,
      scenario: {
        originalText: parsedParams.originalText,
        inboundVolumeChangePercent: parsedParams.inboundVolumeChangePercent,
        inboundVolumeChangeAbsolute: parsedParams.inboundVolumeChangeAbsolute,
        outboundVolumeChangePercent: parsedParams.outboundVolumeChangePercent,
        outboundVolumeChangeAbsolute: parsedParams.outboundVolumeChangeAbsolute,
        workerAvailabilityChangePercent: parsedParams.workerAvailabilityChangePercent,
        workerAvailabilityChangeAbsolute: parsedParams.workerAvailabilityChangeAbsolute
      },
      ...decision
    });
  } catch (error) {
    console.error('[What-if Simulator Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the what-if simulation.'
    });
  }
}

module.exports = {
  handleWhatIfSimulation
};
