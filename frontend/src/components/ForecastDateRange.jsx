import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

export default function ForecastDateRange({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  minFromDate,
  disabled
}) {
  return (
    <div className="card" id="forecast-date-range-card">
      <div className="card-header">
        <div className="card-title-group">
          <Calendar size={18} color="var(--color-brand-brown)" />
          <h3>Target Forecast Horizon</h3>
        </div>
        <span className="card-subtitle">
          Select the future operational date range to predict
        </span>
      </div>

      <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* From Date */}
        <div className="setting-control">
          <label htmlFor="forecast-from-date">
            <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
            From Date (Start of Forecast)
          </label>
          <input
            type="date"
            id="forecast-from-date"
            className="text-input"
            value={fromDate}
            min={minFromDate || ''}
            onChange={(e) => onFromDateChange(e.target.value)}
            disabled={disabled}
            aria-label="Forecast Start Date"
          />
          {minFromDate && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              Must start after latest historical date ({minFromDate})
            </span>
          )}
        </div>

        {/* To Date */}
        <div className="setting-control">
          <label htmlFor="forecast-to-date">
            <ArrowRight size={13} style={{ display: 'inline', marginRight: '4px' }} />
            To Date (End of Forecast)
          </label>
          <input
            type="date"
            id="forecast-to-date"
            className="text-input"
            value={toDate}
            min={fromDate || minFromDate || ''}
            onChange={(e) => onToDateChange(e.target.value)}
            disabled={disabled}
            aria-label="Forecast End Date"
          />
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Inclusive target forecast end date
          </span>
        </div>
      </div>
    </div>
  );
}
