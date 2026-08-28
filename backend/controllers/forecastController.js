/**
 * Forecast Controller
 * Feature 01: Volume Forecasting with Chronos-2 & Supabase Persistence
 */

const { validateForecastRequest } = require('../utils/validator');
const { processForecast } = require('../services/forecastService');
const { parseAndValidateCsv } = require('../services/csvService');
const {
  getFacilityByName,
  insertOperationalData,
  createForecastUploadRecord,
  getForecastRuns,
  getForecastResults
} = require('../services/supabaseService');

/**
 * POST /api/forecast
 */
async function handleForecast(req, res) {
  try {
    const validation = validateForecastRequest(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error
        }
      });
    }

    const result = await processForecast({
      ...validation.sanitized,
      facilityName: req.body.facility || 'Demo Hub'
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[Forecast Controller Error]:', error.message);
    const isModelError = error.message.includes('Chronos-2');
    return res.status(500).json({
      success: false,
      error: {
        code: 'FORECAST_ERROR',
        message: isModelError
          ? error.message
          : 'Chronos-2 forecasting failed. Please verify the historical data and try again.'
      }
    });
  }
}

/**
 * POST /api/forecast/validate-csv
 */
function handleValidateCsv(req, res) {
  try {
    const { csvContent } = req.body;
    const result = parseAndValidateCsv(csvContent);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CSV_VALIDATION_ERROR',
          message: result.error
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      gaps: result.gaps,
      minDate: result.minDate,
      maxDate: result.maxDate,
      recordCount: result.recordCount
    });
  } catch (error) {
    console.error('[CSV Validation Error]:', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while validating the CSV file.'
      }
    });
  }
}

/**
 * POST /api/forecast/upload
 * Validates and persists historical CSV records into Supabase PostgreSQL
 */
async function handleUploadCsv(req, res) {
  try {
    const { csvContent, fileName, facility } = req.body;
    const validation = parseAndValidateCsv(csvContent);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CSV_VALIDATION_ERROR',
          message: validation.error
        }
      });
    }

    // Resolve facility
    const facilityRecord = await getFacilityByName(facility || 'Demo Hub');
    const facilityId = facilityRecord ? facilityRecord.id : null;

    // Persist validated records to operational_daily_data table in Supabase
    try {
      await insertOperationalData(facilityId, validation.data);
      await createForecastUploadRecord(facilityId, {
        fileName: fileName || 'historical_data.csv',
        recordCount: validation.recordCount,
        earliestDate: validation.minDate,
        latestDate: validation.maxDate,
        validationStatus: 'valid'
      });
    } catch (dbErr) {
      console.error('[Supabase Save Upload Warning]:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: validation.data,
      gaps: validation.gaps,
      minDate: validation.minDate,
      maxDate: validation.maxDate,
      recordCount: validation.recordCount,
      facility: facilityRecord ? facilityRecord.name : 'Demo Hub'
    });
  } catch (error) {
    console.error('[CSV Upload Handler Error]:', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'An error occurred while processing and saving the CSV file.'
      }
    });
  }
}

/**
 * GET /api/forecast/runs
 */
async function handleGetRuns(req, res) {
  try {
    const facility = req.query.facility ? await getFacilityByName(req.query.facility) : null;
    const runs = await getForecastRuns(facility ? facility.id : null);
    return res.status(200).json({
      success: true,
      runs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_ERROR',
        message: 'Failed to retrieve forecast runs.'
      }
    });
  }
}

/**
 * GET /api/forecast/:runId
 */
async function handleGetRunById(req, res) {
  try {
    const { runId } = req.params;
    const results = await getForecastResults(runId);
    return res.status(200).json({
      success: true,
      runId,
      forecast: results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_ERROR',
        message: 'Failed to retrieve forecast run results.'
      }
    });
  }
}

module.exports = {
  handleForecast,
  handleValidateCsv,
  handleUploadCsv,
  handleGetRuns,
  handleGetRunById
};
