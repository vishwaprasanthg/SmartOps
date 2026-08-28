/**
 * Supabase Data Access Service
 * Centralized data service for PostgreSQL operations with local fallback
 */

const { getSupabaseClient, isSupabaseConfigured } = require('../config/supabase');

// Default initial facilities
const DEFAULT_FACILITIES = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Demo Hub', location: 'Louisville, KY', facility_type: 'Automated Air & Ground Hub' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Atlanta Air Hub', location: 'Atlanta, GA', facility_type: 'Regional Air Logistics Center' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Chicago Ground Hub', location: 'Chicago, IL', facility_type: 'Major Ground Freight Hub' },
  { id: '44444444-4444-4444-8444-444444444444', name: 'Louisville Worldport', location: 'Louisville, KY', facility_type: 'Global Air Hub' }
];

// In-memory fallback store for offline / unconfigured environments
const memoryStore = {
  facilities: [...DEFAULT_FACILITIES],
  operationalDailyData: [],
  forecastRuns: [],
  volumeForecasts: [],
  workforcePlans: [],
  resourceOptimization: [],
  operationalKpis: [],
  forecastUploads: []
};

/**
 * 1. Facilities
 */
async function getFacilities() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('facilities').select('*').order('name');
      if (error) {
        console.warn(`[Supabase Warning] ${error.message}. (If table doesn't exist yet, run supabase/schema.sql in Supabase SQL editor). Using default facilities.`);
        return DEFAULT_FACILITIES;
      }
      return data && data.length > 0 ? data : DEFAULT_FACILITIES;
    } catch (err) {
      console.warn(`[Supabase Warning] ${err.message}. Using default facilities.`);
      return DEFAULT_FACILITIES;
    }
  }
  return memoryStore.facilities;
}

async function getFacilityById(id) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('facilities').select('*').eq('id', id).maybeSingle();
      if (error) {
        console.warn(`[Supabase Warning] ${error.message}. Using fallback facility.`);
        return memoryStore.facilities.find(f => f.id === id) || null;
      }
      return data;
    } catch (err) {
      return memoryStore.facilities.find(f => f.id === id) || null;
    }
  }
  return memoryStore.facilities.find(f => f.id === id) || null;
}

async function getFacilityByName(name) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('facilities').select('*').ilike('name', name).maybeSingle();
      if (error) {
        console.warn(`[Supabase Warning] ${error.message}. Using fallback facility.`);
        return memoryStore.facilities.find(f => f.name.toLowerCase() === (name || '').toLowerCase()) || memoryStore.facilities[0];
      }
      if (data) return data;
    } catch (err) {
      return memoryStore.facilities.find(f => f.name.toLowerCase() === (name || '').toLowerCase()) || memoryStore.facilities[0];
    }
  }
  return memoryStore.facilities.find(f => f.name.toLowerCase() === (name || '').toLowerCase()) || memoryStore.facilities[0];
}

/**
 * 2. Operational Daily Data
 */
