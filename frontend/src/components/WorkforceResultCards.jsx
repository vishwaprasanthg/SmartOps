import React from 'react';
import { UserCheck, Users, UserMinus, UserPlus, Clock, Calculator, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function WorkforceResultCards({ result }) {
  if (!result || !result.calculations) return null;

  const { calculations, status } = result;

  const getStatusColor = (st) => {
    switch (st) {
      case 'UNDERSTAFFED':
        return {
          bg: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          border: 'var(--color-danger-border)',
          icon: <UserPlus size={16} />
        };
      case 'ADEQUATELY STAFFED':
        return {
          bg: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          border: '#86EFAC',
          icon: <UserCheck size={16} />
        };
      case 'EXCESS CAPACITY':
        return {
          bg: 'var(--color-info-bg)',
          color: 'var(--color-info)',
          border: '#93C5FD',
          icon: <UserMinus size={16} />
        };
      default:
        return {
          bg: '#F5EFEB',
          color: 'var(--color-brand-brown)',
          border: 'var(--border-subtle)',
          icon: <Users size={16} />
        };
    }
  };

  const statusStyle = getStatusColor(status);

  return (
    <div className="workforce-results-section" id="workforce-results">
      {/* 3 Main KPI Cards */}
      <div className="metrics-grid">
        {/* Required Workers */}
        <div className="metric-card metric-inbound" id="card-wf-required">
          <div>
            <div className="metric-header">
              <span className="metric-label">Required Workers</span>
              <span className="metric-pill">
                <Calculator size={12} style={{ display: 'inline', marginRight: '2px' }} />
                Buffered Headcount
              </span>
            </div>
            <div className="metric-value">
              {calculations.requiredWorkers.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Base Required: <strong>{calculations.baseRequiredWorkers}</strong></span>
            <span>Buffer: <strong>{result.inputs.staffingBufferPercent}%</strong></span>
          </div>
        </div>

        {/* Available Workers */}
        <div className="metric-card metric-outbound" id="card-wf-available">
          <div>
            <div className="metric-header">
              <span className="metric-label">Available Workers</span>
              <span className="metric-pill">
                <Users size={12} style={{ display: 'inline', marginRight: '2px' }} />
                Current On-Hand
              </span>
            </div>
            <div className="metric-value">
              {calculations.availableWorkers.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Hours/Worker: <strong>{result.inputs.hoursPerWorker} hrs</strong></span>
            <span>Shift Count: <strong>Standard</strong></span>
          </div>
        </div>

        {/* Staffing Gap & Status */}
        <div
          className="metric-card"
          id="card-wf-gap"
          style={{
            borderColor: statusStyle.border,
            background: `linear-gradient(180deg, #FFFFFF 0%, ${statusStyle.bg} 100%)`
          }}
        >
          <div>
            <div className="metric-header">
              <span className="metric-label">Staffing Gap</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {statusStyle.icon}
                {status}
              </span>
            </div>
            <div className="metric-value" style={{ color: statusStyle.color }}>
              {calculations.staffingGap > 0 ? `+${calculations.staffingGap}` : calculations.staffingGap}
            </div>
          </div>
          <div className="metric-footer">
            <span>Capacity Status: <strong>{status}</strong></span>
            <span>Target: <strong>{calculations.requiredWorkers} workers</strong></span>
          </div>
        </div>
      </div>

      {/* Calculation Details Grid */}
      <div className="card" id="workforce-calculation-details">
        <div className="card-header">
          <div className="card-title-group">
            <Clock size={18} color="var(--color-brand-brown)" />
            <h3>Workload & Labor Hours Breakdown</h3>
          </div>
          <span className="card-subtitle">
            Facility: {result.facility} &bull; Planning Date: {result.planningDate}
          </span>
        </div>

        <div className="eval-metrics-row">
          <div className="eval-stat-box">
            <div className="eval-stat-title">
              <ArrowDownLeft size={12} style={{ display: 'inline', marginRight: '3px', color: 'var(--color-inbound)' }} />
              Inbound Labor Hours
            </div>
            <div className="eval-stat-val" style={{ color: 'var(--color-inbound)' }}>
              {calculations.inboundLaborHours.toLocaleString()} hrs
            </div>
            <div className="eval-stat-sub">
              {result.inputs.inboundVolume.toLocaleString()} units / {result.inputs.inboundProductivity} uph
            </div>
          </div>

          <div className="eval-stat-box">
            <div className="eval-stat-title">
              <ArrowUpRight size={12} style={{ display: 'inline', marginRight: '3px', color: 'var(--color-brand-brown)' }} />
              Outbound Labor Hours
            </div>
            <div className="eval-stat-val" style={{ color: 'var(--color-brand-brown)' }}>
              {calculations.outboundLaborHours.toLocaleString()} hrs
            </div>
            <div className="eval-stat-sub">
              {result.inputs.outboundVolume.toLocaleString()} units / {result.inputs.outboundProductivity} uph
            </div>
          </div>

          <div className="eval-stat-box">
            <div className="eval-stat-title">Total Labor Hours</div>
            <div className="eval-stat-val">
              {calculations.totalLaborHours.toLocaleString()} hrs
            </div>
            <div className="eval-stat-sub">
              Inbound + Outbound hours
            </div>
          </div>

          <div className="eval-stat-box">
            <div className="eval-stat-title">Base Required Workers</div>
            <div className="eval-stat-val">
              {calculations.baseRequiredWorkers}
            </div>
            <div className="eval-stat-sub">
              {calculations.totalLaborHours} hrs / {result.inputs.hoursPerWorker} hrs/worker
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
