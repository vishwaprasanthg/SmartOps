/**
 * Automated Test Suite for Feature 01: Volume Forecasting with Chronos-2
 * Covers all 21 testing criteria from Section 21
 */

const assert = require('assert');
const { parseAndValidateCsv } = require('../services/csvService');
const { validateForecastRequest, getDatesBetween } = require('../utils/validator');
const { forecastWithChronos } = require('../services/chronosService');
const { processForecast } = require('../services/forecastService');

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
  console.log('=== Running Feature 01 Chronos-2 Volume Forecasting Test Suite ===\n');

  // 1. Valid CSV parsing
  await runTest('1. Valid CSV parsing and record extraction', () => {
    const csv = `date,inbound,outbound,inventory
2026-08-01,48000,45000,32000
2026-08-02,51000,47000,33000
2026-08-03,50000,49000,34000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.recordCount, 3);
    assert.strictEqual(res.minDate, '2026-08-01');
    assert.strictEqual(res.maxDate, '2026-08-03');
  });

  // 2. Missing CSV
  await runTest('2. Missing/null CSV content rejection', () => {
    assert.strictEqual(parseAndValidateCsv(null).isValid, false);
    assert.strictEqual(parseAndValidateCsv('').isValid, false);
  });

  // 3. Empty CSV
  await runTest('3. Empty CSV rejection', () => {
    assert.strictEqual(parseAndValidateCsv('   \n  \n ').isValid, false);
  });

  // 4. Missing date column
  await runTest('4. Missing date column rejection', () => {
    const csv = `inbound,outbound,inventory\n48000,45000,32000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('date'));
  });

  // 5. Missing inbound column
  await runTest('5. Missing inbound column rejection', () => {
    const csv = `date,outbound,inventory\n2026-08-01,45000,32000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('inbound'));
  });

  // 6. Missing outbound column
  await runTest('6. Missing outbound column rejection', () => {
    const csv = `date,inbound,inventory\n2026-08-01,48000,32000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('outbound'));
  });

  // 7. Missing inventory column
  await runTest('7. Missing inventory column rejection', () => {
    const csv = `date,inbound,outbound\n2026-08-01,48000,45000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('inventory'));
  });

  // 8. Invalid date format in CSV
  await runTest('8. Invalid date format rejection (Row number reported)', () => {
    const csv = `date,inbound,outbound,inventory\n2026-99-99,48000,45000,32000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('Row 2'));
  });

  // 9. Duplicate dates in CSV
  await runTest('9. Duplicate date rejection in CSV', () => {
    const csv = `date,inbound,outbound,inventory
2026-08-01,48000,45000,32000
2026-08-01,51000,47000,33000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('Duplicate historical date detected'));
  });

  // 10. Missing volume value in CSV
  await runTest('10. Missing volume value rejection (Row and column identified)', () => {
    const csv = `date,inbound,outbound,inventory\n2026-08-01,,45000,32000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('Row 2') && res.error.includes('inbound'));
  });

  // 11. Non-numeric volume in CSV
  await runTest('11. Non-numeric volume rejection', () => {
    const csv = `date,inbound,outbound,inventory\n2026-08-01,48000,invalid_str,32000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('Row 2') && res.error.includes('outbound'));
  });

  // 12. Negative volume in CSV
  await runTest('12. Negative volume rejection', () => {
    const csv = `date,inbound,outbound,inventory\n2026-08-01,48000,45000,-500`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('Row 2') && res.error.includes('inventory'));
  });

  // 13. Forecast From Date in the past
  await runTest('13. Forecast From Date in the past rejection', () => {
    const body = {
      fromDate: '2020-01-01',
      toDate: '2020-01-07',
      historicalData: [{ date: '2019-12-31', inbound: 100, outbound: 100, inventory: 100 }]
    };
    const res = validateForecastRequest(body);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('in the future'));
  });

  // 14. Forecast To Date in the past
  await runTest('14. Forecast To Date in the past rejection', () => {
    const body = {
      fromDate: '2020-01-01',
      toDate: '2020-01-05',
      historicalData: [{ date: '2019-12-31', inbound: 100, outbound: 100, inventory: 100 }]
    };
    const res = validateForecastRequest(body);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('in the future'));
  });

  // 15. From Date after To Date
  await runTest('15. From Date after To Date rejection', () => {
    const body = {
      fromDate: '2027-09-10',
      toDate: '2027-09-01',
      historicalData: [{ date: '2027-08-31', inbound: 100, outbound: 100, inventory: 100 }]
    };
    const res = validateForecastRequest(body);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('greater than or equal to From Date'));
  });

  // 16. Forecast period overlapping historical data
  await runTest('16. Forecast period overlapping latest historical date rejection', () => {
    const body = {
      fromDate: '2027-09-01',
      toDate: '2027-09-07',
      historicalData: [
        { date: '2027-08-30', inbound: 100, outbound: 100, inventory: 100 },
        { date: '2027-09-02', inbound: 100, outbound: 100, inventory: 100 } // latest date is 2027-09-02 >= 2027-09-01
      ]
    };
    const res = validateForecastRequest(body);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('must start after the latest historical date'));
  });

  // 17. Missing historical dates / gaps detection
  await runTest('17. Missing historical dates gap detection in CSV', () => {
    const csv = `date,inbound,outbound,inventory
2026-08-01,48000,45000,32000
2026-08-05,51000,47000,33000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.gaps.length, 1);
    assert.strictEqual(res.gaps[0].missingDays, 3);
  });

  // 18. Column alias recognition
  await runTest('18. Column alias recognition (Timestamp, inbound_volume_units, etc.)', () => {
    const csv = `Timestamp,inbound_volume,Outbound_Volume_Units,Inventory_Units
2026-08-01,48000,45000,32000
2026-08-02,51000,47000,33000`;
    const res = parseAndValidateCsv(csv);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.recordCount, 2);
  });

  // 19. Chronos-2 Model Prediction Execution
  await runTest('19. Successful Chronos-2 model prediction execution', async () => {
    const history = [
      { date: '2026-08-25', inbound: 48000, outbound: 45000, inventory: 32000 },
      { date: '2026-08-26', inbound: 51000, outbound: 47000, inventory: 33000 },
      { date: '2026-08-27', inbound: 50000, outbound: 49000, inventory: 34000 },
      { date: '2026-08-28', inbound: 49000, outbound: 48000, inventory: 33500 },
      { date: '2026-08-29', inbound: 52000, outbound: 50000, inventory: 35000 }
    ];
    const fromDate = '2026-09-01';
    const toDate = '2026-09-03';
    const dates = getDatesBetween(fromDate, toDate);

    const result = await processForecast({
      fromDate,
      toDate,
      historicalData: history,
      horizon: dates.length,
      forecastDates: dates
    });

    assert.strictEqual(result.model.name, 'Chronos-2');
    assert.strictEqual(result.forecast.length, 3);
    assert.strictEqual(result.forecast[0].date, '2026-09-01');
    assert.strictEqual(result.forecast[1].date, '2026-09-02');
    assert.strictEqual(result.forecast[2].date, '2026-09-03');
    assert.ok(result.forecast[0].inbound > 0);
    assert.ok(result.forecast[0].outbound > 0);
    assert.ok(result.forecast[0].inventory > 0);
  });

  // 20. Forecast dates exactly match requested From/To range
  await runTest('20. Forecast dates exactly match requested From/To range', async () => {
    const fromDate = '2026-09-05';
    const toDate = '2026-09-09';
    const dates = getDatesBetween(fromDate, toDate);
    assert.strictEqual(dates.length, 5);
    assert.strictEqual(dates[0], '2026-09-05');
    assert.strictEqual(dates[4], '2026-09-09');
  });

  // 21. Deterministic forecast structure
  await runTest('21. Forecast response has correct clean structure without tensors', async () => {
    const history = [
      { date: '2026-08-01', inbound: 48000, outbound: 45000, inventory: 32000 },
      { date: '2026-08-02', inbound: 50000, outbound: 46000, inventory: 33000 }
    ];
    const dates = ['2026-09-01'];
    const res = await processForecast({
      fromDate: '2026-09-01',
      toDate: '2026-09-01',
      historicalData: history,
      horizon: 1,
      forecastDates: dates
    });
    assert.strictEqual(res.model.name, 'Chronos-2');
    assert.strictEqual(res.forecastPeriod.days, 1);
    assert.ok(res.summary.avgInbound > 0);
  });

  console.log(`\n=== All ${passedTests}/${totalTests} tests passed successfully! ===\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