async function insertOperationalData(facilityId, records) {
  if (!records || records.length === 0) return [];

  const rows = records.map(r => ({
    facility_id: facilityId,
    date: r.date,
    inbound_volume: Number(r.inbound ?? r.inbound_volume ?? 0),
    outbound_volume: Number(r.outbound ?? r.outbound_volume ?? 0),
    inventory_volume: Number(r.inventory ?? r.inventory_volume ?? 0),
    processed_volume: r.processed !== undefined ? Number(r.processed) : (r.processed_volume !== undefined ? Number(r.processed_volume) : null),
    capacity: r.availableCapacity !== undefined ? Number(r.availableCapacity) : (r.capacity !== undefined ? Number(r.capacity) : null),
    workers: r.availableWorkers !== undefined ? Number(r.availableWorkers) : (r.workers !== undefined ? Number(r.workers) : null),
    hours: r.workingHours !== undefined ? Number(r.workingHours) : (r.hours !== undefined ? Number(r.hours) : null),
    on_time_units: r.onTimeProcessed !== undefined ? Number(r.onTimeProcessed) : (r.on_time_units !== undefined ? Number(r.on_time_units) : null),
    exception_units: r.exceptions !== undefined ? Number(r.exceptions) : (r.exception_units !== undefined ? Number(r.exception_units) : null),
    updated_at: new Date().toISOString()
  }));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('operational_daily_data')
      .upsert(rows, { onConflict: 'facility_id,date' })
      .select();

    if (error) throw new Error(`Supabase insert operational data error: ${error.message}`);
    return data;
  }

  // Fallback in-memory upsert
  rows.forEach(newRow => {
    const existingIdx = memoryStore.operationalDailyData.findIndex(
      r => r.facility_id === newRow.facility_id && r.date === newRow.date
    );
    if (existingIdx >= 0) {
      memoryStore.operationalDailyData[existingIdx] = { ...memoryStore.operationalDailyData[existingIdx], ...newRow };
    } else {
      memoryStore.operationalDailyData.push({
        id: `mock-op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...newRow,
        created_at: new Date().toISOString()
      });
    }
  });

  return rows;
}

async function getOperationalData(facilityId) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    let query = supabase.from('operational_daily_data').select('*').order('date', { ascending: true });
    if (facilityId) query = query.eq('facility_id', facilityId);

    const { data, error } = await query;
    if (error) throw new Error(`Supabase query operational data error: ${error.message}`);
    return data || [];
  }

  return memoryStore.operationalDailyData
    .filter(r => !facilityId || r.facility_id === facilityId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function getOperationalDataByDateRange(facilityId, startDate, endDate) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('operational_daily_data')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (facilityId) query = query.eq('facility_id', facilityId);

    const { data, error } = await query;
    if (error) throw new Error(`Supabase query date range error: ${error.message}`);
    return data || [];
  }

  return memoryStore.operationalDailyData
    .filter(r => (!facilityId || r.facility_id === facilityId) && r.date >= startDate && r.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 3. Forecast Uploads Tracking
 */
async function createForecastUploadRecord(facilityId, metadata) {
  const row = {
    facility_id: facilityId,
    file_name: metadata.fileName,
    record_count: metadata.recordCount,
    earliest_date: metadata.earliestDate,
    latest_date: metadata.latestDate,
    validation_status: metadata.validationStatus || 'valid',
    validation_errors: metadata.validationErrors || null,
    uploaded_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('forecast_uploads').insert([row]).select().maybeSingle();
    if (error) console.error('[Supabase Upload Metadata Error]:', error.message);
    return data || row;
  }

  const newEntry = { id: `mock-upload-${Date.now()}`, ...row };
  memoryStore.forecastUploads.push(newEntry);
  return newEntry;
}

/**
 * 4. Forecast Runs & Volume Forecasts
 */
async function createForecastRun(facilityId, runData) {
  const row = {
    facility_id: facilityId,
    historical_start_date: runData.historicalStartDate,
    historical_end_date: runData.historicalEndDate,
    forecast_start_date: runData.forecastStartDate,
    forecast_end_date: runData.forecastEndDate,
    historical_record_count: runData.historicalRecordCount,
    forecast_days: runData.forecastDays,
    model_name: 'Chronos-2',
    status: runData.status || 'processing',
    error_message: runData.errorMessage || null,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('forecast_runs').insert([row]).select().maybeSingle();
    if (error) throw new Error(`Supabase create forecast run error: ${error.message}`);
    return data;
  }

  const newRun = {
    id: `mock-run-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    ...row
  };
  memoryStore.forecastRuns.push(newRun);
  return newRun;
}

async function updateForecastRun(runId, updateData) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('forecast_runs')
      .update(updateData)
      .eq('id', runId)
      .select()
      .maybeSingle();

    if (error) console.error('[Supabase Update Run Error]:', error.message);
    return data;
  }

  const idx = memoryStore.forecastRuns.findIndex(r => r.id === runId);
  if (idx >= 0) {
    memoryStore.forecastRuns[idx] = { ...memoryStore.forecastRuns[idx], ...updateData };
    return memoryStore.forecastRuns[idx];
  }
  return null;
}

async function saveForecastResults(facilityId, runId, forecastRecords) {
  if (!forecastRecords || forecastRecords.length === 0) return [];

  const rows = forecastRecords.map(r => ({
    facility_id: facilityId,
    forecast_run_id: runId,
    forecast_date: r.date,
    inbound_forecast: Number(r.inbound),
    outbound_forecast: Number(r.outbound),
    inventory_forecast: Number(r.inventory),
    model_name: 'Chronos-2',
    model_version: 'v1.0',
    created_at: new Date().toISOString()
  }));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('volume_forecasts').insert(rows).select();
    if (error) throw new Error(`Supabase save forecast results error: ${error.message}`);
    return data;
  }

  rows.forEach(r => {
    memoryStore.volumeForecasts.push({
      id: `mock-pred-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...r
    });
  });

  return rows;
}

async function getForecastResults(runId) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('volume_forecasts')
      .select('*')
      .eq('forecast_run_id', runId)
      .order('forecast_date', { ascending: true });

    if (error) throw new Error(`Supabase query forecast results error: ${error.message}`);
    return data || [];
  }

  return memoryStore.volumeForecasts
    .filter(f => f.forecast_run_id === runId)
    .sort((a, b) => a.forecast_date.localeCompare(b.forecast_date));
}

async function getForecastRuns(facilityId) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    let query = supabase.from('forecast_runs').select('*').order('created_at', { ascending: false });
    if (facilityId) query = query.eq('facility_id', facilityId);

    const { data, error } = await query;
    if (error) throw new Error(`Supabase query forecast runs error: ${error.message}`);
    return data || [];
  }

  return memoryStore.forecastRuns
    .filter(r => !facilityId || r.facility_id === facilityId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/**
 * 5. Workforce Plans (Feature 02 Persistence)
 */
async function createWorkforcePlan(facilityId, planData) {
  const row = {
    facility_id: facilityId,
    plan_date: planData.planningDate,
    forecast_volume: Number(planData.totalVolume || 0),
    available_workers: Number(planData.availableWorkers || 0),
    required_workers: Number(planData.requiredWorkers || 0),
    worker_gap: Number(planData.workerGap || 0),
    utilization_percentage: Number(planData.utilizationPercentage || 0),
    status: planData.status || 'NORMAL',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('workforce_plans').insert([row]).select().maybeSingle();
    if (error) console.error('[Supabase Workforce Plan Error]:', error.message);
    return data || row;
  }

  const newEntry = { id: `mock-wf-${Date.now()}`, ...row };
  memoryStore.workforcePlans.push(newEntry);
  return newEntry;
}

/**
 * 6. Resource Optimization Results (Feature 03 Persistence)
 */
async function saveResourceOptimization(facilityId, results) {
  if (!results || results.length === 0) return [];

  const rows = results.map(r => ({
    facility_id: facilityId,
    analysis_date: r.planningDate || new Date().toISOString().split('T')[0],
    area_name: r.name,
    available_capacity: Number(r.available || 0),
    used_capacity: Number(r.required || 0),
    utilization_percentage: Number(r.utilization || 0),
    status: r.status,
    recommended_action: r.recommendation || null,
    recommended_resource_change: Number(r.shortage || 0),
    created_at: new Date().toISOString()
  }));

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('resource_optimization_results').insert(rows).select();
    if (error) console.error('[Supabase Resource Optimization Error]:', error.message);
    return data || rows;
  }

  rows.forEach(r => memoryStore.resourceOptimization.push({ id: `mock-res-${Date.now()}`, ...r }));
  return rows;
}

/**
 * 7. Operational KPIs (Feature 04 Persistence)
 */
async function saveOperationalKPI(facilityId, kpiData) {
  const row = {
    facility_id: facilityId,
    date: kpiData.date || new Date().toISOString().split('T')[0],
    throughput: Number(kpiData.throughput || 0),
    cycle_time: Number(kpiData.cycleTime || 0),
    capacity_utilization: Number(kpiData.capacityUtilizationPercent || 0),
    on_time_percentage: Number(kpiData.onTimeRatePercent || 0),
    exception_rate: Number(kpiData.exceptionRatePercent || 0),
    productivity_rate: Number(kpiData.workforceProductivity || 0),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('operational_kpis').insert([row]).select().maybeSingle();
    if (error) console.error('[Supabase Operational KPI Error]:', error.message);
    return data || row;
  }

  const newEntry = { id: `mock-kpi-${Date.now()}`, ...row };
  memoryStore.operationalKpis.push(newEntry);
  return newEntry;
}

module.exports = {
  getFacilities,
  getFacilityById,
  getFacilityByName,
  insertOperationalData,
  getOperationalData,
  getOperationalDataByDateRange,
  createForecastUploadRecord,
  createForecastRun,
  updateForecastRun,
  saveForecastResults,
  getForecastResults,
  getForecastRuns,
  createWorkforcePlan,
  saveResourceOptimization,
  saveOperationalKPI
};
