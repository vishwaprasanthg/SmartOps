import React from 'react';
import { AlertCircle, CheckCircle2, Info, Lightbulb } from 'lucide-react';

export default function WorkforceRecommendation({ status, recommendation }) {
  if (!recommendation) return null;

  const getAlertDesign = (st) => {
    switch (st) {
      case 'UNDERSTAFFED':
        return {
          bg: '#FEF2F2',
          border: '#FCA5A5',
          color: '#991B1B',
          icon: <AlertCircle size={20} color="#DC2626" />
        };
      case 'ADEQUATELY STAFFED':
        return {
          bg: '#F0FDF4',
          border: '#86EFAC',
          color: '#166534',
          icon: <CheckCircle2 size={20} color="#16A34A" />
        };
      case 'EXCESS CAPACITY':
        return {
          bg: '#EFF6FF',
          border: '#93C5FD',
          color: '#1E40AF',
          icon: <Info size={20} color="#2563EB" />
        };
      default:
        return {
          bg: '#FAF8F5',
          border: 'var(--border-subtle)',
          color: 'var(--text-main)',
          icon: <Lightbulb size={20} color="var(--color-brand-brown)" />
        };
    }
  };

  const design = getAlertDesign(status);

  return (
    <div
      className="card"
      id="workforce-recommendation-card"
      style={{
        backgroundColor: design.bg,
        borderColor: design.border,
        color: design.color,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '18px 20px',
        marginTop: '20px'
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {design.icon}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
          Operational Staffing Recommendation
        </div>
        <div style={{ fontSize: '0.98rem', fontWeight: 600, lineHeight: 1.4 }}>
          {recommendation}
        </div>
      </div>
    </div>
  );
}
