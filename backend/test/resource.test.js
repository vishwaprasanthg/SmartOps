/**
 * Automated Test Suite for Feature 03: Resource Optimization Engine
 * Covers all validation criteria from 03_resource_optimization_validation.md
 */

const assert = require('assert');
const { validateResourceRequest } = require('../utils/resourceValidator');
const { optimizeResources } = require('../ml/resourceOptimizer');
const { processResourceOptimization } = require('../services/resourceOptimizationService');

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

console.log('=== Running Feature 03 Resource Optimization Verification Suite ===\n');

// 1. Shortage Test
runTest('Shortage calculation: Required 100, Available 80 => Gap -20, Shortage 20, Status SHORTAGE, Util 125%', () => {
  const result = optimizeResources([
    { name: 'Vehicles', unit: 'vehicles', required: 100, available: 80 }
  ]);
  const r = result.resources[0];
  assert.strictEqual(r.gap, -20);
  assert.strictEqual(r.shortage, 20);
  assert.strictEqual(r.surplus, 0);
  assert.strictEqual(r.status, 'SHORTAGE');
  assert.strictEqual(r.utilizationPercent, 125);
  assert.strictEqual(r.priority, 'HIGH');
  assert.strictEqual(result.highestPriorityResource, 'Vehicles');
});

// 2. Balanced Test
runTest('Balanced calculation: Required 100, Available 100 => Gap 0, Shortage 0, Status BALANCED, Util 100%', () => {
  const result = optimizeResources([
    { name: 'Vehicles', unit: 'vehicles', required: 100, available: 100 }
  ]);
  const r = result.resources[0];
  assert.strictEqual(r.gap, 0);
  assert.strictEqual(r.shortage, 0);
  assert.strictEqual(r.surplus, 0);
  assert.strictEqual(r.status, 'BALANCED');
  assert.strictEqual(r.utilizationPercent, 100);
  assert.strictEqual(r.priority, null);
  assert.strictEqual(result.highestPriorityResource, null);
  assert.ok(result.recommendation.includes('meet or exceed'));
});

// 3. Surplus Test
runTest('Surplus calculation: Required 80, Available 100 => Gap 20, Surplus 20, Status SURPLUS, Util 80%', () => {
  const result = optimizeResources([
    { name: 'Vehicles', unit: 'vehicles', required: 80, available: 100 }
  ]);
  const r = result.resources[0];
  assert.strictEqual(r.gap, 20);
  assert.strictEqual(r.shortage, 0);
  assert.strictEqual(r.surplus, 20);
  assert.strictEqual(r.status, 'SURPLUS');
  assert.strictEqual(r.utilizationPercent, 80);
  assert.strictEqual(r.priority, null);
});

// 4. Zero Required & Zero Available
runTest('Zero required and zero available => Status BALANCED, Utilization 0%', () => {
  const result = optimizeResources([
    { name: 'Special Equipment', unit: 'units', required: 0, available: 0 }
  ]);
  const r = result.resources[0];
  assert.strictEqual(r.status, 'BALANCED');
  assert.strictEqual(r.utilizationPercent, 0);
  assert.strictEqual(r.gap, 0);
});

// 5. Required > 0 and Available = 0
runTest('Required > 0 and Available = 0 => Status SHORTAGE, Shortage = Required, Utilization = null', () => {
  const result = optimizeResources([
    { name: 'Backup Generators', unit: 'units', required: 10, available: 0 }
  ]);
  const r = result.resources[0];
  assert.strictEqual(r.status, 'SHORTAGE');
  assert.strictEqual(r.shortage, 10);
  assert.strictEqual(r.utilizationPercent, null);
});

// 6. Priority Ranking by Relative Shortage
runTest('Priority Ranking: Resource B (40% relative shortage) ranks higher than Resource A (20%)', () => {
  const result = optimizeResources([
    { name: 'Resource A', unit: 'units', required: 100, available: 80 }, // Shortage 20 (20%)
    { name: 'Resource B', unit: 'units', required: 50, available: 30 }    // Shortage 20 (40%)
  ]);
  const resA = result.resources.find(r => r.name === 'Resource A');
  const resB = result.resources.find(r => r.name === 'Resource B');
  assert.strictEqual(resB.priority, 'HIGH');
  assert.strictEqual(resA.priority, 'MEDIUM');
  assert.strictEqual(result.highestPriorityResource, 'Resource B');
});

