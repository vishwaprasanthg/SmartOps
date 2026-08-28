/**
 * Server Entry Point
 */

const app = require('./app');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[Volume Forecasting Service] API server listening on http://localhost:${PORT}`);
});
