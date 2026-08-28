import React, { useState } from 'react';
import { Cpu, Activity, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import SimulationDetails from './SimulationDetails';

function getPressureBadge(level) {
  switch (level) {
    case 'CRITICAL':
      return { bg: 'var(--color-danger-bg)', text: 'var(--color-danger)', border: 'var(--color-danger-border)', label: 'CRITICAL' };
    case 'HIGH':
      return { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D', label: 'HIGH' };
    case 'MODERATE':
      return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', label: 'MODERATE' };
    default:
      return { bg: 'var(--color-success-bg)', text: 'var(--color-success)', border: '#86EFAC', label: 'LOW' };
  }
}

export default function SimulationResult({ result }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result || !result.impact) return null;

  const { impact, recommendation, simulation, details, scenario } = result;
  const inBadge = getPressureBadge(impact.inboundPressure);
  const outBadge = getPressureBadge(impact.outboundPressure);

  return (
    <div className="card" id="smartops-simulation-result-card" style={{ marginTop: '24px' }}>
      {/* Result Header with SimPy Validated Badge */}
      <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
        <div className="card-title-group">
          <Activity size={18} color="var(--color-brand-brown)" />
          <h3>Simulation Answer</h3>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '16px', backgroundColor: '#F3E8FF', border: '1px solid #D8B4FE', color: '#6B21A8', fontSize: '0.78rem', fontWeight: 700 }}>
          <Cpu size={13} />
          <span>SIMPY VALIDATED</span>
        </div>
      </div>

      {/* 3 Operational Impact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '18px' }}>
        {/* Inbound Pressure Card */}
        <div
          id="card-inbound-pressure"
          style={{
            padding: '16px 18px',
            backgroundColor: '#FAF9F6',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Inbound Pressure</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: inBadge.bg, color: inBadge.text, border: `1px solid ${inBadge.border}` }}>
              {inBadge.label}
            </span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-brand-brown)' }}>
            {impact.inboundPressure}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Utilization: <strong style={{ color: 'var(--text-main)' }}>{impact.inboundUtil}%</strong>
          </div>
        </div>

        {/* Outbound Pressure Card */}
        <div
          id="card-outbound-pressure"
          style={{
            padding: '16px 18px',
            backgroundColor: '#FAF9F6',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Outbound Pressure</span>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: outBadge.bg, color: outBadge.text, border: `1px solid ${outBadge.border}` }}>
              {outBadge.label}
            </span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-brand-brown)' }}>
            {impact.outboundPressure}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Utilization: <strong style={{ color: 'var(--text-main)' }}>{impact.outboundUtil}%</strong>
          </div>
        </div>

        {/* On-Time Estimate Card */}
        <div
          id="card-ontime-estimate"
          style={{
            padding: '16px 18px',
            backgroundColor: '#FAF9F6',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>On-time Estimate</span>
            <Clock size={14} color="var(--color-brand-gold)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: impact.onTimeEstimate >= 90 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {impact.onTimeEstimate}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Simulated Service Reliability
          </div>
        </div>
      </div>

      {/* ONE RECOMMENDED ACTION */}
      <RecommendationCard recommendation={recommendation} />

      {/* Expandable Technical Details */}
      <SimulationDetails
        details={details}
        scenario={scenario}
        isOpen={showDetails}
        onToggle={() => setShowDetails(!showDetails)}
      />
    </div>
  );
}
