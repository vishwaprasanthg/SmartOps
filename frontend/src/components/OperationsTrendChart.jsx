import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

const METRIC_OPTIONS = [
  { value: 'capacityUtilizationPercent', label: 'Capacity Utilization', unit: '%', color: '#351C15' },
  { value: 'inbound', label: 'Inbound Volume', unit: 'units', color: '#D97706' },
  { value: 'outbound', label: 'Outbound Volume', unit: 'units', color: '#351C15' },
  { value: 'processed', label: 'Processed Volume', unit: 'units', color: '#0D9488' },
  { value: 'throughput', label: 'Throughput', unit: 'units/hr', color: '#2563EB' },
  { value: 'onTimeRatePercent', label: 'On-Time Rate', unit: '%', color: '#16A34A' },
  { value: 'exceptionRatePercent', label: 'Exception Rate', unit: '%', color: '#DC2626' }
];

export default function OperationsTrendChart({ trends, trendDirections }) {
  const [selectedMetric, setSelectedMetric] = useState('capacityUtilizationPercent');

  if (!trends || trends.length === 0) return null;

  const currentMetricConfig = METRIC_OPTIONS.find(m => m.value === selectedMetric) || METRIC_OPTIONS[0];
  const currentDirection = (trendDirections && trendDirections[selectedMetric]) || 'STABLE';

  const renderTrendBadge = (direction, metricKey) => {
    let bg = '#F3F4F6';
    let color = '#4B5563';
    let border = '#E5E7EB';
    let icon = <Minus size={14} />;

    if (direction === 'IMPROVING') {
      bg = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      border = '#86EFAC';
      icon = metricKey === 'exceptionRatePercent' ? <TrendingDown size={14} /> : <TrendingUp size={14} />;
    } else if (direction === 'DECLINING') {
      bg = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      border = 'var(--color-danger-border)';
      icon = metricKey === 'exceptionRatePercent' ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
    }

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          fontWeight: 700,
          fontSize: '0.8rem'
        }}
      >
        {icon}
        <span>Latest Trend: <strong>{direction}</strong></span>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.85rem'
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            Date: {label}
          </p>
          <p style={{ color: currentMetricConfig.color, fontWeight: 700 }}>
            {currentMetricConfig.label}: {dataPoint.value.toLocaleString()} {currentMetricConfig.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" id="operations-trend-card" style={{ marginTop: '24px' }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="card-title-group">
          <Activity size={18} color="var(--color-brand-brown)" />
          <h3>Operations Daily Trend Analysis</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="ops-metric-selector" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Select KPI:
            </label>
            <select
              id="ops-metric-selector"
              className="select-input"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              aria-label="Select KPI Metric for Trend Analysis"
            >
              {METRIC_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.unit})
                </option>
              ))}
            </select>
          </div>

          {renderTrendBadge(currentDirection, selectedMetric)}
        </div>
      </div>

      <div style={{ width: '100%', height: 320, marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends} margin={{ top: 15, right: 25, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
            <XAxis
              dataKey="date"
              stroke="#78716C"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#78716C"
              fontSize={12}
              tickLine={false}
              unit={currentMetricConfig.unit === '%' ? '%' : ''}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentMetricConfig.color}
              strokeWidth={2.8}
              dot={{ r: 4.5, fill: 'var(--color-brand-gold)', stroke: currentMetricConfig.color, strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: currentMetricConfig.color }}
              name={currentMetricConfig.label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
