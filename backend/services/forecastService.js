/**
 * Volume Forecast Service
 * Feature 01: Production Volume Forecasting with Chronos-2 & Supabase Persistence
 */

const { forecastWithChronos } = require('./chronosService');
const {
  getFacilityByName,
  createForecastRun,
  updateForecastRun,
  saveForecastResults
} = require('./supabaseService');

/**
 * Orchestrates Chronos-2 inference for volume forecasting and persists run to Supabase.
 * 
 * @param {object} params Validated forecast parameters
 * @returns {Promise<object>} Structured forecast response
 */
async function processForecast(params) {
  const { fromDate, toDate, historicalData, horizon, forecastDates, facilityName } = params;

  // 1. Resolve facility
  const facility = await getFacilityByName(facilityName || 'Demo Hub');
  const facilityId = facility ? facility.id : null;

  const minHistoryDate = historicalData[0].date;
  const maxHistoryDate = historicalData[historicalData.length - 1].date;

  // 2. Create initial forecast_runs record in Supabase
  let forecastRun = null;
  try {
    forecastRun = await createForecastRun(facilityId, {
      historicalStartDate: minHistoryDate,
      historicalEndDate: maxHistoryDate,
      forecastStartDate: fromDate,
      forecastEndDate: toDate,
      historicalRecordCount: historicalData.length,
      forecastDays: horizon,
      status: 'processing'
    });
  } catch (err) {
    console.error('[Supabase Run Log Warning]:', err.message);
  }

  const runId = forecastRun ? forecastRun.id : `run-${Date.now()}`;

  try {
    const inboundHistory = historicalData.map(r => r.inbound);
    const outboundHistory = historicalData.map(r => r.outbound);
    const inventoryHistory = historicalData.map(r => r.inventory);

    // 3. Execute Chronos-2 model prediction locally
    const chronosResult = await forecastWithChronos({
      horizon,
      inbound: inboundHistory,
      outbound: outboundHistory,
      inventory: inventoryHistory
    });

    const { predictions } = chronosResult;

    // 4. Map predictions to exact forecast dates
    const forecastRecords = forecastDates.map((dateStr, idx) => {
      return {
        date: dateStr,
        inbound: Math.max(0, predictions.inbound[idx] || 0),
        outbound: Math.max(0, predictions.outbound[idx] || 0),
        inventory: Math.max(0, predictions.inventory[idx] || 0)
      };
    });

    // 5. Compute period summary statistics
    let sumInbound = 0;
    let sumOutbound = 0;
    let sumInventory = 0;

    forecastRecords.forEach(r => {
      sumInbound += r.inbound;
      sumOutbound += r.outbound;
      sumInventory += r.inventory;
    });

    const count = forecastRecords.length;
    const avgInbound = count > 0 ? Math.round(sumInbound / count) : 0;
    const avgOutbound = count > 0 ? Math.round(sumOutbound / count) : 0;
    const avgInventory = count > 0 ? Math.round(sumInventory / count) : 0;

    // 6. Persist forecast records and mark run completed in Supabase
    if (forecastRun) {
      try {
        await saveForecastResults(facilityId, runId, forecastRecords);
        await updateForecastRun(runId, { status: 'completed' });
      } catch (dbErr) {
        console.error('[Supabase Save Results Warning]:', dbErr.message);
      }
    }

    return {
      runId,
      model: {
        name: 'Chronos-2'
      },
      forecastPeriod: {
        from: fromDate,
        to: toDate,
        days: count
      },
      summary: {
        avgInbound,
        avgOutbound,
        avgInventory,
        totalInbound: sumInbound,
        totalOutbound: sumOutbound,
        totalInventory: sumInventory
      },
      forecast: forecastRecords
    };
  } catch (error) {
    if (forecastRun) {
      try {
        await updateForecastRun(runId, {
          status: 'failed',
          error_message: 'Chronos-2 inference failed'
        });
      } catch (dbErr) {
        // silent safe log
      }
    }
    throw error;
  }
}

module.exports = {
  processForecast
};
