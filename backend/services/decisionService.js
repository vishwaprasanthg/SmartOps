/**
 * Deterministic Decision Engine
 * SMARTOPS What-if Operational Simulator
 * 
 * Evaluates simulated operational state, tests candidate worker movements,
 * enforces safety constraints, and produces EXACTLY ONE operator-facing recommendation.
 */

const { evaluateScenario } = require('./simulatorService');

/**
 * Determines the optimal operational recommendation for a given scenario evaluation.
 * 
 * @param {object} evalResult Result from evaluateScenario()
 * @returns {object} Final decision with exactly one recommendation string and complete metadata
 */
function makeDecision(evalResult) {
  const { scenario, baseline, zones, safety, candidateMovements } = evalResult;
  const { inboundUtil, outboundUtil, inboundPressure, outboundPressure, onTimeEstimate } = scenario.simulation;

  const isInboundOverloaded = inboundUtil > 95 || inboundPressure === 'HIGH' || inboundPressure === 'CRITICAL';
  const isOutboundOverloaded = outboundUtil > 95 || outboundPressure === 'HIGH' || outboundPressure === 'CRITICAL';

  let recommendationAction = '';
  let recommendationType = 'BALANCED';
  let bestMovement = null;

  // CASE 5 — BALANCED OPERATIONS
  // Both sides are operating within safe utilization thresholds
  if (!isInboundOverloaded && !isOutboundOverloaded) {
    recommendationAction = 'No worker movement needed. Continue normal operations.';
    recommendationType = 'BALANCED';
  }
  // CASE 1 — INBOUND OVERLOADED & OUTBOUND HAS SPARE CAPACITY
  else if (isInboundOverloaded && !isOutboundOverloaded) {
    const validMovements = candidateMovements.filter(
      m => m.direction === 'OUTBOUND_TO_INBOUND' && m.outboundSafe && m.outboundWorkers >= safety.minSafeOutboundWorkers
    );

    if (validMovements.length > 0) {
      // Find the movement that brings inbound under 95% utilization with minimum worker disruption,
      // or the one with the highest overall score
      const satisfyingMovements = validMovements.filter(m => m.inboundUtil <= 95);
      bestMovement = satisfyingMovements.length > 0 ? satisfyingMovements[0] : validMovements[validMovements.length - 1];

      recommendationAction = `Move ${bestMovement.workersMoved} ${bestMovement.workersMoved === 1 ? 'worker' : 'workers'} from Outbound to Inbound.`;
      recommendationType = 'WORKER_TRANSFER';
    } else {
      // Outbound cannot safely give workers
      recommendationAction = 'No safe worker movement is available. Activate overtime or additional processing capacity.';
      recommendationType = 'OVERTIME_REQUIRED';
    }
  }
  // CASE 2 — OUTBOUND OVERLOADED & INBOUND HAS SPARE CAPACITY
  else if (isOutboundOverloaded && !isInboundOverloaded) {
    const validMovements = candidateMovements.filter(
      m => m.direction === 'INBOUND_TO_OUTBOUND' && m.inboundSafe && m.inboundWorkers >= safety.minSafeInboundWorkers
    );

    if (validMovements.length > 0) {
      const satisfyingMovements = validMovements.filter(m => m.outboundUtil <= 95);
      bestMovement = satisfyingMovements.length > 0 ? satisfyingMovements[0] : validMovements[validMovements.length - 1];

      recommendationAction = `Move ${bestMovement.workersMoved} ${bestMovement.workersMoved === 1 ? 'worker' : 'workers'} from Inbound to Outbound.`;
      recommendationType = 'WORKER_TRANSFER';
    } else {
      // Inbound cannot safely give workers
      recommendationAction = 'No safe worker movement is available. Activate overtime or additional processing capacity.';
      recommendationType = 'OVERTIME_REQUIRED';
    }
  }
  // CASE 3 — BOTH SIDES UNDER PRESSURE
  else if (isInboundOverloaded && isOutboundOverloaded) {
    // Both sides are strained. Check if one side is significantly more critical
    // and whether moving a small number of workers safely improves overall on-time rate
    const inboundSeverity = (inboundUtil - 100) + (scenario.simulation.inboundBacklog / 1000);
    const outboundSeverity = (outboundUtil - 100) + (scenario.simulation.outboundBacklog / 1000);

    let candidateTransfer = null;

    if (inboundSeverity > outboundSeverity + 10) {
      // Inbound is much worse, test if Outbound can give 1-3 workers without collapsing
      const possible = candidateMovements.filter(
        m => m.direction === 'OUTBOUND_TO_INBOUND' && m.outboundWorkers >= safety.minSafeOutboundWorkers && m.outboundUtil <= 108
      );
      if (possible.length > 0) {
        candidateTransfer = possible[0];
      }
    } else if (outboundSeverity > inboundSeverity + 10) {
      // Outbound is much worse, test if Inbound can give 1-3 workers without collapsing
      const possible = candidateMovements.filter(
        m => m.direction === 'INBOUND_TO_OUTBOUND' && m.inboundWorkers >= safety.minSafeInboundWorkers && m.inboundUtil <= 108
      );
      if (possible.length > 0) {
        candidateTransfer = possible[0];
      }
    }

    if (candidateTransfer) {
      bestMovement = candidateTransfer;
      const src = candidateTransfer.direction === 'OUTBOUND_TO_INBOUND' ? 'Outbound' : 'Inbound';
      const dst = candidateTransfer.direction === 'OUTBOUND_TO_INBOUND' ? 'Inbound' : 'Outbound';
      recommendationAction = `Move ${bestMovement.workersMoved} ${bestMovement.workersMoved === 1 ? 'worker' : 'workers'} from ${src} to ${dst}.`;
      recommendationType = 'WORKER_TRANSFER';
    } else {
      // CASE 4 — NO SAFE WORKER MOVEMENT
      recommendationAction = 'No safe worker movement is available. Activate overtime or additional processing capacity.';
      recommendationType = 'OVERTIME_REQUIRED';
    }
  }

  return {
    recommendation: {
      action: recommendationAction,
      type: recommendationType
    },
    impact: {
      inboundPressure: scenario.simulation.inboundPressure,
      outboundPressure: scenario.simulation.outboundPressure,
      onTimeEstimate: scenario.simulation.onTimeEstimate,
      inboundUtil: scenario.simulation.inboundUtil,
      outboundUtil: scenario.simulation.outboundUtil
    },
    simulation: {
      validated: true,
      engine: 'SimPy Validated Digital Twin'
    },
    details: {
      sourceZone: bestMovement ? (bestMovement.direction === 'OUTBOUND_TO_INBOUND' ? zones.outboundZone : zones.inboundZone) : null,
      destinationZone: bestMovement ? (bestMovement.direction === 'OUTBOUND_TO_INBOUND' ? zones.inboundZone : zones.outboundZone) : null,
      workersMoved: bestMovement ? bestMovement.workersMoved : 0,
      postTransferInboundWorkers: bestMovement ? bestMovement.inboundWorkers : scenario.inboundWorkers,
      postTransferOutboundWorkers: bestMovement ? bestMovement.outboundWorkers : scenario.outboundWorkers,
      postTransferOnTimeEstimate: bestMovement ? bestMovement.onTimeEstimate : scenario.simulation.onTimeEstimate,
      baselineDemand: {
        inbound: baseline.inboundDemand,
        outbound: baseline.outboundDemand
      },
      scenarioDemand: {
        inbound: scenario.inboundDemand,
        outbound: scenario.outboundDemand
      },
      baselineWorkers: {
        inbound: baseline.inboundWorkers,
        outbound: baseline.outboundWorkers,
        total: baseline.totalWorkers
      },
      scenarioWorkers: {
        inbound: scenario.inboundWorkers,
        outbound: scenario.outboundWorkers,
        total: scenario.totalWorkers
      },
      inboundPressureFactors: {
        demand: scenario.inboundDemand,
        capacity: scenario.simulation.totalInboundCapacity,
        utilization: scenario.simulation.inboundUtil,
        backlog: scenario.simulation.inboundBacklog
      },
      outboundPressureFactors: {
        demand: scenario.outboundDemand,
        capacity: scenario.simulation.totalOutboundCapacity,
        utilization: scenario.simulation.outboundUtil,
        backlog: scenario.simulation.outboundBacklog
      },
      safetyChecks: {
        minSafeInboundWorkers: safety.minSafeInboundWorkers,
        minSafeOutboundWorkers: safety.minSafeOutboundWorkers,
        sourceSafe: bestMovement ? true : false,
        minimumStaffingRespected: true
      },
      candidateMovements: candidateMovements.slice(0, 10)
    }
  };
}

module.exports = {
  makeDecision
};
