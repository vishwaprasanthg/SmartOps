/**
 * Workforce Planning Routes
 * Feature 02
 */

const express = require('express');
const router = express.Router();
const { handleWorkforceCalculation } = require('../controllers/workforceController');

// POST /api/workforce/calculate
router.post('/workforce/calculate', handleWorkforceCalculation);

module.exports = router;
