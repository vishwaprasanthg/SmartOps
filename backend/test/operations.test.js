/**
 * Automated Test Suite for Feature 04: Operations Efficiency Dashboard
 * Covers all validation and calculation criteria from 03_operations_efficiency_validation.md
 */

const assert = require('assert');
const { validateOperationsRequest } = require('../utils/operationsValidator');
const { calculateOperationsKpis } = require('../ml/operationsKpiCalculator');
const { calculateOperationsTrends } = require('../ml/operationsTrendCalculator');
const { processOperationsEfficiency } = require('../services/operationsEfficiencyService');

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

console.log('=== Running Feature 04 Operations Efficiency Verification Suite ===\n');

// 1. Basic Single Day KPI Calculation
runTest('Basic single day KPI calculation: Inbound 48k, Outbound 45k, Processed 46k, Cap 50k, 28 workers @ 8 hrs', () => {
  const records = [{
    date: '2026-08-25',
    inbound: 48000,
    outbound: 45000,
    processed: 46000,
    availableCapacity: 50000,
    availableWorkers: 28,
    workingHours: 8,
    onTimeProcessed: 43240,
    exceptions: 320
  }];

  const result = calculateOperationsKpis(records);
  const s = result.summary;

  assert.strictEqual(s.totalInbound, 48000);
  assert.strictEqual(s.totalOutbound, 45000);
  assert.strictEqual(s.totalProcessed, 46000);
  assert.strictEqual(s.totalCapacity, 50000);
  assert.strictEqual(s.totalWorkerHours, 224);
  assert.strictEqual(s.capacityUtilizationPercent, 92);
  assert.strictEqual(s.throughput, 205.36);
  assert.strictEqual(s.workforceProductivity, 205.36);
  assert.strictEqual(s.onTimeRatePercent, 94);
  assert.strictEqual(s.exceptionRatePercent, 0.6957);

  assert.strictEqual(result.status.capacityUtilization, 'HIGH');
  assert.strictEqual(result.status.onTimeRate, 'WARNING');
  assert.strictEqual(result.status.exceptionRate, 'HEALTHY');
});

// 2. Multiple-Day Aggregation
runTest('Multiple-day aggregation sums totals and computes un-skewed aggregate ratios', () => {
  const records = [
    { date: '2026-08-25', inbound: 48000, outbound: 45000, processed: 46000, availableCapacity: 50000, availableWorkers: 28, workingHours: 8, onTimeProcessed: 43240, exceptions: 320 },
    { date: '2026-08-26', inbound: 51000, outbound: 48000, processed: 49000, availableCapacity: 50000, availableWorkers: 28, workingHours: 8, onTimeProcessed: 47040, exceptions: 280 },
    { date: '2026-08-27', inbound: 53000, outbound: 50000, processed: 51000, availableCapacity: 50000, availableWorkers: 30, workingHours: 8, onTimeProcessed: 48450, exceptions: 350 },
    { date: '2026-08-28', inbound: 50000, outbound: 49000, processed: 49000, availableCapacity: 52000, availableWorkers: 29, workingHours: 8, onTimeProcessed: 46550, exceptions: 250 },
    { date: '2026-08-29', inbound: 54000, outbound: 51000, processed: 52000, availableCapacity: 55000, availableWorkers: 30, workingHours: 8, onTimeProcessed: 49920, exceptions: 220 }
  ];

  const result = calculateOperationsKpis(records);
  const s = result.summary;

  assert.strictEqual(s.totalInbound, 256000);
  assert.strictEqual(s.totalOutbound, 243000);
  assert.strictEqual(s.totalProcessed, 247000);
  assert.strictEqual(s.totalCapacity, 257000);
  assert.strictEqual(s.totalWorkerHours, 1160);
  assert.strictEqual(s.capacityUtilizationPercent, 96.11);
  assert.strictEqual(s.throughput, 212.93);
  assert.strictEqual(s.onTimeRatePercent, 95.22);
  assert.strictEqual(s.exceptionRatePercent, 0.5749);
});

// 3. Capacity Status Thresholds
runTest('Capacity status thresholds: <70% LOW, 70-90% HEALTHY, >90% HIGH', () => {
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 69, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 69, exceptions: 0 }]).status.capacityUtilization, 'LOW');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 70, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 70, exceptions: 0 }]).status.capacityUtilization, 'HEALTHY');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 90, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 90, exceptions: 0 }]).status.capacityUtilization, 'HEALTHY');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 91, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 91, exceptions: 0 }]).status.capacityUtilization, 'HIGH');
});

// 4. On-Time Processing Status Thresholds
runTest('On-time status thresholds: >=95% HEALTHY, 90-94.99% WARNING, <90% CRITICAL', () => {
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 95, exceptions: 0 }]).status.onTimeRate, 'HEALTHY');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 10000, availableCapacity: 10000, availableWorkers: 1, workingHours: 1, onTimeProcessed: 9499, exceptions: 0 }]).status.onTimeRate, 'WARNING');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 90, exceptions: 0 }]).status.onTimeRate, 'WARNING');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 10000, availableCapacity: 10000, availableWorkers: 1, workingHours: 1, onTimeProcessed: 8999, exceptions: 0 }]).status.onTimeRate, 'CRITICAL');
});

