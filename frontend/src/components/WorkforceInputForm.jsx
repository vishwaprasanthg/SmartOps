import React from 'react';
import { Users, Calendar, Building2, ArrowDownLeft, ArrowUpRight, Clock, Gauge, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { DEMO_FACILITIES } from '../data/demoData';

export default function WorkforceInputForm({
  formData,
  errors = {},
  onChange,
  onLoadDemo,
  onSubmit,
  isLoading
}) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="card" id="workforce-input-card">
      <div className="card-header">
        <div className="card-title-group">
          <Users size={18} color="var(--color-brand-brown)" />
          <h3>Operational Workforce Parameters</h3>
        </div>
        <span className="card-subtitle">
          Configure workload volumes, worker availability, productivity, and safety buffer
        </span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
          {/* Planning Date */}
          <div className="setting-control">
            <label htmlFor="wf-planning-date">
              <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Planning Date
            </label>
            <input
              type="date"
              id="wf-planning-date"
              className={`text-input ${errors.planningDate ? 'input-error' : ''}`}
              value={formData.planningDate}
              onChange={(e) => handleChange('planningDate', e.target.value)}
              disabled={isLoading}
              aria-label="Planning Date"
            />
            {errors.planningDate && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.planningDate}
              </div>
            )}
          </div>

          {/* Facility */}
          <div className="setting-control">
            <label htmlFor="wf-facility">
              <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Operational Facility
            </label>
            <select
              id="wf-facility"
              className="select-input"
              value={formData.facility}
              onChange={(e) => handleChange('facility', e.target.value)}
              disabled={isLoading}
            >
              {DEMO_FACILITIES.map(fac => (
                <option key={fac.id} value={fac.name}>{fac.name}</option>
              ))}
            </select>
          </div>

          {/* Forecasted Inbound Volume */}
          <div className="setting-control">
            <label htmlFor="wf-inbound-vol">
              <ArrowDownLeft size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-inbound)' }} />
              Forecasted Inbound Volume
            </label>
            <input
              type="number"
              id="wf-inbound-vol"
              step="1"
              min="0"
              placeholder="e.g. 50000"
              className={`text-input ${errors.inboundVolume ? 'input-error' : ''}`}
              value={formData.inboundVolume}
              onChange={(e) => handleChange('inboundVolume', e.target.value)}
              disabled={isLoading}
            />
            {errors.inboundVolume && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.inboundVolume}
              </div>
            )}
          </div>

          {/* Forecasted Outbound Volume */}
          <div className="setting-control">
            <label htmlFor="wf-outbound-vol">
              <ArrowUpRight size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-brand-brown)' }} />
              Forecasted Outbound Volume
            </label>
            <input
              type="number"
              id="wf-outbound-vol"
              step="1"
              min="0"
              placeholder="e.g. 45000"
              className={`text-input ${errors.outboundVolume ? 'input-error' : ''}`}
              value={formData.outboundVolume}
              onChange={(e) => handleChange('outboundVolume', e.target.value)}
              disabled={isLoading}
            />
            {errors.outboundVolume && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.outboundVolume}
              </div>
            )}
          </div>

          {/* Available Workers */}
          <div className="setting-control">
            <label htmlFor="wf-avail-workers">
              <Users size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Available Workers (Headcount)
            </label>
            <input
              type="number"
              id="wf-avail-workers"
              step="1"
              min="0"
              placeholder="e.g. 25"
              className={`text-input ${errors.availableWorkers ? 'input-error' : ''}`}
              value={formData.availableWorkers}
              onChange={(e) => handleChange('availableWorkers', e.target.value)}
              disabled={isLoading}
            />
            {errors.availableWorkers && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.availableWorkers}
              </div>
            )}
          </div>

          {/* Working Hours per Worker */}
          <div className="setting-control">
            <label htmlFor="wf-hours-per-worker">
              <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Working Hours per Worker (hrs)
            </label>
            <input
              type="number"
              id="wf-hours-per-worker"
              step="0.5"
              min="0.5"
              placeholder="e.g. 8"
              className={`text-input ${errors.hoursPerWorker ? 'input-error' : ''}`}
              value={formData.hoursPerWorker}
              onChange={(e) => handleChange('hoursPerWorker', e.target.value)}
              disabled={isLoading}
            />
            {errors.hoursPerWorker && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.hoursPerWorker}
              </div>
            )}
          </div>

          {/* Inbound Productivity */}
          <div className="setting-control">
            <label htmlFor="wf-in-prod">
              <Gauge size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-inbound)' }} />
              Inbound Productivity (units/hr)
            </label>
            <input
              type="number"
              id="wf-in-prod"
              step="1"
              min="1"
              placeholder="e.g. 500"
              className={`text-input ${errors.inboundProductivity ? 'input-error' : ''}`}
              value={formData.inboundProductivity}
              onChange={(e) => handleChange('inboundProductivity', e.target.value)}
              disabled={isLoading}
            />
            {errors.inboundProductivity && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.inboundProductivity}
              </div>
            )}
          </div>

          {/* Outbound Productivity */}
          <div className="setting-control">
            <label htmlFor="wf-out-prod">
              <Gauge size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-brand-brown)' }} />
              Outbound Productivity (units/hr)
            </label>
            <input
              type="number"
              id="wf-out-prod"
              step="1"
              min="1"
              placeholder="e.g. 450"
              className={`text-input ${errors.outboundProductivity ? 'input-error' : ''}`}
              value={formData.outboundProductivity}
              onChange={(e) => handleChange('outboundProductivity', e.target.value)}
              disabled={isLoading}
            />
            {errors.outboundProductivity && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.outboundProductivity}
              </div>
            )}
          </div>

          {/* Staffing Buffer */}
          <div className="setting-control">
            <label htmlFor="wf-buffer">
              <ShieldAlert size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Staffing Buffer (%)
            </label>
            <input
              type="number"
              id="wf-buffer"
              step="1"
              min="0"
              placeholder="e.g. 10"
              className={`text-input ${errors.staffingBufferPercent ? 'input-error' : ''}`}
              value={formData.staffingBufferPercent}
              onChange={(e) => handleChange('staffingBufferPercent', e.target.value)}
              disabled={isLoading}
            />
            {errors.staffingBufferPercent && (
              <div className="field-error-msg">
                <AlertCircle size={11} /> {errors.staffingBufferPercent}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="table-actions" style={{ marginTop: '22px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div className="table-actions-left">
            <button
              type="button"
              className="btn btn-outline-brown"
              onClick={onLoadDemo}
              id="btn-wf-load-demo"
            >
              <Sparkles size={15} />
              Load Demo Data
            </button>
          </div>

          <div className="table-actions-right">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              id="btn-wf-calculate"
              style={{ minWidth: '200px' }}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Calculating Workforce...
                </>
              ) : (
                'Calculate Workforce'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
