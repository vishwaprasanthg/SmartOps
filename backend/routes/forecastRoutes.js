/**
 * Forecast Routes
 * Feature 01: Volume Forecasting with Chronos-2 & Supabase Persistence
 */

const express = require('express');
const router = express.Router();
const {
  handleForecast,
  handleValidateCsv,
  handleUploadCsv,
  handleGetRuns,
  handleGetRunById
} = require('../controllers/forecastController');

// POST /api/forecast
router.post('/forecast', handleForecast);

// POST /api/forecast/validate-csv
router.post('/forecast/validate-csv', handleValidateCsv);

// POST /api/forecast/upload
router.post('/forecast/upload', handleUploadCsv);

// GET /api/forecast/runs
router.get('/forecast/runs', handleGetRuns);

// GET /api/forecast/:runId
router.get('/forecast/:runId', handleGetRunById);

module.exports = router;