// 5. Exception Rate Status Thresholds
runTest('Exception status thresholds: <=1% HEALTHY, 1.01-3% WARNING, >3% CRITICAL', () => {
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 100, exceptions: 1 }]).status.exceptionRate, 'HEALTHY');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 10000, availableCapacity: 10000, availableWorkers: 1, workingHours: 1, onTimeProcessed: 10000, exceptions: 101 }]).status.exceptionRate, 'WARNING');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 100, exceptions: 3 }]).status.exceptionRate, 'WARNING');
  assert.strictEqual(calculateOperationsKpis([{ date: '2026-08-25', processed: 10000, availableCapacity: 10000, availableWorkers: 1, workingHours: 1, onTimeProcessed: 10000, exceptions: 301 }]).status.exceptionRate, 'CRITICAL');
});

// 6. Chronological Trend Ordering
runTest('Chronological trend ordering: unordered input dates are properly sorted', () => {
  const unordered = [
    { date: '2026-08-29', processed: 5000, availableCapacity: 6000, availableWorkers: 5, workingHours: 8, onTimeProcessed: 4800, exceptions: 20 },
    { date: '2026-08-25', processed: 4000, availableCapacity: 5000, availableWorkers: 5, workingHours: 8, onTimeProcessed: 3800, exceptions: 30 },
    { date: '2026-08-27', processed: 4500, availableCapacity: 5000, availableWorkers: 5, workingHours: 8, onTimeProcessed: 4300, exceptions: 25 }
  ];

  const trendResult = calculateOperationsTrends(unordered);
  const trendDates = trendResult.trends.map(t => t.date);
  assert.deepStrictEqual(trendDates, ['2026-08-25', '2026-08-27', '2026-08-29']);
});

// 7. Higher-Is-Better Trend Directions
runTest('Higher-is-better trend direction (Capacity Utilization): IMPROVING, DECLINING, STABLE', () => {
  // Improving: 80% -> 90%
  const res1 = calculateOperationsTrends([
    { date: '2026-08-25', processed: 80, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 80, exceptions: 0 },
    { date: '2026-08-26', processed: 90, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 90, exceptions: 0 }
  ]);
  assert.strictEqual(res1.trendDirections.capacityUtilizationPercent, 'IMPROVING');

  // Declining: 90% -> 80%
  const res2 = calculateOperationsTrends([
    { date: '2026-08-25', processed: 90, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 90, exceptions: 0 },
    { date: '2026-08-26', processed: 80, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 80, exceptions: 0 }
  ]);
  assert.strictEqual(res2.trendDirections.capacityUtilizationPercent, 'DECLINING');

  // Stable: 80% -> 80%
  const res3 = calculateOperationsTrends([
    { date: '2026-08-25', processed: 80, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 80, exceptions: 0 },
    { date: '2026-08-26', processed: 80, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 80, exceptions: 0 }
  ]);
  assert.strictEqual(res3.trendDirections.capacityUtilizationPercent, 'STABLE');
});

// 8. Lower-Is-Better Trend Directions for Exception Rate
runTest('Lower-is-better trend direction (Exception Rate): decreasing => IMPROVING, increasing => DECLINING', () => {
  // Decreasing exceptions: 2% -> 1% => IMPROVING
  const res1 = calculateOperationsTrends([
    { date: '2026-08-25', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 98, exceptions: 2 },
    { date: '2026-08-26', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 99, exceptions: 1 }
  ]);
  assert.strictEqual(res1.trendDirections.exceptionRatePercent, 'IMPROVING');

  // Increasing exceptions: 1% -> 2% => DECLINING
  const res2 = calculateOperationsTrends([
    { date: '2026-08-25', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 99, exceptions: 1 },
    { date: '2026-08-26', processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 1, onTimeProcessed: 98, exceptions: 2 }
  ]);
  assert.strictEqual(res2.trendDirections.exceptionRatePercent, 'DECLINING');
});

// 9. Zero Processed & Zero Worker Hours Division Protection
runTest('Zero-division safety: processed=0 and workerHours=0 do not throw exceptions', () => {
  const zeroRecord = [{
    date: '2026-08-25',
    inbound: 0,
    outbound: 0,
    processed: 0,
    availableCapacity: 50000,
    availableWorkers: 0,
    workingHours: 8,
    onTimeProcessed: 0,
    exceptions: 0
  }];

  const kpis = calculateOperationsKpis(zeroRecord);
  assert.strictEqual(kpis.summary.capacityUtilizationPercent, 0);
  assert.strictEqual(kpis.summary.throughput, 0);
  assert.strictEqual(kpis.summary.onTimeRatePercent, 0);
  assert.strictEqual(kpis.summary.exceptionRatePercent, 0);

  const trends = calculateOperationsTrends(zeroRecord);
  assert.strictEqual(trends.trends[0].throughput, 0);
});

