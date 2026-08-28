import React, { useRef } from 'react';
import { UploadCloud, FileText, Database, X, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';

export default function HistoricalCsvUpload({
  fileName,
  historicalData,
  csvSummary,
  onFileUpload,
  onLoadDemoCsv,
  onClearCsv,
  disabled
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onFileUpload(file.name, event.target.result);
    };
    reader.readAsText(file);
    // reset input so the same file can be re-uploaded if desired
    e.target.value = '';
  };

  const previewRows = historicalData ? historicalData.slice(0, 6) : [];

  return (
    <div className="card" id="historical-csv-upload-card">
      <div className="card-header">
        <div className="card-title-group">
          <UploadCloud size={18} color="var(--color-brand-brown)" />
          <h3>Historical Operational Data (CSV)</h3>
        </div>
        <span className="card-subtitle">
          Primary historical time-series data source for Chronos-2 model inference
        </span>
      </div>

      {/* Upload Zone */}
      <div
        style={{
          border: '2px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 20px',
          textAlign: 'center',
          backgroundColor: fileName ? '#FDFBF7' : '#FAF9F6',
          transition: 'all 0.2s ease',
          marginBottom: '18px'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="csv-file-input"
          disabled={disabled}
        />

        {fileName ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand-brown)', fontWeight: 600, fontSize: '0.95rem' }}>
              <FileText size={20} color="var(--color-brand-gold)" />
              <span>{fileName}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({historicalData ? historicalData.length : 0} records loaded)
            </span>
            <button
              type="button"
              className="btn btn-danger-ghost"
              onClick={onClearCsv}
              disabled={disabled}
              title="Remove uploaded CSV"
              style={{ padding: '4px 8px' }}
            >
              <X size={15} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <UploadCloud size={36} color="var(--color-brand-brown)" style={{ marginBottom: '8px', opacity: 0.8 }} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>
              Select an operational volume CSV file from your computer
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Required columns: <code>date</code>, <code>inbound</code>, <code>outbound</code>, <code>inventory</code>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={disabled}
                id="btn-select-csv"
              >
                Browse CSV File
              </button>
              <button
                type="button"
                className="btn btn-outline-brown"
                onClick={onLoadDemoCsv}
                disabled={disabled}
                id="btn-load-demo-csv"
              >
                <Database size={14} />
                Load Demo CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historical Data Preview & Summary */}
      {historicalData && historicalData.length > 0 && (
        <div id="historical-data-preview-section">
          {/* Summary Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F5EFEB',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '0.84rem',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span>Historical Records: <strong>{historicalData.length}</strong></span>
              <span>
                Date Range: <strong>{csvSummary.minDate}</strong> &rarr; <strong>{csvSummary.maxDate}</strong>
              </span>
            </div>

            {csvSummary.gaps && csvSummary.gaps.length > 0 ? (
              <span style={{ color: '#B45309', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <AlertTriangle size={13} /> {csvSummary.gaps.length} date gap(s) detected
              </span>
            ) : (
              <span style={{ color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> Continuous time-series
              </span>
            )}
          </div>

          {/* Table Preview */}
          <div className="table-wrapper">
            <table className="data-table" aria-label="Historical CSV Data Preview">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Date</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Inbound Volume</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Outbound Volume</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Inventory Volume</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.date}>
                    <td style={{ fontWeight: 600, color: 'var(--color-brand-brown)' }}>{row.date}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.inbound.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.outbound.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.inventory.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {historicalData.length > previewRows.length && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
              Showing first {previewRows.length} of {historicalData.length} historical records
            </p>
          )}
        </div>
      )}
    </div>
  );
}
