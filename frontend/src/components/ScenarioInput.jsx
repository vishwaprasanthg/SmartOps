import React, { useState } from 'react';
import { MessageSquare, Sparkles, Sliders, Play, RefreshCw } from 'lucide-react';

export default function ScenarioInput({
  scenarioText,
  onScenarioTextChange,
  onSubmitScenario,
  onRunCustomSimulation,
  isLoading
}) {
  const [showSliders, setShowSliders] = useState(false);
  const [inboundPct, setInboundPct] = useState(20);
  const [outboundPct, setOutboundPct] = useState(0);
  const [workerPct, setWorkerPct] = useState(-10);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (scenarioText.trim() && !isLoading) {
        onSubmitScenario(scenarioText);
      }
    }
  };

  const handleApplySliders = () => {
    onRunCustomSimulation({
      inboundVolumeChangePercent: inboundPct,
      outboundVolumeChangePercent: outboundPct,
      workerAvailabilityChangePercent: workerPct
    });
  };

  return (
    <div className="card" id="smartops-scenario-input-card">
      <div className="card-header">
        <div className="card-title-group">
          <MessageSquare size={18} color="var(--color-brand-gold)" />
          <h3>Ask SMARTOPS</h3>
        </div>
        <span className="card-subtitle">
          Describe a hypothetical operational change in plain language
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          id="smartops-nl-scenario-input"
          className="text-input"
          rows={3}
          value={scenarioText}
          onChange={(e) => onScenarioTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "What happens if inbound volume increases by 20% and 10% of workers are unavailable?"'
          disabled={isLoading}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '14px 16px',
            fontSize: '0.96rem',
            lineHeight: 1.5,
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowSliders(!showSliders)}
            id="btn-toggle-slider-modifiers"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <Sliders size={13} style={{ marginRight: '6px' }} />
            {showSliders ? 'Hide Interactive Sliders' : 'Fine-Tune with Sliders'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSubmitScenario(scenarioText)}
            disabled={!scenarioText.trim() || isLoading}
            id="btn-ask-smartops"
            style={{ minWidth: '130px', padding: '8px 20px', fontWeight: 700 }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={14} className="spin" style={{ marginRight: '6px' }} />
                Simulating...
              </>
            ) : (
              <>
                <Sparkles size={15} style={{ marginRight: '6px' }} />
                Ask
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Fine-Tuning Sliders */}
      {showSliders && (
        <div
          id="interactive-sliders-panel"
          style={{
            marginTop: '18px',
            padding: '16px 18px',
            backgroundColor: '#FAF9F6',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-brand-brown)' }}>
            <Sliders size={15} />
            <span>Interactive Operational Modifiers</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Inbound Volume % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Inbound Volume</span>
                <span style={{ color: inboundPct >= 0 ? 'var(--color-inbound)' : 'var(--color-success)' }}>
                  {inboundPct >= 0 ? `+${inboundPct}%` : `${inboundPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={inboundPct}
                onChange={(e) => setInboundPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-inbound)' }}
              />
            </div>

            {/* Outbound Volume % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Outbound Volume</span>
                <span style={{ color: outboundPct >= 0 ? 'var(--color-outbound)' : 'var(--color-success)' }}>
                  {outboundPct >= 0 ? `+${outboundPct}%` : `${outboundPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={outboundPct}
                onChange={(e) => setOutboundPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-outbound)' }}
              />
            </div>

            {/* Worker Availability % */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Worker Availability</span>
                <span style={{ color: workerPct < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                  {workerPct >= 0 ? `+${workerPct}%` : `${workerPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={workerPct}
                onChange={(e) => setWorkerPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: workerPct < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-outline-brown"
              onClick={handleApplySliders}
              disabled={isLoading}
              id="btn-simulate-sliders"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              <Play size={12} style={{ marginRight: '5px' }} />
              Simulate Parameters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