// 10. Validation: Missing Facility
runTest('Validation: rejects missing facility', () => {
  const req = {
    facility: '',
    startDate: '2026-08-25',
    endDate: '2026-08-29',
    records: [{ date: '2026-08-25', inbound: 10, outbound: 10, processed: 10, availableCapacity: 10, availableWorkers: 1, workingHours: 8, onTimeProcessed: 10, exceptions: 0 }]
  };
  assert.strictEqual(validateOperationsRequest(req).isValid, false);
});

// 11. Validation: Invalid Start Date / End Date
runTest('Validation: rejects invalid start date or end date', () => {
  const req1 = {
    facility: 'Demo Hub',
    startDate: '2026-99-99',
    endDate: '2026-08-29',
    records: [{ date: '2026-08-25', inbound: 10, outbound: 10, processed: 10, availableCapacity: 10, availableWorkers: 1, workingHours: 8, onTimeProcessed: 10, exceptions: 0 }]
  };
  assert.strictEqual(validateOperationsRequest(req1).isValid, false);

  const req2 = {
    facility: 'Demo Hub',
    startDate: '2026-08-30',
    endDate: '2026-08-25', // Start date after end date
    records: [{ date: '2026-08-25', inbound: 10, outbound: 10, processed: 10, availableCapacity: 10, availableWorkers: 1, workingHours: 8, onTimeProcessed: 10, exceptions: 0 }]
  };
  assert.strictEqual(validateOperationsRequest(req2).isValid, false);
});

// 12. Validation: Negative Values & Available Capacity <= 0
runTest('Validation: rejects negative values and non-positive capacity', () => {
  // Negative inbound
  const req1 = {
    facility: 'Demo Hub',
    startDate: '2026-08-25',
    endDate: '2026-08-29',
    records: [{ date: '2026-08-25', inbound: -5, outbound: 10, processed: 10, availableCapacity: 10, availableWorkers: 1, workingHours: 8, onTimeProcessed: 10, exceptions: 0 }]
  };
  assert.strictEqual(validateOperationsRequest(req1).isValid, false);

  // Available capacity <= 0
  const req2 = {
    facility: 'Demo Hub',
    startDate: '2026-08-25',
    endDate: '2026-08-29',
    records: [{ date: '2026-08-25', inbound: 10, outbound: 10, processed: 10, availableCapacity: 0, availableWorkers: 1, workingHours: 8, onTimeProcessed: 10, exceptions: 0 }]
  };
  assert.strictEqual(validateOperationsRequest(req2).isValid, false);
});

// 13. Validation: Fractional Available Workers
runTest('Validation: rejects fractional available workers (e.g. 28.5)', () => {
  const req = {
    facility: 'Demo Hub',
    startDate: '2026-08-25',
    endDate: '2026-08-29',
    records: [{ date: '2026-08-25', inbound: 10, outbound: 10, processed: 10, availableCapacity: 10, availableWorkers: 28.5, workingHours: 8, onTimeProcessed: 10, exceptions: 0 }]
  };
  const val = validateOperationsRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('must be an integer'));
});

// 14. Validation: On-Time Processed Exceeds Processed Volume
runTest('Validation: rejects on-time volume exceeding total processed volume', () => {
  const req = {
    facility: 'Demo Hub',
    startDate: '2026-08-25',
    endDate: '2026-08-29',
    records: [{ date: '2026-08-25', inbound: 10, outbound: 10, processed: 100, availableCapacity: 100, availableWorkers: 1, workingHours: 8, onTimeProcessed: 105, exceptions: 0 }]
  };
  const val = validateOperationsRequest(req);
  assert.strictEqual(val.isValid, false);
  assert.ok(val.error.includes('cannot exceed total processed'));
});

// 15. Deterministic Repeat Test
runTest('Deterministic Repeat Test: identical requests return identical output', () => {
  const req = {
    facility: 'Demo Hub',
    startDate: '2026-08-25',
    endDate: '2026-08-29',
    records: [
      { date: '2026-08-25', inbound: 48000, outbound: 45000, processed: 46000, availableCapacity: 50000, availableWorkers: 28, workingHours: 8, onTimeProcessed: 43240, exceptions: 320 },
      { date: '2026-08-26', inbound: 51000, outbound: 48000, processed: 49000, availableCapacity: 50000, availableWorkers: 28, workingHours: 8, onTimeProcessed: 47040, exceptions: 280 }
    ]
  };

  const val1 = validateOperationsRequest(req);
  const res1 = processOperationsEfficiency(val1.sanitized);
  const val2 = validateOperationsRequest(req);
  const res2 = processOperationsEfficiency(val2.sanitized);
  assert.deepStrictEqual(res1, res2);
});

console.log(`\n=== All ${passedTests}/${totalTests} tests passed successfully! ===\n`);
