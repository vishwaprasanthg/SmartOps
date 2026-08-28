import React, { useState, useEffect } from 'react';
import OperationsFilters from '../components/OperationsFilters';
import OperationsDataTable from '../components/OperationsDataTable';
import OperationsKpiCards from '../components/OperationsKpiCards';
import OperationsTrendChart from '../components/OperationsTrendChart';
import ValidationAlert from '../components/ValidationAlert';
import { OPERATIONS_DEMO_DATA } from '../data/operationsDemoData';
import { requestOperationsEfficiency } from '../services/api';

export default function OperationsEfficiency() {
  const [facility, setFacility] = useState(OPERATIONS_DEMO_DATA.facility);
  const [startDate, setStartDate] = useState(OPERATIONS_DEMO_DATA.startDate);
  const [endDate, setEndDate] = useState(OPERATIONS_DEMO_DATA.endDate);
  const [records, setRecords] = useState([...OPERATIONS_DEMO_DATA.records]);

  const [errorsByRow, setErrorsByRow] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Auto-run dashboard on initial mount with demo data
  useEffect(() => {
    handleRunDashboard();
  }, []);

  // Add row
  const handleAddRow = () => {
    const newId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setRecords(prev => [
      ...prev,
      {
        id: newId,
        date: endDate || '2026-08-30',
        inbound: '',
        outbound: '',
        processed: '',
        availableCapacity: '',
        availableWorkers: '',
        workingHours: 8,
        onTimeProcessed: '',
        exceptions: ''
      }
    ]);
    setGlobalError(null);
  };

  // Delete row
  const handleDeleteRow = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setErrorsByRow(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setGlobalError(null);
  };

  // Update row
  const handleUpdateRow = (id, field, value) => {
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
    setGlobalError(null);

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
    setFacility(OPERATIONS_DEMO_DATA.facility);
    setStartDate(OPERATIONS_DEMO_DATA.startDate);
    setEndDate(OPERATIONS_DEMO_DATA.endDate);
    setRecords(OPERATIONS_DEMO_DATA.records.map(r => ({ ...r })));
    setErrorsByRow({});
    setGlobalError(null);
  };

  // Clear all data
  const handleClearAll = () => {
    setRecords([]);
    setErrorsByRow({});
    setGlobalError(null);
    setResult(null);
  };

  // Validation
  const validateForm = () => {
    if (!facility || !facility.trim()) {
      setGlobalError('Facility is required.');
      return false;
    }

    if (!startDate || !startDate.trim()) {
      setGlobalError('Start date is required.');
      return false;
    }

    if (!endDate || !endDate.trim()) {
      setGlobalError('End date is required.');
      return false;
    }

    if (startDate > endDate) {
      setGlobalError(`Start date (${startDate}) cannot be after end date (${endDate}).`);
      return false;
    }

    if (records.length === 0) {
      setGlobalError('Please provide at least 1 operational record.');
      return false;
    }

    const newErrors = {};
    let hasRowError = false;

    records.forEach(r => {
      const rowErr = {};

      // Date
      if (!r.date || !r.date.trim()) {
        rowErr.date = 'Required';
        hasRowError = true;
      }

      // Inbound
      if (r.inbound === '' || r.inbound === null || r.inbound === undefined) {
        rowErr.inbound = 'Required';
        hasRowError = true;
      } else {
        const num = Number(r.inbound);
        if (isNaN(num) || num < 0) {
          rowErr.inbound = '>= 0 required';
          hasRowError = true;
        }
      }

      // Outbound
      if (r.outbound === '' || r.outbound === null || r.outbound === undefined) {
        rowErr.outbound = 'Required';
        hasRowError = true;
      } else {
        const num = Number(r.outbound);
        if (isNaN(num) || num < 0) {
          rowErr.outbound = '>= 0 required';
          hasRowError = true;
        }
      }

      // Processed
      let processedNum = 0;
      if (r.processed === '' || r.processed === null || r.processed === undefined) {
        rowErr.processed = 'Required';
        hasRowError = true;
      } else {
        processedNum = Number(r.processed);
        if (isNaN(processedNum) || processedNum < 0) {
          rowErr.processed = '>= 0 required';
          hasRowError = true;
        }
      }

      // Capacity
      if (r.availableCapacity === '' || r.availableCapacity === null || r.availableCapacity === undefined) {
        rowErr.availableCapacity = 'Required';
        hasRowError = true;
      } else {
        const num = Number(r.availableCapacity);
        if (isNaN(num) || num <= 0) {
          rowErr.availableCapacity = '> 0 required';
          hasRowError = true;
        }
      }

      // Workers
      if (r.availableWorkers === '' || r.availableWorkers === null || r.availableWorkers === undefined) {
        rowErr.availableWorkers = 'Required';
        hasRowError = true;
      } else {
        const num = Number(r.availableWorkers);
        if (isNaN(num) || !Number.isInteger(num) || num < 0) {
          rowErr.availableWorkers = 'Integer >= 0';
          hasRowError = true;
        }
      }

      // Working Hours
      if (r.workingHours === '' || r.workingHours === null || r.workingHours === undefined) {
        rowErr.workingHours = 'Required';
        hasRowError = true;
      } else {
        const num = Number(r.workingHours);
        if (isNaN(num) || num <= 0) {
          rowErr.workingHours = '> 0 required';
          hasRowError = true;
        }
      }

      // On-Time
      if (r.onTimeProcessed === '' || r.onTimeProcessed === null || r.onTimeProcessed === undefined) {
        rowErr.onTimeProcessed = 'Required';
        hasRowError = true;
      } else {
        const num = Number(r.onTimeProcessed);
        if (isNaN(num) || num < 0) {
          rowErr.onTimeProcessed = '>= 0 required';
          hasRowError = true;
        } else if (num > processedNum) {
          rowErr.onTimeProcessed = '<= Processed';
          hasRowError = true;
        }
      }

      // Exceptions
      if (r.exceptions === '' || r.exceptions === null || r.exceptions === undefined) {
        rowErr.exceptions = 'Required';
        hasRowError = true;
      } else {
        const num = Number(r.exceptions);
        if (isNaN(num) || num < 0) {
          rowErr.exceptions = '>= 0 required';
          hasRowError = true;
        }
      }

      if (Object.keys(rowErr).length > 0) {
        newErrors[r.id] = rowErr;
      }
    });

    setErrorsByRow(newErrors);

    if (hasRowError) {
      setGlobalError('Validation Error: Please check and correct the highlighted fields in the table.');
      return false;
    }

    setGlobalError(null);
    return true;
  };

  // Run/Update Dashboard
  const handleRunDashboard = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setGlobalError(null);

    try {
      const res = await requestOperationsEfficiency({
        facility,
        startDate,
        endDate,
        records
      });
      setResult(res);
    } catch (err) {
      console.error('Operations efficiency dashboard error:', err);
      setGlobalError(err.message || 'Unable to update dashboard. Please check operational records.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" id="operations-efficiency-page">
      <div className="page-intro">
        <h2>Operations Efficiency Dashboard</h2>
        <p>
          Track historical operational KPIs, evaluate capacity health thresholds, and analyze multi-day performance trends across your facility.
        </p>
      </div>

      <ValidationAlert error={globalError} />

      <OperationsFilters
        facility={facility}
        startDate={startDate}
        endDate={endDate}
        onFacilityChange={(val) => { setFacility(val); setGlobalError(null); }}
        onStartDateChange={(val) => { setStartDate(val); setGlobalError(null); }}
        onEndDateChange={(val) => { setEndDate(val); setGlobalError(null); }}
        disabled={isLoading}
      />

      <OperationsDataTable
        records={records}
        errorsByRow={errorsByRow}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        onUpdateRow={handleUpdateRow}
        onLoadDemo={handleLoadDemo}
        onClearAll={handleClearAll}
        onUpdateDashboard={handleRunDashboard}
        isLoading={isLoading}
      />

      {result && (
        <section style={{ marginTop: '28px' }}>
          <OperationsKpiCards
            summary={result.summary}
            status={result.status}
            daysCount={result.daysCount}
            facility={result.facility}
          />
          <OperationsTrendChart
            trends={result.trends}
            trendDirections={result.trendDirections}
          />
        </section>
      )}
    </div>
  );
}
