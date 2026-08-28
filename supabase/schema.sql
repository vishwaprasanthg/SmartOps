-- ==========================================================
-- UPS Operational Intelligence Database Schema
-- Supabase PostgreSQL Migration / Schema Definition
-- ==========================================================

-- Enable pgcrypto / uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 1. FACILITIES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    facility_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial default facilities if not already present
INSERT INTO facilities (name, location, facility_type)
VALUES 
    ('Demo Hub', 'Louisville, KY', 'Automated Air & Ground Hub'),
    ('Atlanta Air Hub', 'Atlanta, GA', 'Regional Air Logistics Center'),
    ('Chicago Ground Hub', 'Chicago, IL', 'Major Ground Freight Hub'),
    ('Louisville Worldport', 'Louisville, KY', 'Global Air Hub')
ON CONFLICT (name) DO NOTHING;

-- ==========================================================
-- 2. OPERATIONAL DAILY DATA (Historical Operational Records)
-- ==========================================================
CREATE TABLE IF NOT EXISTS operational_daily_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    inbound_volume NUMERIC NOT NULL CHECK (inbound_volume >= 0),
    outbound_volume NUMERIC NOT NULL CHECK (outbound_volume >= 0),
    inventory_volume NUMERIC NOT NULL CHECK (inventory_volume >= 0),
    processed_volume NUMERIC CHECK (processed_volume >= 0),
    capacity NUMERIC CHECK (capacity >= 0),
    workers INTEGER CHECK (workers >= 0),
    hours NUMERIC CHECK (hours >= 0),
    on_time_units NUMERIC CHECK (on_time_units >= 0),
    exception_units NUMERIC CHECK (exception_units >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_facility_operational_date UNIQUE (facility_id, date)
);

-- ==========================================================
-- 3. FORECAST RUNS (Chronos-2 Inference Execution Metadata)
-- ==========================================================
CREATE TABLE IF NOT EXISTS forecast_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    historical_start_date DATE,
    historical_end_date DATE,
    forecast_start_date DATE NOT NULL,
    forecast_end_date DATE NOT NULL,
    historical_record_count INTEGER,
    forecast_days INTEGER,
    model_name TEXT NOT NULL DEFAULT 'Chronos-2',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 4. VOLUME FORECASTS (Generated Predictions)
-- ==========================================================
CREATE TABLE IF NOT EXISTS volume_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    forecast_run_id UUID NOT NULL REFERENCES forecast_runs(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    inbound_forecast NUMERIC NOT NULL CHECK (inbound_forecast >= 0),
    outbound_forecast NUMERIC NOT NULL CHECK (outbound_forecast >= 0),
    inventory_forecast NUMERIC NOT NULL CHECK (inventory_forecast >= 0),
    model_name TEXT NOT NULL DEFAULT 'Chronos-2',
    model_version TEXT DEFAULT 'v1.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 5. WORKFORCE PLANS (Feature 02)
-- ==========================================================
CREATE TABLE IF NOT EXISTS workforce_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    plan_date DATE NOT NULL,
    forecast_volume NUMERIC CHECK (forecast_volume >= 0),
    available_workers INTEGER CHECK (available_workers >= 0),
    required_workers INTEGER CHECK (required_workers >= 0),
    worker_gap INTEGER,
    utilization_percentage NUMERIC CHECK (utilization_percentage >= 0),
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 6. RESOURCE OPTIMIZATION RESULTS (Feature 03)
-- ==========================================================
CREATE TABLE IF NOT EXISTS resource_optimization_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    analysis_date DATE NOT NULL,
    area_name TEXT NOT NULL,
    available_capacity NUMERIC CHECK (available_capacity >= 0),
    used_capacity NUMERIC CHECK (used_capacity >= 0),
    utilization_percentage NUMERIC CHECK (utilization_percentage >= 0),
    status TEXT,
    recommended_action TEXT,
    recommended_resource_change NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 7. OPERATIONAL KPIS (Feature 04)
-- ==========================================================
CREATE TABLE IF NOT EXISTS operational_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    throughput NUMERIC CHECK (throughput >= 0),
    cycle_time NUMERIC CHECK (cycle_time >= 0),
    capacity_utilization NUMERIC CHECK (capacity_utilization >= 0),
    on_time_percentage NUMERIC CHECK (on_time_percentage >= 0 AND on_time_percentage <= 100),
    exception_rate NUMERIC CHECK (exception_rate >= 0 AND exception_rate <= 100),
    productivity_rate NUMERIC CHECK (productivity_rate >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 8. FORECAST UPLOADS (CSV Upload Metadata Tracking)
-- ==========================================================
CREATE TABLE IF NOT EXISTS forecast_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    file_name TEXT,
    record_count INTEGER,
    earliest_date DATE,
    latest_date DATE,
    validation_status TEXT,
    validation_errors JSONB,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 9. PERFORMANCE INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_operational_daily_facility_date ON operational_daily_data(facility_id, date);
CREATE INDEX IF NOT EXISTS idx_operational_daily_date ON operational_daily_data(date);

CREATE INDEX IF NOT EXISTS idx_volume_forecasts_run_date ON volume_forecasts(forecast_run_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_volume_forecasts_facility_date ON volume_forecasts(facility_id, forecast_date);

CREATE INDEX IF NOT EXISTS idx_forecast_runs_facility_created ON forecast_runs(facility_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workforce_plans_facility_date ON workforce_plans(facility_id, plan_date);

CREATE INDEX IF NOT EXISTS idx_resource_opt_facility_date ON resource_optimization_results(facility_id, analysis_date);

CREATE INDEX IF NOT EXISTS idx_operational_kpis_facility_date ON operational_kpis(facility_id, date);

CREATE INDEX IF NOT EXISTS idx_forecast_uploads_facility_uploaded ON forecast_uploads(facility_id, uploaded_at DESC);

-- ==========================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_daily_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_optimization_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_uploads ENABLE ROW LEVEL SECURITY;

-- Allow server-side service role full access to all tables
CREATE POLICY "service_role_all_facilities" ON facilities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_operational_daily_data" ON operational_daily_data FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_forecast_runs" ON forecast_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_volume_forecasts" ON volume_forecasts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_workforce_plans" ON workforce_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_resource_optimization_results" ON resource_optimization_results FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_operational_kpis" ON operational_kpis FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_forecast_uploads" ON forecast_uploads FOR ALL TO service_role USING (true) WITH CHECK (true);
