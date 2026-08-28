import React from 'react';
import { ArrowRightLeft, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RecommendationCard({ recommendation }) {
  if (!recommendation || !recommendation.action) return null;

  const { action, type } = recommendation;

  let Icon = ArrowRightLeft;
  let borderColor = 'var(--color-brand-gold)';
  let bgColor = '#FFFDF5';
  let badgeLabel = 'OPERATIONAL DISPATCH ACTION';
  let badgeBg = 'var(--color-brand-gold)';
  let badgeColor = 'var(--color-brand-brown-dark)';

  if (type === 'OVERTIME_REQUIRED') {
    Icon = Clock;
    borderColor = 'var(--color-danger)';
    bgColor = '#FEF2F2';
    badgeLabel = 'OVERTIME ACTIVATION REQUIRED';
    badgeBg = 'var(--color-danger-bg)';
    badgeColor = 'var(--color-danger)';
  } else if (type === 'BALANCED') {
    Icon = CheckCircle2;
    borderColor = 'var(--color-success)';
    bgColor = '#F0FDF4';
    badgeLabel = 'BALANCED FLOW';
    badgeBg = 'var(--color-success-bg)';
    badgeColor = 'var(--color-success)';
  }

  return (
    <div
      id="smartops-one-recommendation-card"
      style={{
        border: `2px solid ${borderColor}`,
        backgroundColor: bgColor,
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        marginTop: '20px',
        boxShadow: '0 4px 12px rgba(53, 28, 21, 0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: badgeBg,
            color: badgeColor
          }}
        >
          {badgeLabel}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          ONE RECOMMENDED ACTION
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: `1.5px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Icon size={22} color={type === 'OVERTIME_REQUIRED' ? 'var(--color-danger)' : (type === 'BALANCED' ? 'var(--color-success)' : 'var(--color-brand-brown)')} />
        </div>

        <div style={{ flex: 1 }}>
          <h4
            id="primary-recommendation-text"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-brand-brown)',
              margin: 0,
              lineHeight: 1.35
            }}
          >
            {action}
          </h4>
        </div>
      </div>
    </div>
  );
}
