/**
 * Health Check Route
 */

const express = require('express');
const router = express.Router();
const { checkSupabaseHealth, isSupabaseConfigured } = require('../config/supabase');

// GET /api/health
router.get('/health', async (req, res) => {
  let dbStatus = 'unconfigured';
  if (isSupabaseConfigured()) {
    const health = await checkSupabaseHealth();
    dbStatus = health.status === 'connected' ? 'connected' : 'error';
  }

  return res.status(200).json({
    success: true,
    server: 'ok',
    database: dbStatus,
    forecastModel: 'available'
  });
});

module.exports = router;
