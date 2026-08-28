/**
 * API Client for UPS Operational Intelligence Services
 * Connects React Frontend to Express Backend & Supabase PostgreSQL
 */

/**
 * Feature 01: Volume Forecasting API (Chronos-2)
 */
export async function requestForecast({ fromDate, toDate, historicalData, facility }) {
  const response = await fetch('/api/forecast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fromDate,
      toDate,
      facility: facility || 'Demo Hub',
      historicalData: historicalData.map(r => ({
        date: r.date,
        inbound: Number(r.inbound),
        outbound: Number(r.outbound),
        inventory: Number(r.inventory)
      }))
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data && data.error && data.error.message ? data.error.message : (data.error || 'Chronos-2 forecasting failed. Please verify the historical data and try again.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

/**
 * Feature 01: Upload & Persist Historical CSV into Supabase
 */
export async function uploadHistoricalCsv({ csvContent, fileName, facility }) {
  const response = await fetch('/api/forecast/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      csvContent,
      fileName: fileName || 'uploaded_data.csv',
      facility: facility || 'Demo Hub'
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data && data.error && data.error.message ? data.error.message : (data.error || 'Failed to upload and validate CSV.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

/**
 * Feature 01: Validate CSV via Backend Parser
 */
export async function validateCsvOnServer(csvContent) {
  const response = await fetch('/api/forecast/validate-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ csvContent })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data && data.error && data.error.message ? data.error.message : (data.error || 'Invalid CSV file format.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

/**
 * Fetch facilities from Supabase
 */
export async function fetchFacilities() {
  const response = await fetch('/api/facilities');
  const data = await response.json();
  return data && data.success ? data.facilities : [];
}

/**
 * Fetch forecast runs history from Supabase
 */
export async function fetchForecastRuns(facility) {
  const url = facility ? `/api/forecast/runs?facility=${encodeURIComponent(facility)}` : '/api/forecast/runs';
  const response = await fetch(url);
  const data = await response.json();
  return data && data.success ? data.runs : [];
}

/**
 * Health check
 */
export async function checkHealth() {
  const response = await fetch('/api/health');
  return await response.json();
}

/**
 * Feature 02: Smart Workforce Planning API
 */
export async function requestWorkforceCalculation({
  planningDate,
  facility,
  inboundVolume,
  outboundVolume,
  availableWorkers,
  hoursPerWorker,
  inboundProductivity,
  outboundProductivity,
  staffingBufferPercent
}) {
  const response = await fetch('/api/workforce/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      planningDate,
      facility,
      inboundVolume: Number(inboundVolume),
      outboundVolume: Number(outboundVolume),
      availableWorkers: Number(availableWorkers),
      hoursPerWorker: Number(hoursPerWorker),
      inboundProductivity: Number(inboundProductivity),
      outboundProductivity: Number(outboundProductivity),
      staffingBufferPercent: Number(staffingBufferPercent)
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data && data.error && data.error.message ? data.error.message : (data.error || 'Unable to calculate workforce requirement. Please check your input and try again.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

/**
 * Feature 03: Resource Optimization Engine API
 */
export async function requestResourceOptimization({
  planningDate,
  facility,
  forecastedVolume,
  resources
}) {
  const response = await fetch('/api/resources/optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      planningDate,
      facility,
      forecastedVolume: Number(forecastedVolume || 0),
      resources: resources.map(r => ({
        name: r.name,
        unit: r.unit,
        required: Number(r.required),
        available: Number(r.available)
      }))
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data && data.error && data.error.message ? data.error.message : (data.error || 'Unable to optimize resources. Please check your input and try again.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

/**
 * Feature 04: Operations Efficiency Dashboard API
 */
export async function requestOperationsEfficiency({
  facility,
  startDate,
  endDate,
  records
}) {
  const response = await fetch('/api/operations/efficiency', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      facility,
      startDate,
      endDate,
      records: records.map(r => ({
        date: r.date,
        inbound: Number(r.inbound),
        outbound: Number(r.outbound),
        processed: Number(r.processed),
        availableCapacity: Number(r.availableCapacity),
        availableWorkers: Number(r.availableWorkers),
        workingHours: Number(r.workingHours),
        onTimeProcessed: Number(r.onTimeProcessed),
        exceptions: Number(r.exceptions)
      }))
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data && data.error && data.error.message ? data.error.message : (data.error || 'Unable to generate operations dashboard. Please check your input and try again.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

/**
 * SMARTOPS What-if Operational Simulator API
 */
export async function requestWhatIfSimulation({ scenario, customParams, baselineState }) {
  const payload = {};
  if (scenario) payload.scenario = scenario;
  if (customParams) payload.customParams = customParams;
  if (baselineState) payload.baselineState = baselineState;

  const response = await fetch('/api/optimization/what-if', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data && data.error && data.error.message ? data.error.message : (data.error || 'What-if simulation failed. Please refine your scenario.');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}
