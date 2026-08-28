/**
 * Resource Optimization Routes
 * Feature 03
 */

const express = require('express');
const router = express.Router();
const { handleResourceOptimization } = require('../controllers/resourceController');
const { handleWhatIfSimulation } = require('../controllers/whatIfController');

// POST /api/resources/optimize (Feature 03 Resource Optimization Matrix)
router.post('/resources/optimize', handleResourceOptimization);

// POST /api/optimization/what-if (SMARTOPS What-if Operational Simulator)
router.post('/optimization/what-if', handleWhatIfSimulation);

module.exports = router;
