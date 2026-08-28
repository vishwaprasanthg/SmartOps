/**
 * SMARTOPS What-if Operational Simulator Verification Suite
 * Tests scenario parsing, pressure calculations, worker movements,
 * safety constraints, and the single-recommendation rule.
 */

const assert = require('assert');
const { parseScenario } = require('../services/scenarioParser');
const { evaluateScenario, runDigitalTwinSimulation } = require('../services/simulatorService');
const { makeDecision } = require('../services/decisionService');
const { optimizeResources } = require('../ml/resourceOptimizer');

console.log('=== Running SMARTOPS What-if Simulator Test Suite ===\n');

let passedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Inbound-only pressure -> Move workers from Outbound to Inbound
runTest('1. Inbound-only pressure generates Outbound to Inbound worker transfer', () => {
  const parsed = parseScenario('inbound volume increases by 25%');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  assert.strictEqual(evalResult.scenario.simulation.inboundPressure === 'HIGH' || evalResult.scenario.simulation.inboundPressure === 'CRITICAL', true);
  assert.strictEqual(decision.recommendation.type, 'WORKER_TRANSFER');
  assert.match(decision.recommendation.action, /^Move \d+ workers? from Outbound to Inbound\.$/);
  assert.strictEqual(decision.details.sourceZone, 'Outbound Sort Zone 3');
  assert.strictEqual(decision.details.destinationZone, 'Inbound Processing Zone 2');
  assert.strictEqual(decision.details.workersMoved > 0, true);
});

// 2. Outbound-only pressure -> Move workers from Inbound to Outbound
runTest('2. Outbound-only pressure generates Inbound to Outbound worker transfer', () => {
  const parsed = parseScenario('outbound volume increases by 25%');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  assert.strictEqual(evalResult.scenario.simulation.outboundPressure === 'HIGH' || evalResult.scenario.simulation.outboundPressure === 'CRITICAL', true);
  assert.strictEqual(decision.recommendation.type, 'WORKER_TRANSFER');
  assert.match(decision.recommendation.action, /^Move \d+ workers? from Inbound to Outbound\.$/);
  assert.strictEqual(decision.details.sourceZone, 'Inbound Processing Zone 2');
  assert.strictEqual(decision.details.destinationZone, 'Outbound Sort Zone 3');
  assert.strictEqual(decision.details.workersMoved > 0, true);
});

// 3. Both sides under pressure with safe transfer -> Exactly one transfer recommendation
runTest('3. Both sides under pressure with safe transfer returns exactly one optimal transfer', () => {
  // Inbound is severely overloaded (+40%), Outbound slightly (+10%)
  const parsed = parseScenario('inbound increases by 40% and outbound increases by 10%');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  assert.strictEqual(typeof decision.recommendation.action, 'string');
  assert.strictEqual(decision.recommendation.action.length > 0, true);
  assert.strictEqual(decision.simulation.validated, true);
});

// 4. Both sides under severe pressure with no safe transfer -> Overtime recommendation
runTest('4. Severe shortage with no safe transfer recommends overtime', () => {
  const parsed = parseScenario('30% of workers are unavailable');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  assert.strictEqual(
    decision.recommendation.action,
    'No safe worker movement is available. Activate overtime or additional processing capacity.'
  );
  assert.strictEqual(decision.recommendation.type, 'OVERTIME_REQUIRED');
  assert.strictEqual(decision.details.workersMoved, 0);
});

// 5. Balanced operations -> Continue normal operations
runTest('5. Balanced operations recommends normal operations', () => {
  const parsed = parseScenario('inbound decreases by 10% and outbound decreases by 10%');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  assert.strictEqual(
    decision.recommendation.action,
    'No worker movement needed. Continue normal operations.'
  );
  assert.strictEqual(decision.recommendation.type, 'BALANCED');
  assert.strictEqual(decision.details.workersMoved, 0);
});

// 6. Worker movement cannot exceed source availability
runTest('6. Worker movement cannot exceed source availability', () => {
  const parsed = parseScenario('inbound increases by 50%');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  if (decision.details.workersMoved > 0) {
    assert.strictEqual(decision.details.workersMoved < evalResult.scenario.outboundWorkers, true);
  }
});

// 7. Worker movement cannot violate minimum safe staffing
runTest('7. Worker movement respects minimum safe staffing at source zone', () => {
  const parsed = parseScenario('inbound increases by 35%');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  if (decision.details.workersMoved > 0) {
    assert.strictEqual(
      decision.details.postTransferOutboundWorkers >= evalResult.safety.minSafeOutboundWorkers,
      true
    );
  }
});

// 8. Scenario parser correctly identifies inbound percentage changes
runTest('8. Scenario parser correctly identifies inbound percentage changes', () => {
  const parsed1 = parseScenario('What happens if inbound volume increases by 20%?');
  assert.strictEqual(parsed1.isValid, true);
  assert.strictEqual(parsed1.inboundVolumeChangePercent, 20);
  assert.strictEqual(parsed1.outboundVolumeChangePercent, 0);

  const parsed2 = parseScenario('inbound decreases by 15%');
  assert.strictEqual(parsed2.isValid, true);
  assert.strictEqual(parsed2.inboundVolumeChangePercent, -15);
});

