import React from 'react';
import { Package, TrendingUp, Users, Layers, Activity } from 'lucide-react';

export default function Header({ activeTab, onTabChange }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-badge">
          <div className="brand-icon">
            <Package size={22} />
          </div>
          <div className="brand-titles">
            <h1>SmartOps</h1>
            <p>Predict. Optimize. Act.</p>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <nav className="header-nav" aria-label="Feature Navigation">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'forecasting' ? 'active' : ''}`}
            onClick={() => onTabChange('forecasting')}
            id="tab-nav-forecasting"
          >
            <TrendingUp size={15} />
            Volume Forecasting
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'workforce' ? 'active' : ''}`}
            onClick={() => onTabChange('workforce')}
            id="tab-nav-workforce"
          >
            <Users size={15} />
            Smart Workforce Planning
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => onTabChange('resources')}
            id="tab-nav-resources"
          >
            <Layers size={15} />
            Resource Optimization
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'operations' ? 'active' : ''}`}
            onClick={() => onTabChange('operations')}
            id="tab-nav-operations"
          >
            <Activity size={15} />
            Operations Efficiency
          </button>
        </nav>
      </div>
    </header>
  );
}
