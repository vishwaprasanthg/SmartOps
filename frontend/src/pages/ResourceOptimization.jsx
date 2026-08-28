import React, { useState } from 'react';
import SmartOpsSimulator from '../components/SmartOpsSimulator';
import ResourceInputForm from '../components/ResourceInputForm';
import ResourceTable from '../components/ResourceTable';
import ResourceOptimizationResults from '../components/ResourceOptimizationResults';
import ResourceRecommendation from '../components/ResourceRecommendation';
import ValidationAlert from '../components/ValidationAlert';
import { RESOURCE_DEMO_DATA } from '../data/resourceDemoData';
import { requestResourceOptimization } from '../services/api';
import { Sparkles, TableProperties } from 'lucide-react';

export default function ResourceOptimization() {
  const [activeSubView, setActiveSubView] = useState('simulator'); // 'simulator' | 'matrix'
  const [planningDate, setPlanningDate] = useState(RESOURCE_DEMO_DATA.planningDate);
  const [facility, setFacility] = useState(RESOURCE_DEMO_DATA.facility);
  const [forecastedVolume, setForecastedVolume] = useState(RESOURCE_DEMO_DATA.forecastedVolume);
  const [resources, setResources] = useState([...RESOURCE_DEMO_DATA.resources]);

  const [errorsByRow, setErrorsByRow] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Add new empty row
  const handleAddRow = () => {
    const newId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setResources(prev => [
      ...prev,
      { id: newId, name: '', unit: '', required: '', available: '' }
    ]);
    setGlobalError(null);
    if (result) setResult(null);
  };

  // Delete row
  const handleDeleteRow = (id) => {
    setResources(prev => prev.filter(r => r.id !== id));
    setErrorsByRow(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setGlobalError(null);
    if (result) setResult(null);
  };

  // Update row cell
  const handleUpdateRow = (id, field, value) => {
    setResources(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
    setGlobalError(null);
    if (result) setResult(null);

    if (errorsByRow[id] && errorsByRow[id][field]) {
      setErrorsByRow(prev => {
        const rowErr = { ...(prev[id] || {}) };
        delete rowErr[field];
        if (Object.keys(rowErr).length === 0) {
          const next = { ...prev };
          delete next[id];
          return next;
        }
        return { ...prev, [id]: rowErr };
      });
    }
  };

  // Load demo data
  const handleLoadDemo = () => {
    setPlanningDate(RESOURCE_DEMO_DATA.planningDate);
    setFacility(RESOURCE_DEMO_DATA.facility);
    setForecastedVolume(RESOURCE_DEMO_DATA.forecastedVolume);
    setResources(RESOURCE_DEMO_DATA.resources.map(r => ({ ...r })));
    setErrorsByRow({});
    setGlobalError(null);
    setResult(null);
  };

  // Clear all rows
  const handleClearAll = () => {
    setResources([]);
    setErrorsByRow({});
    setGlobalError(null);
    setResult(null);
  };

  // Validation
  const validateForm = () => {
    if (!planningDate || !planningDate.trim()) {
      setGlobalError('Planning date is required.');
      return false;
    }

    if (!facility || !facility.trim()) {
      setGlobalError('Facility is required.');
      return false;
    }

    if (resources.length === 0) {
      setGlobalError('Please configure at least 1 resource before running optimization.');
      return false;
    }

    const newErrors = {};
    const seenNames = new Set();
    let hasRowError = false;

    resources.forEach((r, idx) => {
      const rowErr = {};

      if (!r.name || !r.name.trim()) {
        rowErr.name = 'Required';
        hasRowError = true;
      } else {
        const lower = r.name.trim().toLowerCase();
        if (seenNames.has(lower)) {
          rowErr.name = 'Duplicate';
          hasRowError = true;
        }
        seenNames.add(lower);
      }

      if (!r.unit || !r.unit.trim()) {
        rowErr.unit = 'Required';
        hasRowError = true;
      }

      if (r.required === '' || r.required === null || r.required === undefined) {
        rowErr.required = 'Required';
        hasRowError = true;
      } else {
        const reqNum = Number(r.required);
        if (isNaN(reqNum)) {
          rowErr.required = 'Must be a number';
          hasRowError = true;
        } else if (reqNum < 0) {
          rowErr.required = '>= 0 required';
          hasRowError = true;
        }
      }

      if (r.available === '' || r.available === null || r.available === undefined) {
        rowErr.available = 'Required';
        hasRowError = true;
      } else {
        const availNum = Number(r.available);
        if (isNaN(availNum)) {
          rowErr.available = 'Must be a number';
          hasRowError = true;
        } else if (availNum < 0) {
          rowErr.available = '>= 0 required';
          hasRowError = true;
        }
      }

      if (Object.keys(rowErr).length > 0) {
        newErrors[r.id] = rowErr;
      }
    });

    setErrorsByRow(newErrors);

    if (hasRowError) {
      setGlobalError('Validation Error: Please correct the highlighted fields in the resource table.');
      return false;
    }

    setGlobalError(null);
    return true;
  };

  // Submit optimization
  const handleOptimize = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setGlobalError(null);

    try {
      const res = await requestResourceOptimization({
        planningDate,
        facility,
        forecastedVolume,
        resources
      });
      setResult(res);
    } catch (err) {
      console.error('Resource optimization error:', err);
      setGlobalError(err.message || 'Unable to optimize resources. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" id="resource-optimization-page">
      <div className="page-intro">
        <h2>Resource Optimization & Simulation</h2>
        <p>
          Simulate hypothetical operational scenarios in real time and evaluate deterministic facility capacity allocations.
        </p>
      </div>

      {/* Subview Selector */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid var(--border-subtle)',
          paddingBottom: '12px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubView('simulator')}
          id="tab-subview-simulator"
          className="btn"
          style={{
            backgroundColor: activeSubView === 'simulator' ? 'var(--color-brand-brown)' : '#FFFFFF',
            color: activeSubView === 'simulator' ? '#FFFFFF' : 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Sparkles size={15} color={activeSubView === 'simulator' ? 'var(--color-brand-gold)' : 'var(--color-brand-brown)'} />
          What-if Simulator
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('matrix')}
          id="tab-subview-matrix"
          className="btn"
          style={{
            backgroundColor: activeSubView === 'matrix' ? 'var(--color-brand-brown)' : '#FFFFFF',
            color: activeSubView === 'matrix' ? '#FFFFFF' : 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <TableProperties size={15} color={activeSubView === 'matrix' ? 'var(--color-brand-gold)' : 'var(--color-brand-brown)'} />
          Resource Capacity Matrix
        </button>
      </div>

      {/* Subview 1: SMARTOPS What-if Operational Simulator */}
      {activeSubView === 'simulator' && (
        <SmartOpsSimulator facility={facility} />
      )}

      {/* Subview 2: Resource Capacity Matrix (Feature 03 Engine) */}
      {activeSubView === 'matrix' && (
        <div id="resource-capacity-matrix-section">
          <ValidationAlert error={globalError} />

          <ResourceInputForm
            planningDate={planningDate}
            facility={facility}
            forecastedVolume={forecastedVolume}
            onPlanningDateChange={(val) => { setPlanningDate(val); setGlobalError(null); }}
            onFacilityChange={(val) => { setFacility(val); setGlobalError(null); }}
            onForecastedVolumeChange={(val) => { setForecastedVolume(val); setGlobalError(null); }}
            disabled={isLoading}
          />

          <ResourceTable
            resources={resources}
            errorsByRow={errorsByRow}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onUpdateRow={handleUpdateRow}
            onLoadDemo={handleLoadDemo}
            onClearAll={handleClearAll}
            onOptimize={handleOptimize}
            isLoading={isLoading}
          />

          {result && (
            <section style={{ marginTop: '28px' }}>
              <ResourceOptimizationResults result={result} />
              <ResourceRecommendation
                highestPriorityResource={result.highestPriorityResource}
                recommendation={result.recommendation}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
