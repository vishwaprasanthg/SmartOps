/**
 * Express Application Setup
 * UPS Operational Intelligence API Server
 */

const express = require('express');
const cors = require('cors');
const forecastRoutes = require('./routes/forecastRoutes');
const workforceRoutes = require('./routes/workforceRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', forecastRoutes);
app.use('/api', workforceRoutes);
app.use('/api', resourceRoutes);
app.use('/api', operationsRoutes);
app.use('/api', facilityRoutes);
app.use('/api', healthRoutes);

module.exports = app;
