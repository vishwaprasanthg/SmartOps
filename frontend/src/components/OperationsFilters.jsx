import React from 'react';
import { Calendar, Building2, Sliders } from 'lucide-react';
import { DEMO_FACILITIES } from '../data/demoData';

export default function OperationsFilters({
  facility,
  startDate,
  endDate,
  onFacilityChange,
  onStartDateChange,
  onEndDateChange,
  disabled
}) {
  return (
    <div className="card" id="operations-filter-card">
      <div className="card-header">
        <div className="card-title-group">
          <Sliders size={18} color="var(--color-brand-brown)" />
          <h3>Operational Scope & Reporting Period</h3>
        </div>
        <span className="card-subtitle">
          Select facility and analysis date window
        </span>
      </div>

      <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {/* Facility */}
        <div className="setting-control">
          <label htmlFor="ops-facility">
            <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Operational Facility
          </label>
          <select
            id="ops-facility"
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

        {/* Start Date */}
        <div className="setting-control">
          <label htmlFor="ops-start-date">
            <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Start Date
          </label>
          <input
            type="date"
            id="ops-start-date"
            className="text-input"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={disabled}
            aria-label="Reporting Start Date"
          />
        </div>

        {/* End Date */}
        <div className="setting-control">
          <label htmlFor="ops-end-date">
            <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
            End Date
          </label>
          <input
            type="date"
            id="ops-end-date"
            className="text-input"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={disabled}
            aria-label="Reporting End Date"
          />
        </div>
      </div>
    </div>
  );
}
