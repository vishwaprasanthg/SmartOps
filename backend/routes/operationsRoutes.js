/**
 * Operations Efficiency Routes
 * Feature 04
 */

const express = require('express');
const router = express.Router();
const { handleOperationsEfficiency } = require('../controllers/operationsController');

// POST /api/operations/efficiency
router.post('/operations/efficiency', handleOperationsEfficiency);

module.exports = router;
