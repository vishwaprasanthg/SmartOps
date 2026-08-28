import React, { useState } from 'react';
import Header from './components/Header';
import VolumeForecasting from './pages/VolumeForecasting';
import WorkforcePlanning from './pages/WorkforcePlanning';
import ResourceOptimization from './pages/ResourceOptimization';
import OperationsEfficiency from './pages/OperationsEfficiency';

export default function App() {
  const [activeTab, setActiveTab] = useState('forecasting');

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="main-content">
        {activeTab === 'forecasting' && <VolumeForecasting />}
        {activeTab === 'workforce' && <WorkforcePlanning />}
        {activeTab === 'resources' && <ResourceOptimization />}
        {activeTab === 'operations' && <OperationsEfficiency />}
      </main>
      <footer className="app-footer">
        <p>
          SmartOps &bull; Feature 01: Volume Forecasting &bull; Feature 02: Smart Workforce Planning &bull; Feature 03: Resource Optimization &bull; Feature 04: Operations Efficiency
        </p>
      </footer>
    </div>
  );
}
