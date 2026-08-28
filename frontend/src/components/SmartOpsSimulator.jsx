import React, { useState } from 'react';
import ScenarioInput from './ScenarioInput';
import ScenarioChips from './ScenarioChips';
import SimulationResult from './SimulationResult';
import ValidationAlert from './ValidationAlert';
import { requestWhatIfSimulation } from '../services/api';

export default function SmartOpsSimulator({ facility }) {
  const [scenarioText, setScenarioText] = useState('What happens if inbound volume increases by 20% and 10% of workers are unavailable?');
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunTextScenario = async (textToRun) => {
    const query = textToRun || scenarioText;
    if (!query.trim()) {
      setError('Please enter a scenario description.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await requestWhatIfSimulation({ scenario: query });
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'What-if simulation failed. Please try a different query.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCustomModifiers = async (customParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await requestWhatIfSimulation({ customParams });
      setSimulationResult(res);
    } catch (err) {
      console.error('Custom modifier simulation error:', err);
      setError(err.message || 'Custom simulation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChip = (chipText) => {
    setScenarioText(chipText);
    handleRunTextScenario(chipText);
  };

  return (
    <div id="smartops-what-if-simulator-section" style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-brown)', marginBottom: '4px' }}>
          What-if Operational Simulator
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Ask what happens under unexpected volume shifts or workforce constraints to receive a digital-twin validated single dispatch action.
        </p>
      </div>

      <ValidationAlert error={error} />

      <ScenarioInput
        scenarioText={scenarioText}
        onScenarioTextChange={(val) => { setScenarioText(val); setError(null); }}
        onSubmitScenario={handleRunTextScenario}
        onRunCustomSimulation={handleRunCustomModifiers}
        isLoading={isLoading}
      />

      <ScenarioChips
        onSelectChip={handleSelectChip}
        disabled={isLoading}
      />

      {simulationResult && (
        <SimulationResult result={simulationResult} />
      )}
    </div>
  );
}
