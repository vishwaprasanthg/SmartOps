import React from 'react';
import { Sliders, Calendar, Building2, TrendingUp } from 'lucide-react';
import { DEMO_FACILITIES } from '../data/demoData';

export default function ResourceInputForm({
  planningDate,
  facility,
  forecastedVolume,
  onPlanningDateChange,
  onFacilityChange,
  onForecastedVolumeChange,
  disabled
}) {
  return (
    <div className="card" id="resource-config-card">
      <div className="card-header">
        <div className="card-title-group">
          <Sliders size={18} color="var(--color-brand-brown)" />
          <h3>Operational Context & Demand</h3>
        </div>
        <span className="card-subtitle">
          Configure planning horizon, facility, and projected operational volume
        </span>
      </div>

      <div className="settings-grid">
        {/* Planning Date */}
        <div className="setting-control">
          <label htmlFor="res-planning-date">
            <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Planning Date
          </label>
          <input
            type="date"
            id="res-planning-date"
            className="text-input"
            value={planningDate}
            onChange={(e) => onPlanningDateChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        {/* Facility */}
        <div className="setting-control">
          <label htmlFor="res-facility">
            <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Operational Facility
          </label>
          <select
            id="res-facility"
            className="select-input"
            value={facility}
            onChange={(e) => onFacilityChange(e.target.value)}
            disabled={disabled}
          >
            {DEMO_FACILITIES.map(fac => (
              <option key={fac.id} value={fac.name}>{fac.name}</option>
            ))}
          </select>
        </div>

        {/* Forecasted Volume */}
        <div className="setting-control">
          <label htmlFor="res-forecasted-vol">
            <TrendingUp size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--color-inbound)' }} />
            Forecasted Operational Volume
          </label>
          <input
            type="number"
            id="res-forecasted-vol"
            step="1"
            min="0"
            placeholder="e.g. 50000"
            className="text-input"
            value={forecastedVolume}
            onChange={(e) => onForecastedVolumeChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
