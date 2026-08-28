import React, { useState } from 'react';
import WorkforceInputForm from '../components/WorkforceInputForm';
import WorkforceResultCards from '../components/WorkforceResultCards';
import WorkforceRecommendation from '../components/WorkforceRecommendation';
import ValidationAlert from '../components/ValidationAlert';
import { WORKFORCE_DEMO_DATA } from '../data/workforceDemoData';
import { requestWorkforceCalculation } from '../services/api';

export default function WorkforcePlanning() {
  const [formData, setFormData] = useState({ ...WORKFORCE_DEMO_DATA });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Field change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setGlobalError(null);
    if (result) setResult(null);

    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Load demo data
  const handleLoadDemo = () => {
    setFormData({ ...WORKFORCE_DEMO_DATA });
    setErrors({});
    setGlobalError(null);
    setResult(null);
  };

  // Frontend validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.planningDate || !formData.planningDate.trim()) {
      newErrors.planningDate = 'Planning date is required.';
    }

    if (!formData.facility || !formData.facility.trim()) {
      newErrors.facility = 'Facility is required.';
    }

    // Inbound volume
    if (formData.inboundVolume === '' || formData.inboundVolume === null || formData.inboundVolume === undefined) {
      newErrors.inboundVolume = 'Required field.';
    } else {
      const num = Number(formData.inboundVolume);
      if (isNaN(num)) newErrors.inboundVolume = 'Must be a number.';
      else if (num < 0) newErrors.inboundVolume = 'Cannot be negative.';
    }

    // Outbound volume
    if (formData.outboundVolume === '' || formData.outboundVolume === null || formData.outboundVolume === undefined) {
      newErrors.outboundVolume = 'Required field.';
    } else {
      const num = Number(formData.outboundVolume);
      if (isNaN(num)) newErrors.outboundVolume = 'Must be a number.';
      else if (num < 0) newErrors.outboundVolume = 'Cannot be negative.';
    }

    // Available workers
    if (formData.availableWorkers === '' || formData.availableWorkers === null || formData.availableWorkers === undefined) {
      newErrors.availableWorkers = 'Required field.';
    } else {
      const num = Number(formData.availableWorkers);
      if (isNaN(num)) newErrors.availableWorkers = 'Must be a number.';
      else if (!Number.isInteger(num)) newErrors.availableWorkers = 'Must be an integer.';
      else if (num < 0) newErrors.availableWorkers = 'Cannot be negative.';
    }

    // Working hours per worker
    if (formData.hoursPerWorker === '' || formData.hoursPerWorker === null || formData.hoursPerWorker === undefined) {
      newErrors.hoursPerWorker = 'Required field.';
    } else {
      const num = Number(formData.hoursPerWorker);
      if (isNaN(num)) newErrors.hoursPerWorker = 'Must be a number.';
      else if (num <= 0) newErrors.hoursPerWorker = 'Must be greater than 0.';
    }

    // Inbound productivity
    if (formData.inboundProductivity === '' || formData.inboundProductivity === null || formData.inboundProductivity === undefined) {
      newErrors.inboundProductivity = 'Required field.';
    } else {
      const num = Number(formData.inboundProductivity);
      if (isNaN(num)) newErrors.inboundProductivity = 'Must be a number.';
      else if (num <= 0) newErrors.inboundProductivity = 'Must be greater than 0.';
    }

    // Outbound productivity
    if (formData.outboundProductivity === '' || formData.outboundProductivity === null || formData.outboundProductivity === undefined) {
      newErrors.outboundProductivity = 'Required field.';
    } else {
      const num = Number(formData.outboundProductivity);
      if (isNaN(num)) newErrors.outboundProductivity = 'Must be a number.';
      else if (num <= 0) newErrors.outboundProductivity = 'Must be greater than 0.';
    }

    // Staffing buffer
    if (formData.staffingBufferPercent === '' || formData.staffingBufferPercent === null || formData.staffingBufferPercent === undefined) {
      newErrors.staffingBufferPercent = 'Required field.';
    } else {
      const num = Number(formData.staffingBufferPercent);
      if (isNaN(num)) newErrors.staffingBufferPercent = 'Must be a number.';
      else if (num < 0) newErrors.staffingBufferPercent = 'Cannot be negative.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      setGlobalError(`Validation Error: Please correct ${newErrors[firstKey]}`);
      return false;
    }

    setGlobalError(null);
    return true;
  };

  // Submit calculation
  const handleCalculate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setGlobalError(null);

    try {
      const res = await requestWorkforceCalculation(formData);
      setResult(res);
    } catch (err) {
      console.error('Workforce calculation error:', err);
      setGlobalError(err.message || 'Unable to calculate workforce requirement. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container" id="workforce-planning-page">
      <div className="page-intro">
        <h2>Smart Workforce Planning</h2>
        <p>
          Calculate required headcounts from forecasted operational volumes, identify staffing gaps, and evaluate capacity status.
        </p>
      </div>

      <ValidationAlert error={globalError} />

      <WorkforceInputForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onLoadDemo={handleLoadDemo}
        onSubmit={handleCalculate}
        isLoading={isLoading}
      />

      {result && (
        <section style={{ marginTop: '28px' }}>
          <WorkforceResultCards result={result} />
          <WorkforceRecommendation
            status={result.status}
            recommendation={result.recommendation}
          />
        </section>
      )}
    </div>
  );
}
