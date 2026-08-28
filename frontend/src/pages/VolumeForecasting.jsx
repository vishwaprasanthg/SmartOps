import React, { useState, useEffect } from 'react';
import ForecastDateRange from '../components/ForecastDateRange';
import HistoricalCsvUpload from '../components/HistoricalCsvUpload';
import ForecastSummaryCards from '../components/ForecastSummaryCards';
import ForecastTable from '../components/ForecastTable';
import ValidationAlert from '../components/ValidationAlert';
import { DEMO_CSV_FILENAME, DEMO_CSV_TEXT } from '../data/demoCsvData';
import { requestForecast, uploadHistoricalCsv } from '../services/api';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function VolumeForecasting() {
  const [facility] = useState('Demo Hub');
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-14');
  const [fileName, setFileName] = useState('');
  const [historicalData, setHistoricalData] = useState(null);
  const [csvSummary, setCsvSummary] = useState({ minDate: '', maxDate: '', gaps: [] });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');
  const [globalError, setGlobalError] = useState(null);
  const [forecastResult, setForecastResult] = useState(null);

  // Auto-load demo CSV on initial page mount
  useEffect(() => {
    handleLoadDemoCsv();
  }, []);

  // Handle CSV file upload & persistence
  const handleFileUpload = async (name, content) => {
    setGlobalError(null);
    setForecastResult(null);

    try {
      const res = await uploadHistoricalCsv({
        csvContent: content,
        fileName: name,
        facility
      });

      setFileName(name);
      setHistoricalData(res.data);
      setCsvSummary({
        minDate: res.minDate,
        maxDate: res.maxDate,
        gaps: res.gaps || []
      });

      // Automatically suggest a valid From Date (day after max historical date)
      if (res.maxDate) {
        const nextDay = new Date(res.maxDate + 'T00:00:00Z');
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        const endDay = new Date(res.maxDate + 'T00:00:00Z');
        endDay.setUTCDate(endDay.getUTCDate() + 14);
        const endDayStr = endDay.toISOString().split('T')[0];

        setFromDate(nextDayStr);
        setToDate(endDayStr);
      }
    } catch (err) {
      setGlobalError(err.message || 'Failed to parse and store CSV file.');
      setFileName('');
      setHistoricalData(null);
    }
  };

  // Load demo CSV
  const handleLoadDemoCsv = () => {
    handleFileUpload(DEMO_CSV_FILENAME, DEMO_CSV_TEXT);
  };

  // Clear CSV
  const handleClearCsv = () => {
    setFileName('');
    setHistoricalData(null);
    setCsvSummary({ minDate: '', maxDate: '', gaps: [] });
    setGlobalError(null);
    setForecastResult(null);
  };

  // Validation
  const validateInputs = () => {
    if (!historicalData || historicalData.length === 0) {
      setGlobalError('Please upload historical operational CSV data before generating a forecast.');
      return false;
    }

    if (!fromDate || !fromDate.trim()) {
      setGlobalError('From Date is required.');
      return false;
    }

    if (!toDate || !toDate.trim()) {
      setGlobalError('To Date is required.');
      return false;
    }

    if (fromDate > toDate) {
      setGlobalError(`To Date (${toDate}) must be greater than or equal to From Date (${fromDate}).`);
      return false;
    }

    // Historical overlap check
    if (csvSummary.maxDate && fromDate <= csvSummary.maxDate) {
      setGlobalError(`Forecast period must start after the latest historical date (${csvSummary.maxDate}).`);
      return false;
    }

    setGlobalError(null);
    return true;
  };

  // Generate Forecast
  const handleGenerateForecast = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setGlobalError(null);
    setForecastResult(null);

    try {
      // Progressive loading experience
      setLoadingStepText('Preparing historical data...');
      await new Promise(r => setTimeout(r, 200));

      setLoadingStepText('Running Chronos-2 forecast...');

      const result = await requestForecast({
        fromDate,
        toDate,
        historicalData,
        facility
      });

      setLoadingStepText('Preparing forecast results...');
      await new Promise(r => setTimeout(r, 150));

      setForecastResult(result);
    } catch (err) {
      console.error('Forecast generation error:', err);
      setGlobalError(err.message || 'Chronos-2 forecasting failed. Please verify the historical data and try again.');
    } finally {
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  return (
    <div className="page-container" id="volume-forecasting-page">
      <div className="page-intro">
        <h2>Volume Forecasting</h2>
        <p>
          Upload historical operational data and select the future date range to generate a forecast using Chronos-2.
        </p>
      </div>

      <ValidationAlert error={globalError} />

      <HistoricalCsvUpload
        fileName={fileName}
        historicalData={historicalData}
        csvSummary={csvSummary}
        onFileUpload={handleFileUpload}
        onLoadDemoCsv={handleLoadDemoCsv}
        onClearCsv={handleClearCsv}
        disabled={isLoading}
      />

      <ForecastDateRange
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={(val) => { setFromDate(val); setGlobalError(null); }}
        onToDateChange={(val) => { setToDate(val); setGlobalError(null); }}
        minFromDate={csvSummary.maxDate}
        disabled={isLoading}
      />

      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerateForecast}
          disabled={isLoading || !historicalData || historicalData.length === 0}
          id="btn-generate-forecast"
          style={{ minWidth: '240px', padding: '11px 22px', fontSize: '0.95rem' }}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              {loadingStepText || 'Running Chronos-2 forecast...'}
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Forecast
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Forecast Output */}
      {forecastResult && (
        <section id="forecast-results-section">
          <ForecastSummaryCards
            forecastPeriod={forecastResult.forecastPeriod}
            summary={forecastResult.summary}
          />
          <ForecastTable
            forecast={forecastResult.forecast}
            modelInfo={forecastResult.model}
          />
        </section>
      )}
    </div>
  );
}
