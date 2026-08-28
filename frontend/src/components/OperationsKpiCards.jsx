import React from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Gauge, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

export default function OperationsKpiCards({ summary, status, daysCount, facility }) {
  if (!summary) return null;

  const renderStatusBadge = (type, val) => {
    if (!val) return null;

    let bg = '#F3F4F6';
    let color = '#4B5563';
    let border = '#E5E7EB';
    let icon = null;

    switch (val) {
      case 'HEALTHY':
        bg = 'var(--color-success-bg)';
        color = 'var(--color-success)';
        border = '#86EFAC';
        icon = <CheckCircle2 size={11} />;
        break;
      case 'WARNING':
      case 'HIGH':
        bg = '#FEF3C7';
        color = '#B45309';
        border = '#FCD34D';
        icon = <AlertTriangle size={11} />;
        break;
      case 'CRITICAL':
      case 'LOW':
        bg = 'var(--color-danger-bg)';
        color = 'var(--color-danger)';
        border = 'var(--color-danger-border)';
        icon = <AlertCircle size={11} />;
        break;
      default:
        break;
    }

    return (
      <span
        style={{
          padding: '2px 7px',
          borderRadius: '9999px',
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          fontSize: '0.72rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px'
        }}
      >
        {icon}
        {val}
      </span>
    );
  };

  return (
    <div className="operations-kpi-section" id="operations-kpis">
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <div className="card-title-group">
          <Gauge size={18} color="var(--color-brand-brown)" />
          <h3>Operations Performance KPIs</h3>
        </div>
        <span className="card-subtitle">
          Aggregated performance across {daysCount} operational {daysCount === 1 ? 'day' : 'days'} ({facility})
        </span>
      </div>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {/* 1. Total Inbound */}
        <div className="metric-card metric-inbound" id="card-kpi-inbound">
          <div>
            <div className="metric-header">
              <span className="metric-label">Total Inbound</span>
              <span className="metric-pill">
                <ArrowDownLeft size={11} style={{ display: 'inline', marginRight: '2px' }} />
                Received
              </span>
            </div>
            <div className="metric-value">
              {summary.totalInbound.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Period Volume</span>
            <span>Units</span>
          </div>
        </div>

        {/* 2. Total Outbound */}
        <div className="metric-card metric-outbound" id="card-kpi-outbound">
          <div>
            <div className="metric-header">
              <span className="metric-label">Total Outbound</span>
              <span className="metric-pill">
                <ArrowUpRight size={11} style={{ display: 'inline', marginRight: '2px' }} />
                Dispatched
              </span>
            </div>
            <div className="metric-value">
              {summary.totalOutbound.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Period Volume</span>
            <span>Units</span>
          </div>
        </div>

        {/* 3. Total Processed */}
        <div className="metric-card metric-inventory" id="card-kpi-processed">
          <div>
            <div className="metric-header">
              <span className="metric-label">Total Processed</span>
              <span className="metric-pill">Handled</span>
            </div>
            <div className="metric-value">
              {summary.totalProcessed.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Available Cap: <strong>{summary.totalCapacity.toLocaleString()}</strong></span>
            <span>Units</span>
          </div>
        </div>

        {/* 4. Capacity Utilization */}
        <div className="metric-card" id="card-kpi-capacity-util">
          <div>
            <div className="metric-header">
              <span className="metric-label">Capacity Utilization</span>
              {renderStatusBadge('capacity', status ? status.capacityUtilization : null)}
            </div>
            <div className="metric-value">
              {summary.capacityUtilizationPercent}%
            </div>
          </div>
          <div className="metric-footer">
            <span>Benchmark: <strong>70%–90% Healthy</strong></span>
            <span>Aggregated</span>
          </div>
        </div>

        {/* 5. Throughput & Productivity */}
        <div className="metric-card" id="card-kpi-throughput">
          <div>
            <div className="metric-header">
              <span className="metric-label">Workforce Throughput</span>
              <span className="metric-pill">
                <Clock size={11} style={{ display: 'inline', marginRight: '2px' }} />
                Worker-Hour
              </span>
            </div>
            <div className="metric-value">
              {summary.throughput.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Worker Hours: <strong>{summary.totalWorkerHours.toLocaleString()} hrs</strong></span>
            <span>units / hr</span>
          </div>
        </div>

        {/* 6. On-Time Processing Rate */}
        <div className="metric-card" id="card-kpi-on-time">
          <div>
            <div className="metric-header">
              <span className="metric-label">On-Time Processing</span>
              {renderStatusBadge('ontime', status ? status.onTimeRate : null)}
            </div>
            <div className="metric-value" style={{ color: summary.onTimeRatePercent >= 95 ? 'var(--color-success)' : summary.onTimeRatePercent >= 90 ? 'var(--color-inbound)' : 'var(--color-danger)' }}>
              {summary.onTimeRatePercent}%
            </div>
          </div>
          <div className="metric-footer">
            <span>On-Time: <strong>{summary.totalOnTimeProcessed.toLocaleString()}</strong></span>
            <span>Target: &ge;95%</span>
          </div>
        </div>

        {/* 7. Exception Rate */}
        <div className="metric-card" id="card-kpi-exception">
          <div>
            <div className="metric-header">
              <span className="metric-label">Exception Rate</span>
              {renderStatusBadge('exception', status ? status.exceptionRate : null)}
            </div>
            <div className="metric-value" style={{ color: summary.exceptionRatePercent <= 1 ? 'var(--color-success)' : summary.exceptionRatePercent <= 3 ? 'var(--color-inbound)' : 'var(--color-danger)' }}>
              {summary.exceptionRatePercent}%
            </div>
          </div>
          <div className="metric-footer">
            <span>Exceptions: <strong>{summary.totalExceptions.toLocaleString()}</strong></span>
            <span>Target: &le;1%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