// 7. Priority Tie-Breaker: Equal Relative Shortage => Larger Absolute Shortage Wins
runTest('Tie-Break: Processing (10k/50k=20%) and Vehicles (20/100=20%) => Processing gets HIGH, Vehicles gets MEDIUM', () => {
  const result = optimizeResources([
    { name: 'Processing Capacity', unit: 'packages/day', required: 50000, available: 40000 },
    { name: 'Vehicles', unit: 'vehicles', required: 100, available: 80 },
    { name: 'Equipment', unit: 'units', required: 35, available: 30 }
  ]);
  const processing = result.resources.find(r => r.name === 'Processing Capacity');
  const vehicles = result.resources.find(r => r.name === 'Vehicles');
  const equipment = result.resources.find(r => r.name === 'Equipment');

  assert.strictEqual(processing.shortage, 10000);
  assert.strictEqual(processing.relativeShortagePercent, 20);
  assert.strictEqual(vehicles.shortage, 20);
  assert.strictEqual(vehicles.relativeShortagePercent, 20);
  assert.strictEqual(equipment.shortage, 5);

  assert.strictEqual(processing.priority, 'HIGH');
  assert.strictEqual(vehicles.priority, 'MEDIUM');
  assert.strictEqual(equipment.priority, 'LOW');
  assert.strictEqual(result.highestPriorityResource, 'Processing Capacity');
  assert.ok(result.recommendation.includes('Processing Capacity'));
});

// 8. Recommendation Generation with Actual Name, Unit, and Shortage
runTest('Recommendation contains actual resource name, unit, and shortage quantity', () => {
  const result = optimizeResources([
    { name: 'Electric Vans', unit: 'vans', required: 50, available: 35 }
  ]);
  assert.strictEqual(result.recommendation, 'Electric Vans has the highest resource gap. Consider adding or reallocating 15 vans/equivalent capacity.');
});

// 9. Validation: Missing / Invalid Planning Date
runTest('Validation: rejects missing or invalid planning date', () => {
  const req1 = {
    planningDate: '',
    facility: 'Demo Hub',
    resources: [{ name: 'Vehicles', unit: 'vehicles', required: 10, available: 8 }]
  };
  assert.strictEqual(validateResourceRequest(req1).isValid, false);

  const req2 = {
    planningDate: '2026-99-99',
    facility: 'Demo Hub',
    resources: [{ name: 'Vehicles', unit: 'vehicles', required: 10, available: 8 }]
  };
  assert.strictEqual(validateResourceRequest(req2).isValid, false);
});

// 10. Validation: Missing Facility
runTest('Validation: rejects missing facility', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: '',
    resources: [{ name: 'Vehicles', unit: 'vehicles', required: 10, available: 8 }]
  };
  assert.strictEqual(validateResourceRequest(req).isValid, false);
});

// 11. Validation: Missing or Empty Resources Array
runTest('Validation: rejects missing or empty resources array', () => {
  const req1 = { planningDate: '2026-08-29', facility: 'Demo Hub' };
  assert.strictEqual(validateResourceRequest(req1).isValid, false);

  const req2 = { planningDate: '2026-08-29', facility: 'Demo Hub', resources: [] };
  assert.strictEqual(validateResourceRequest(req2).isValid, false);
});

// 12. Validation: Missing Resource Name or Unit
runTest('Validation: rejects resource with missing name or unit', () => {
  const req1 = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    resources: [{ name: '', unit: 'vehicles', required: 10, available: 8 }]
  };
  assert.strictEqual(validateResourceRequest(req1).isValid, false);

  const req2 = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    resources: [{ name: 'Vehicles', unit: '', required: 10, available: 8 }]
  };
  assert.strictEqual(validateResourceRequest(req2).isValid, false);
});

// 13. Validation: Missing / Non-numeric / Negative Capacities
runTest('Validation: rejects negative or non-numeric capacities', () => {
  const req1 = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    resources: [{ name: 'Vehicles', unit: 'vehicles', required: -10, available: 8 }]
  };
  assert.strictEqual(validateResourceRequest(req1).isValid, false);

  const req2 = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    resources: [{ name: 'Vehicles', unit: 'vehicles', required: 10, available: -5 }]
  };
  assert.strictEqual(validateResourceRequest(req2).isValid, false);

  const req3 = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    resources: [{ name: 'Vehicles', unit: 'vehicles', required: 'abc', available: 8 }]
  };
  assert.strictEqual(validateResourceRequest(req3).isValid, false);
});

// 14. Validation: Duplicate Resource Names
runTest('Validation: rejects duplicate resource names in same request', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    resources: [
      { name: 'Vehicles', unit: 'vehicles', required: 100, available: 80 },
      { name: 'vehicles', unit: 'vehicles', required: 50, available: 40 }
    ]
  };
  const val = validateResourceRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('Duplicate resource name detected'));
});

// 15. Deterministic Repeat Test
runTest('Deterministic Repeat Test: identical requests return identical output', () => {
  const req = {
    planningDate: '2026-08-29',
    facility: 'Demo Hub',
    forecastedVolume: 50000,
    resources: [
      { name: 'Processing Capacity', unit: 'packages/day', required: 50000, available: 40000 },
      { name: 'Vehicles', unit: 'vehicles', required: 100, available: 80 },
      { name: 'Equipment', unit: 'units', required: 35, available: 30 }
    ]
  };
  const val1 = validateResourceRequest(req);
  const res1 = processResourceOptimization(val1.sanitized);
  const val2 = validateResourceRequest(req);
  const res2 = processResourceOptimization(val2.sanitized);
  assert.deepStrictEqual(res1, res2);
});

console.log(`\n=== All ${passedTests}/${totalTests} tests passed successfully! ===\n`);
