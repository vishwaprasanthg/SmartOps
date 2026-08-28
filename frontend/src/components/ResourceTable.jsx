import React from 'react';
import { Plus, Database, Trash2, ArrowRight, Layers, AlertCircle } from 'lucide-react';

export default function ResourceTable({
  resources,
  errorsByRow = {},
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  onLoadDemo,
  onClearAll,
  onOptimize,
  isLoading
}) {
  return (
    <div className="card" id="resource-input-table-card">
      <div className="card-header">
        <div className="card-title-group">
          <Layers size={18} color="var(--color-brand-brown)" />
          <h3>Resource Capacity Inputs</h3>
        </div>
        <span className="card-subtitle">
          {resources.length} {resources.length === 1 ? 'resource' : 'resources'} configured
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table" aria-label="Resource Capacity Inputs">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Resource Name</th>
              <th style={{ width: '22%' }}>Capacity Unit</th>
              <th style={{ width: '22%' }}>Required Capacity</th>
              <th style={{ width: '20%' }}>Available Capacity</th>
              <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>No resource categories entered.</p>
                    <p style={{ fontSize: '0.84rem' }}>
                      Click <strong>"Load Demo Data"</strong> or <strong>"+ Add Resource"</strong> to begin.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              resources.map((row, index) => {
                const rowErrors = errorsByRow[row.id] || {};
                const hasError = Object.keys(rowErrors).length > 0;

                return (
                  <tr key={row.id} className={hasError ? 'row-error' : ''}>
                    <td>
                      <input
                        type="text"
                        className={`table-input ${rowErrors.name ? 'input-error' : ''}`}
                        value={row.name}
                        onChange={(e) => onUpdateRow(row.id, 'name', e.target.value)}
                        placeholder="e.g. Processing Capacity"
                        aria-label={`Resource name for row ${index + 1}`}
                      />
                      {rowErrors.name && (
                        <div className="field-error-msg">
                          <AlertCircle size={11} /> {rowErrors.name}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`table-input ${rowErrors.unit ? 'input-error' : ''}`}
                        value={row.unit}
                        onChange={(e) => onUpdateRow(row.id, 'unit', e.target.value)}
                        placeholder="e.g. packages/day, vehicles"
                        aria-label={`Unit for row ${index + 1}`}
                      />
                      {rowErrors.unit && (
                        <div className="field-error-msg">
                          <AlertCircle size={11} /> {rowErrors.unit}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className={`table-input ${rowErrors.required ? 'input-error' : ''}`}
                        value={row.required !== undefined ? row.required : ''}
                        onChange={(e) => onUpdateRow(row.id, 'required', e.target.value)}
                        placeholder="e.g. 50000"
                        aria-label={`Required capacity for row ${index + 1}`}
                      />
                      {rowErrors.required && (
                        <div className="field-error-msg">
                          <AlertCircle size={11} /> {rowErrors.required}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className={`table-input ${rowErrors.available ? 'input-error' : ''}`}
                        value={row.available !== undefined ? row.available : ''}
                        onChange={(e) => onUpdateRow(row.id, 'available', e.target.value)}
                        placeholder="e.g. 40000"
                        aria-label={`Available capacity for row ${index + 1}`}
                      />
                      {rowErrors.available && (
                        <div className="field-error-msg">
                          <AlertCircle size={11} /> {rowErrors.available}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-danger-ghost"
                        onClick={() => onDeleteRow(row.id)}
                        title="Delete resource row"
                        aria-label={`Delete resource row ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-actions">
        <div className="table-actions-left">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onAddRow}
            id="btn-res-add-row"
          >
            <Plus size={16} />
            Add Resource
          </button>
          <button
            type="button"
            className="btn btn-outline-brown"
            onClick={onLoadDemo}
            id="btn-res-load-demo"
          >
            <Database size={15} />
            Load Demo Data
          </button>
          {resources.length > 0 && (
            <button
              type="button"
              className="btn btn-clear"
              onClick={onClearAll}
              id="btn-res-clear-all"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="table-actions-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOptimize}
            disabled={isLoading || resources.length === 0}
            id="btn-res-optimize"
            style={{ minWidth: '200px' }}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Optimizing Resources...
              </>
            ) : (
              <>
                Optimize Resources
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
