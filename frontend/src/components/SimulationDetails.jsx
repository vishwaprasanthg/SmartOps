import React from 'react';
import { ChevronDown, ChevronUp, Layers, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

export default function SimulationDetails({ details, scenario, isOpen, onToggle }) {
  if (!details) return null;

  return (
    <div style={{ marginTop: '16px' }} id="simulation-details-wrapper">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onToggle}
        id="btn-toggle-simulation-details"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          fontSize: '0.85rem',
          fontWeight: 600
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={15} color="var(--color-brand-brown)" />
          {isOpen ? 'Hide Technical Details & Zone Routing' : 'View Technical Details & Simulation Breakdown'}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div
          id="technical-simulation-details-drawer"
          style={{
            marginTop: '12px',
            padding: '20px',
            backgroundColor: '#FAF9F6',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* 1. Zone Routing & Staffing Transfer */}
          {details.sourceZone && details.destinationZone && (
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Operational Zone Routing
              </h5>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Source Zone</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-brand-brown)' }}>{details.sourceZone}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-brand-gold)', fontWeight: 700, margin: '0 8px' }}>
                  <ArrowRight size={16} />
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--color-brand-gold-subtle)', color: 'var(--color-brand-brown-dark)' }}>
                    {details.workersMoved} {details.workersMoved === 1 ? 'Worker' : 'Workers'} Transferred
                  </span>
                  <ArrowRight size={16} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Destination Zone</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-brand-brown)' }}>{details.destinationZone}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 2. Baseline vs Scenario Comparison */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Workload & Staffing Comparison
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inbound Demand</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Base: {details.baselineDemand?.inbound?.toLocaleString()}</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-inbound)' }}>Scenario: {details.scenarioDemand?.inbound?.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outbound Demand</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Base: {details.baselineDemand?.outbound?.toLocaleString()}</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-outbound)' }}>Scenario: {details.scenarioDemand?.outbound?.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Workforce</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Base: {details.baselineWorkers?.total} workers</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Scenario: {details.scenarioWorkers?.total} workers</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Safety Constraints Verification */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Safety & Stability Constraints
            </h5>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 600, padding: '4px 10px', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-sm)' }}>
                <CheckCircle2 size={14} />
                <span>Minimum Safe Staffing Respected (≥ {details.safetyChecks?.minSafeOutboundWorkers} workers)</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-info)', fontWeight: 600, padding: '4px 10px', backgroundColor: 'var(--color-info-bg)', borderRadius: 'var(--radius-sm)' }}>
                <Cpu size={14} />
                <span>SimPy Digital-Twin Simulation Validated</span>
              </div>
            </div>
          </div>

          {/* 4. Candidate Movement Iterations Table */}
          {details.candidateMovements && details.candidateMovements.length > 0 && (
            <div>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Simulated Candidate Worker Movement Steps
              </h5>
              <div className="table-wrapper">
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Shift Qty</th>
                      <th>Direction</th>
                      <th style={{ textAlign: 'right' }}>Inbound Util</th>
                      <th style={{ textAlign: 'right' }}>Outbound Util</th>
                      <th style={{ textAlign: 'right' }}>Simulated On-Time</th>
                      <th style={{ textAlign: 'center' }}>Safety Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.candidateMovements.map((step, idx) => {
                      const isChosen = details.workersMoved === step.workersMoved;
                      return (
                        <tr
                          key={idx}
                          style={{
                            backgroundColor: isChosen ? 'var(--color-brand-gold-subtle)' : 'transparent',
                            fontWeight: isChosen ? 700 : 400
                          }}
                        >
                          <td>
                            {step.workersMoved} {step.workersMoved === 1 ? 'worker' : 'workers'}
                            {isChosen && (
                              <span style={{ marginLeft: '6px', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--color-brand-gold)', color: 'var(--color-brand-brown-dark)' }}>
                                Optimal
                              </span>
                            )}
                          </td>
                          <td>{step.direction === 'OUTBOUND_TO_INBOUND' ? 'Outbound → Inbound' : 'Inbound → Outbound'}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{step.inboundUtil}%</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{step.outboundUtil}%</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: step.onTimeEstimate >= 90 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {step.onTimeEstimate}%
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {step.outboundSafe && step.inboundSafe ? (
                              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>SAFE</span>
                            ) : (
                              <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>UNSAFE</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