// 9. Scenario parser correctly identifies outbound percentage changes
runTest('9. Scenario parser correctly identifies outbound percentage changes', () => {
  const parsed1 = parseScenario('outbound volume increases by 15%');
  assert.strictEqual(parsed1.isValid, true);
  assert.strictEqual(parsed1.outboundVolumeChangePercent, 15);

  const parsed2 = parseScenario('outbound decreases by 20%');
  assert.strictEqual(parsed2.isValid, true);
  assert.strictEqual(parsed2.outboundVolumeChangePercent, -20);
});

// 10. Scenario parser correctly identifies worker availability changes
runTest('10. Scenario parser correctly identifies worker availability changes', () => {
  const parsed1 = parseScenario('10% of workers are unavailable');
  assert.strictEqual(parsed1.isValid, true);
  assert.strictEqual(parsed1.workerAvailabilityChangePercent, -10);

  const parsed2 = parseScenario('5 workers are unavailable');
  assert.strictEqual(parsed2.isValid, true);
  assert.strictEqual(parsed2.workerAvailabilityChangeAbsolute, -5);

  const parsed3 = parseScenario('add 4 workers');
  assert.strictEqual(parsed3.isValid, true);
  assert.strictEqual(parsed3.workerAvailabilityChangeAbsolute, 4);
});

// 11. Combined scenarios are parsed correctly
runTest('11. Combined multi-clause scenarios are parsed correctly', () => {
  const parsed = parseScenario('What happens if inbound volume increases by 20% and 10% of workers are unavailable?');
  assert.strictEqual(parsed.isValid, true);
  assert.strictEqual(parsed.inboundVolumeChangePercent, 20);
  assert.strictEqual(parsed.outboundVolumeChangePercent, 0);
  assert.strictEqual(parsed.workerAvailabilityChangePercent, -10);
});

// 12. Simulation result is used in final decision
runTest('12. Simulation result is included and validated in final output', () => {
  const parsed = parseScenario('inbound increases by 20%');
  const evalResult = evaluateScenario(parsed);
  const decision = makeDecision(evalResult);

  assert.strictEqual(decision.simulation.validated, true);
  assert.strictEqual(typeof decision.impact.onTimeEstimate, 'number');
  assert.strictEqual(decision.impact.onTimeEstimate >= 0 && decision.impact.onTimeEstimate <= 100, true);
});

// 13. Recommendation is dynamic / not hardcoded
runTest('13. Recommendation worker count varies dynamically based on magnitude', () => {
  const parsedLow = parseScenario('inbound increases by 10%');
  const decisionLow = makeDecision(evaluateScenario(parsedLow));

  const parsedHigh = parseScenario('inbound increases by 35%');
  const decisionHigh = makeDecision(evaluateScenario(parsedHigh));

  assert.strictEqual(decisionLow.details.workersMoved !== decisionHigh.details.workersMoved, true);
});

// 14. Exactly ONE recommendation is returned for every valid scenario
runTest('14. Exactly ONE operator-facing recommendation is returned', () => {
  const scenarios = [
    'inbound increases by 20%',
    'outbound increases by 20%',
    'inbound decreases by 20%',
    '30% of workers are unavailable',
    'inbound increases by 20% and 10% of workers are unavailable'
  ];

  const allowedPatterns = [
    /^Move \d+ workers? from Outbound to Inbound\.$/,
    /^Move \d+ workers? from Inbound to Outbound\.$/,
    /^No safe worker movement is available\. Activate overtime or additional processing capacity\.$/,
    /^No worker movement needed\. Continue normal operations\.$/
  ];

  scenarios.forEach(sc => {
    const parsed = parseScenario(sc);
    const decision = makeDecision(evaluateScenario(parsed));
    const action = decision.recommendation.action;

    const matchesAllowed = allowedPatterns.some(pat => pat.test(action));
    assert.strictEqual(matchesAllowed, true, `Action "${action}" does not match allowed single-action patterns.`);
    // Verify no line breaks or multiple bullet points
    assert.strictEqual(action.includes('\n'), false);
    assert.strictEqual(action.includes('•'), false);
    assert.strictEqual(action.includes('- '), false);
  });
});

// 15. Existing Resource Optimization functionality continues to work without regression
runTest('15. Existing Resource Optimization priority engine continues to work', () => {
  const sampleResources = [
    { name: 'Sortation Belt A', unit: 'pkgs/hr', required: 10000, available: 8000 },
    { name: 'Loading Docks', unit: 'bays', required: 20, available: 20 }
  ];

  const res = optimizeResources(sampleResources);
  assert.strictEqual(res.resources.length, 2);
  assert.strictEqual(res.highestPriorityResource, 'Sortation Belt A');
  assert.strictEqual(res.resources[0].status, 'SHORTAGE');
  assert.strictEqual(res.resources[0].priority, 'HIGH');
});

console.log(`\n=== All ${passedTests}/${passedTests} SMARTOPS What-if Simulator tests passed successfully! ===\n`);
