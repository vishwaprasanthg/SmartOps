import React from 'react';
import { Table, Cpu, Database, CheckCircle2 } from 'lucide-react';

export default function ForecastTable({ forecast, modelInfo }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="card" id="forecast-results-table-card">
      <div className="card-header">
        <div className="card-title-group">
          <Table size={18} color="var(--color-brand-brown)" />
          <h3>Chronos-2 Volume Forecast Projections</h3>
        </div>
        <span className="card-subtitle">
          {forecast.length} {forecast.length === 1 ? 'day predicted' : 'days predicted'}
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table" aria-label="Chronos-2 Volume Forecast Projections">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Forecast Date</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Inbound Forecast</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Outbound Forecast</th>
              <th style={{ width: '25%', textAlign: 'right' }}>Inventory Forecast</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((row) => (
              <tr key={row.date}>
                <td style={{ fontWeight: 600, color: 'var(--color-brand-brown)' }}>
                  {row.date}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-inbound)' }}>
                  {row.inbound.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-outbound)' }}>
                  {row.outbound.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-inventory)' }}>
                  {row.inventory.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Information Footer */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#FBF9F5',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={15} color="var(--color-brand-brown)" />
          <span>Forecasting Model: <strong>Chronos-2</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={15} color="var(--color-brand-brown)" />
          <span>Data Source: <strong>Uploaded Historical CSV</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600 }}>
          <CheckCircle2 size={15} />
          <span>Local Transformer Inference</span>
        </div>
      </div>
    </div>
  );
}
