/**
 * Facilities Routes
 */

const express = require('express');
const router = express.Router();
const { getFacilities } = require('../services/supabaseService');

// GET /api/facilities
router.get('/facilities', async (req, res) => {
  try {
    const facilities = await getFacilities();
    return res.status(200).json({
      success: true,
      facilities
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'FACILITY_QUERY_ERROR',
        message: 'Failed to retrieve facilities.'
      }
    });
  }
});

module.exports = router;
