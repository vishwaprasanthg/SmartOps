import React from 'react';
import { Layers, AlertTriangle, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export default function ResourceOptimizationResults({ result }) {
  if (!result || !result.resources || result.resources.length === 0) return null;

  const { resources, highestPriorityResource } = result;

  const totalCount = resources.length;
  const shortageCount = resources.filter(r => r.status === 'SHORTAGE').length;
  const balancedOrSurplusCount = totalCount - shortageCount;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'SHORTAGE':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AlertCircle size={11} />
            SHORTAGE
          </span>
        );
      case 'BALANCED':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              border: '1px solid #86EFAC',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle2 size={11} />
            BALANCED
          </span>
        );
      case 'SURPLUS':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-info-bg)',
              color: 'var(--color-info)',
              border: '1px solid #93C5FD',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <TrendingUp size={11} />
            SURPLUS
          </span>
        );
      default:
        return status;
    }
  };

  const renderPriorityBadge = (priority) => {
    if (!priority) {
      return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>;
    }
    switch (priority) {
      case 'HIGH':
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FCA5A5',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}
          >
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FCD34D',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}
          >
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#F3F4F6',
              color: '#4B5563',
              border: '1px solid #E5E7EB',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}
          >
            LOW
          </span>
        );
      default:
        return priority;
    }
  };

  return (
    <div className="resource-results-section" id="resource-results">
      {/* Summary KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card metric-outbound" id="card-res-total">
          <div>
            <div className="metric-header">
              <span className="metric-label">Analyzed Resources</span>
              <span className="metric-pill">Categories</span>
            </div>
            <div className="metric-value">
              {totalCount}
            </div>
          </div>
          <div className="metric-footer">
            <span>Facility: <strong>{result.facility}</strong></span>
            <span>Date: <strong>{result.planningDate}</strong></span>
          </div>
        </div>

        <div className="metric-card metric-inbound" id="card-res-shortages">
          <div>
            <div className="metric-header">
              <span className="metric-label">Resource Shortages</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: shortageCount > 0 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                  color: shortageCount > 0 ? 'var(--color-danger)' : 'var(--color-success)'
                }}
              >
                {shortageCount > 0 ? `${shortageCount} Critical` : '0 Gaps'}
              </span>
            </div>
            <div className="metric-value" style={{ color: shortageCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {shortageCount}
            </div>
          </div>
          <div className="metric-footer">
            <span>Surplus / Balanced: <strong>{balancedOrSurplusCount}</strong></span>
            <span>Capacity Health: <strong>{shortageCount === 0 ? 'Optimal' : 'Needs Action'}</strong></span>
          </div>
        </div>

        <div className="metric-card metric-inventory" id="card-res-highest-priority">
          <div>
            <div className="metric-header">
              <span className="metric-label">Top Bottleneck Priority</span>
              <span className="metric-pill">
                <AlertTriangle size={12} style={{ display: 'inline', marginRight: '2px' }} />
                Rank 1
              </span>
            </div>
            <div className="metric-value" style={{ fontSize: '1.45rem', paddingTop: '4px' }}>
              {highestPriorityResource || 'None (Balanced)'}
            </div>
          </div>
          <div className="metric-footer">
            <span>Priority Level: <strong>{highestPriorityResource ? 'HIGH' : 'N/A'}</strong></span>
            <span>Action Required: <strong>{highestPriorityResource ? 'Capacity Addition' : 'None'}</strong></span>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="card" id="resource-results-table-card">
        <div className="card-header">
          <div className="card-title-group">
            <Layers size={18} color="var(--color-brand-brown)" />
            <h3>Resource Capacity & Gap Analysis</h3>
          </div>
          <span className="card-subtitle">
            Evaluated demand vs available capacity with utilization and deterministic priorities
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table" aria-label="Resource Optimization Results Table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Resource Category</th>
                <th style={{ width: '12%' }}>Unit</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Required</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Available</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Gap</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Utilization</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.name}>
                  <td style={{ fontWeight: 600, color: 'var(--color-brand-brown)' }}>
                    {r.name}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    {r.unit}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {r.required.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {r.available.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: r.gap < 0 ? 'var(--color-danger)' : r.gap > 0 ? 'var(--color-info)' : 'var(--color-success)'
                    }}
                  >
                    {r.gap > 0 ? `+${r.gap.toLocaleString()}` : r.gap.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {r.utilizationPercent !== null ? `${r.utilizationPercent}%` : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {renderStatusBadge(r.status)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {renderPriorityBadge(r.priority)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
