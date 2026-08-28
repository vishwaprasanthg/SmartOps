import React from 'react';
import { Sparkles, TrendingUp, Users, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const QUICK_CHIPS = [
  { label: '+20% inbound', text: 'What happens if inbound volume increases by 20% and 10% of workers are unavailable?', icon: ArrowUpRight, color: 'var(--color-inbound)' },
  { label: '-10% workers', text: 'What happens if 10% of workers are unavailable?', icon: Users, color: 'var(--color-brand-brown)' },
  { label: '+5,000 packages', text: 'What happens if outbound volume increases by 5000 packages?', icon: Package, color: 'var(--color-outbound)' },
  { label: 'Both +20%', text: 'What happens if both inbound and outbound increase by 20%?', icon: TrendingUp, color: 'var(--color-info)' },
  { label: '-20% inbound', text: 'What happens if inbound volume decreases by 20%?', icon: ArrowDownRight, color: 'var(--color-success)' },
  { label: '-30% workers', text: 'What happens if 30% of workers are unavailable?', icon: Users, color: 'var(--color-danger)' }
];

export default function ScenarioChips({ onSelectChip, disabled }) {
  return (
    <div style={{ marginTop: '16px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        <Sparkles size={13} color="var(--color-brand-gold)" />
        <span>Quick Scenarios</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {QUICK_CHIPS.map((chip, idx) => {
          const Icon = chip.icon;
          return (
            <button
              key={idx}
              type="button"
              className="scenario-chip-btn"
              onClick={() => onSelectChip(chip.text)}
              disabled={disabled}
              id={`chip-${chip.label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = 'var(--color-brand-gold)';
                  e.currentTarget.style.backgroundColor = 'var(--color-brand-gold-subtle)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }
              }}
            >
              <Icon size={12} color={chip.color} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
