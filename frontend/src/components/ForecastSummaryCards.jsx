import React from 'react';
import { Calendar, ArrowDownLeft, ArrowUpRight, Package, Clock } from 'lucide-react';

export default function ForecastSummaryCards({ forecastPeriod, summary }) {
  if (!summary || !forecastPeriod) return null;

  return (
    <div className="forecast-summary-section" id="forecast-summary-cards">
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '20px' }}>
        {/* Forecast Period */}
        <div className="metric-card metric-outbound" id="card-fc-period">
          <div>
            <div className="metric-header">
              <span className="metric-label">Forecast Period</span>
              <span className="metric-pill">
                <Calendar size={11} style={{ display: 'inline', marginRight: '2px' }} />
                Horizon
              </span>
            </div>
            <div className="metric-value" style={{ fontSize: '1.25rem', paddingTop: '6px' }}>
              {forecastPeriod.from} &rarr; {forecastPeriod.to}
            </div>
          </div>
          <div className="metric-footer">
            <span>Forecast Length: <strong>{forecastPeriod.days} days</strong></span>
            <span>Target Window</span>
          </div>
        </div>

        {/* Average Inbound */}
        <div className="metric-card metric-inbound" id="card-fc-inbound">
          <div>
            <div className="metric-header">
              <span className="metric-label">Avg Daily Inbound</span>
              <span className="metric-pill">
                <ArrowDownLeft size={11} style={{ display: 'inline', marginRight: '2px' }} />
                Predicted
              </span>
            </div>
            <div className="metric-value">
              {summary.avgInbound.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Total: <strong>{summary.totalInbound.toLocaleString()}</strong></span>
            <span>units/day</span>
          </div>
        </div>

        {/* Average Outbound */}
        <div className="metric-card metric-outbound" id="card-fc-outbound">
          <div>
            <div className="metric-header">
              <span className="metric-label">Avg Daily Outbound</span>
              <span className="metric-pill">
                <ArrowUpRight size={11} style={{ display: 'inline', marginRight: '2px' }} />
                Predicted
              </span>
            </div>
            <div className="metric-value">
              {summary.avgOutbound.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Total: <strong>{summary.totalOutbound.toLocaleString()}</strong></span>
            <span>units/day</span>
          </div>
        </div>

        {/* Average Inventory */}
        <div className="metric-card metric-inventory" id="card-fc-inventory">
          <div>
            <div className="metric-header">
              <span className="metric-label">Avg Daily Inventory</span>
              <span className="metric-pill">
                <Package size={11} style={{ display: 'inline', marginRight: '2px' }} />
                Predicted
              </span>
            </div>
            <div className="metric-value">
              {summary.avgInventory.toLocaleString()}
            </div>
          </div>
          <div className="metric-footer">
            <span>Total: <strong>{summary.totalInventory.toLocaleString()}</strong></span>
            <span>units/day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
