/**
 * Automated Test Suite for Feature 02: Smart Workforce Planning
 * Covers all validation criteria from 03_workforce_planning_validation.md
 */

const assert = require('assert');
const { validateWorkforceRequest } = require('../utils/workforceValidator');
const { calculateWorkforce } = require('../ml/workforceCalculator');
const { processWorkforcePlanning } = require('../services/workforceService');

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${testName}:`, err.message);
    throw err;
  }
}

console.log('=== Running Feature 02 Workforce Planning Verification Suite ===\n');

// 1. Basic Calculation (0% buffer)
runTest('Basic calculation with 0% buffer: Inbound 50k, Outbound 45k, Hours 8, Prod 500/450', () => {
  const result = calculateWorkforce({
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 0
  });

  assert.strictEqual(result.calculations.inboundLaborHours, 100);
  assert.strictEqual(result.calculations.outboundLaborHours, 100);
  assert.strictEqual(result.calculations.totalLaborHours, 200);
  assert.strictEqual(result.calculations.baseRequiredWorkers, 25);
  assert.strictEqual(result.calculations.requiredWorkers, 25);
  assert.strictEqual(result.calculations.staffingGap, 0);
  assert.strictEqual(result.status, 'ADEQUATELY STAFFED');
});

// 2. Staffing Buffer (10% buffer)
runTest('Staffing buffer (10%): ceil(25 * 1.10) = 28 required workers', () => {
  const result = calculateWorkforce({
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  });

  assert.strictEqual(result.calculations.requiredWorkers, 28);
  assert.strictEqual(result.calculations.staffingGap, 3);
  assert.strictEqual(result.status, 'UNDERSTAFFED');
  assert.ok(result.recommendation.includes('3 additional workers are required'));
});

// 3. Understaffed Status
runTest('Understaffed: Required 28, Available 25 => Gap = 3, UNDERSTAFFED', () => {
  const result = calculateWorkforce({
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  });

  assert.strictEqual(result.calculations.staffingGap, 3);
  assert.strictEqual(result.status, 'UNDERSTAFFED');
});

// 4. Adequately Staffed Status
runTest('Adequately Staffed: Required 28, Available 28 => Gap = 0, ADEQUATELY STAFFED', () => {
  const result = calculateWorkforce({
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 28,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  });

  assert.strictEqual(result.calculations.staffingGap, 0);
  assert.strictEqual(result.status, 'ADEQUATELY STAFFED');
  assert.ok(result.recommendation.includes('matches the calculated requirement'));
});

// 5. Excess Capacity Status
runTest('Excess Capacity: Required 28, Available 35 => Gap = -7, EXCESS CAPACITY', () => {
  const result = calculateWorkforce({
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 35,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  });

  assert.strictEqual(result.calculations.staffingGap, -7);
  assert.strictEqual(result.status, 'EXCESS CAPACITY');
  assert.ok(result.recommendation.includes('7 workers are above'));
});

// 6. Zero Workload
runTest('Zero workload: Inbound 0, Outbound 0 => Required Workers = 0 (no divide-by-zero)', () => {
  const result = calculateWorkforce({
    inboundVolume: 0,
    outboundVolume: 0,
    availableWorkers: 5,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  });

  assert.strictEqual(result.calculations.inboundLaborHours, 0);
  assert.strictEqual(result.calculations.outboundLaborHours, 0);
  assert.strictEqual(result.calculations.totalLaborHours, 0);
  assert.strictEqual(result.calculations.requiredWorkers, 0);
  assert.strictEqual(result.calculations.staffingGap, -5);
  assert.strictEqual(result.status, 'EXCESS CAPACITY');
});

// 7. Negative Inbound Volume Validation
runTest('Validation: rejects negative inbound volume', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: -500,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('cannot be negative'));
});

// 8. Negative Outbound Volume Validation
runTest('Validation: rejects negative outbound volume', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: -100,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('cannot be negative'));
});

// 9. Negative Available Workers Validation
runTest('Validation: rejects negative available workers', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: -5,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('cannot be negative'));
});

// 10. Fractional Available Workers Validation
runTest('Validation: rejects fractional available workers (e.g. 25.5)', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25.5,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('must be a whole number (integer)'));
});

// 11. Zero & Negative Working Hours Validation
runTest('Validation: rejects zero working hours per worker', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 0,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('must be greater than zero'));
});

runTest('Validation: rejects negative working hours per worker', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: -8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('must be greater than zero'));
});

// 12. Zero & Negative Productivity Validation
runTest('Validation: rejects zero inbound productivity', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 0,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('must be greater than zero'));
});

runTest('Validation: rejects negative outbound productivity', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: -450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('must be greater than zero'));
});

// 13. Negative Staffing Buffer Validation
runTest('Validation: rejects negative staffing buffer percentage', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: -5
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('cannot be negative'));
});

// 14. Missing Required Fields Validation
runTest('Validation: rejects missing required field (e.g. missing availableWorkers)', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('is required'));
});

// 15. Non-Numeric Field Validation
runTest('Validation: rejects non-numeric input (e.g. "abc")', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 'abc',
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('must be a valid number'));
});

// 16. Invalid Planning Date Validation
runTest('Validation: rejects invalid planning date', () => {
  const req = {
    planningDate: '2026-99-99',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val = validateWorkforceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('Invalid or missing planning date'));
});

// 17. Deterministic Repeat Test
runTest('Deterministic Repeat Test: identical requests return identical output', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    inboundVolume: 50000,
    outboundVolume: 45000,
    availableWorkers: 25,
    hoursPerWorker: 8,
    inboundProductivity: 500,
    outboundProductivity: 450,
    staffingBufferPercent: 10
  };
  const val1 = validateWorkforceRequest(req);
  const res1 = processWorkforcePlanning(val1.sanitized);
  const val2 = validateWorkforceRequest(req);
  const res2 = processWorkforcePlanning(val2.sanitized);
  assert.deepStrictEqual(res1, res2);
});

console.log(`\n=== All ${passedTests}/${totalTests} tests passed successfully! ===\n`);
