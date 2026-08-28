/**
 * Supabase Database Connectivity & Data Persistence Test Suite
 */

const assert = require('assert');
const {
  getFacilities,
  getFacilityByName,
  insertOperationalData,
  getOperationalData,
  getOperationalDataByDateRange,
  createForecastUploadRecord,
  createForecastRun,
  updateForecastRun,
  saveForecastResults,
  getForecastResults,
  getForecastRuns,
  createWorkforcePlan,
  saveResourceOptimization,
  saveOperationalKPI
} = require('../services/supabaseService');

let totalTests = 0;
let passedTests = 0;

async function runTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${testName}:`, err.message);
    throw err;
  }
}

async function main() {
  console.log('=== Running Supabase Database & Persistence Test Suite ===\n');

  // 1. Facilities Query
  let demoFacility = null;
  await runTest('1. Retrieve operational facilities from Supabase / Seed', async () => {
    const facilities = await getFacilities();
    assert.ok(Array.isArray(facilities), 'Facilities must be an array');
    assert.ok(facilities.length >= 1, 'At least 1 facility should exist');
    demoFacility = facilities.find(f => f.name === 'Demo Hub') || facilities[0];
    assert.ok(demoFacility.id, 'Facility must have an id');
  });

  // 2. Query Facility by Name
  await runTest('2. Query facility by name (case-insensitive)', async () => {
    const fac = await getFacilityByName('demo hub');
    assert.ok(fac, 'Facility should be found');
    assert.strictEqual(fac.name, 'Demo Hub');
  });

  // 3. Insert Operational Data
  const testDate1 = '2026-08-01';
  const testDate2 = '2026-08-02';
  await runTest('3. Insert / upsert operational daily data', async () => {
    const records = [
      { date: testDate1, inbound: 48000, outbound: 45000, inventory: 32000, processed: 46000, availableCapacity: 50000, availableWorkers: 28, workingHours: 8, onTimeProcessed: 44000, exceptions: 200 },
      { date: testDate2, inbound: 51000, outbound: 47000, inventory: 33000, processed: 48000, availableCapacity: 50000, availableWorkers: 28, workingHours: 8, onTimeProcessed: 46000, exceptions: 180 }
    ];
    const inserted = await insertOperationalData(demoFacility.id, records);
    assert.ok(inserted.length >= 2, 'Should return inserted rows');
  });

  // 4. Query Operational Data
  await runTest('4. Retrieve operational data by facility', async () => {
    const data = await getOperationalData(demoFacility.id);
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 2);
    const row = data.find(r => r.date === testDate1);
    assert.ok(row);
    assert.strictEqual(Number(row.inbound_volume), 48000);
  });

  // 5. Query Operational Data by Date Range
  await runTest('5. Retrieve operational data by date range', async () => {
    const data = await getOperationalDataByDateRange(demoFacility.id, testDate1, testDate2);
    assert.ok(data.length >= 2);
  });

  // 6. Create Forecast Upload Record
  await runTest('6. Track CSV upload metadata in forecast_uploads', async () => {
    const upload = await createForecastUploadRecord(demoFacility.id, {
      fileName: 'test_operations.csv',
      recordCount: 2,
      earliestDate: testDate1,
      latestDate: testDate2,
      validationStatus: 'valid'
    });
    assert.ok(upload);
    assert.strictEqual(upload.file_name, 'test_operations.csv');
  });

  // 7. Create Forecast Run
  let testRun = null;
  await runTest('7. Create forecast_runs tracking record', async () => {
    testRun = await createForecastRun(demoFacility.id, {
      historicalStartDate: testDate1,
      historicalEndDate: testDate2,
      forecastStartDate: '2026-08-03',
      forecastEndDate: '2026-08-05',
      historicalRecordCount: 2,
      forecastDays: 3,
      status: 'processing'
    });
    assert.ok(testRun);
    assert.ok(testRun.id);
    assert.strictEqual(testRun.status, 'processing');
  });

  // 8. Save Forecast Results
  await runTest('8. Persist Chronos-2 forecast results in volume_forecasts', async () => {
    const predictions = [
      { date: '2026-08-03', inbound: 52000, outbound: 50000, inventory: 34000 },
      { date: '2026-08-04', inbound: 52500, outbound: 50500, inventory: 34500 },
      { date: '2026-08-05', inbound: 53000, outbound: 51000, inventory: 35000 }
    ];
    const saved = await saveForecastResults(demoFacility.id, testRun.id, predictions);
    assert.strictEqual(saved.length, 3);
  });

  // 9. Query Forecast Results by Run ID
  await runTest('9. Retrieve forecast results by forecast_run_id', async () => {
    const results = await getForecastResults(testRun.id);
    assert.strictEqual(results.length, 3);
    assert.strictEqual(results[0].forecast_date, '2026-08-03');
    assert.strictEqual(Number(results[0].inbound_forecast), 52000);
  });

  // 10. Update Forecast Run Status
  await runTest('10. Update forecast run status to completed', async () => {
    const updated = await updateForecastRun(testRun.id, { status: 'completed' });
    assert.ok(updated);
    assert.strictEqual(updated.status, 'completed');
  });

  // 11. Create Workforce Plan
  await runTest('11. Persist workforce planning record', async () => {
    const wf = await createWorkforcePlan(demoFacility.id, {
      planningDate: '2026-08-03',
      totalVolume: 95000,
      availableWorkers: 28,
      requiredWorkers: 26,
      workerGap: -2,
      utilizationPercentage: 92.86,
      status: 'EXCESS_CAPACITY'
    });
    assert.ok(wf);
    assert.strictEqual(wf.plan_date, '2026-08-03');
  });

  // 12. Save Resource Optimization
  await runTest('12. Persist resource optimization results', async () => {
    const resources = [
      { name: 'Loading Docks', required: 45, available: 40, utilization: 112.5, status: 'SHORTAGE', recommendation: 'Add 5 docks', shortage: 5, planningDate: '2026-08-03' }
    ];
    const res = await saveResourceOptimization(demoFacility.id, resources);
    assert.ok(res.length >= 1);
  });

  // 13. Save Operational KPI
  await runTest('13. Persist operational KPI snapshot', async () => {
    const kpi = await saveOperationalKPI(demoFacility.id, {
      date: '2026-08-02',
      throughput: 215.5,
      capacityUtilizationPercent: 96.0,
      onTimeRatePercent: 95.8,
      exceptionRatePercent: 0.38,
      workforceProductivity: 215.5
    });
    assert.ok(kpi);
    assert.strictEqual(kpi.date, '2026-08-02');
  });

  console.log(`\n=== All ${passedTests}/${totalTests} Supabase persistence tests passed successfully! ===\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error running Supabase tests:', err);
  process.exit(1);
});
