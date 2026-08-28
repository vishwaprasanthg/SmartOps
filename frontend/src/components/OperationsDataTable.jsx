import React from 'react';
import { Plus, Database, Trash2, ArrowRight, Table as TableIcon, AlertCircle } from 'lucide-react';

export default function OperationsDataTable({
  records,
  errorsByRow = {},
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  onLoadDemo,
  onClearAll,
  onUpdateDashboard,
  isLoading
}) {
  return (
    <div className="card" id="operations-data-table-card">
      <div className="card-header">
        <div className="card-title-group">
          <TableIcon size={18} color="var(--color-brand-brown)" />
          <h3>Daily Operational Activity Records</h3>
        </div>
        <span className="card-subtitle">
          {records.length} {records.length === 1 ? 'day recorded' : 'days recorded'}
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table" aria-label="Daily Operational Activity Table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>Date</th>
              <th style={{ width: '11%' }}>Inbound</th>
              <th style={{ width: '11%' }}>Outbound</th>
              <th style={{ width: '11%' }}>Processed</th>
              <th style={{ width: '11%' }}>Capacity</th>
              <th style={{ width: '9%' }}>Workers</th>
              <th style={{ width: '8%' }}>Hours</th>
              <th style={{ width: '11%' }}>On-Time</th>
              <th style={{ width: '9%' }}>Exceptions</th>
              <th style={{ width: '6%', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>No operational data entered.</p>
                    <p style={{ fontSize: '0.84rem' }}>
                      Click <strong>"Load Demo Data"</strong> or <strong>"+ Add Row"</strong> to begin.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((row, index) => {
                const rowErrors = errorsByRow[row.id] || {};
                const hasError = Object.keys(rowErrors).length > 0;

                return (
                  <tr key={row.id} className={hasError ? 'row-error' : ''}>
                    {/* Date */}
                    <td>
                      <input
                        type="date"
                        className={`table-input ${rowErrors.date ? 'input-error' : ''}`}
                        value={row.date}
                        onChange={(e) => onUpdateRow(row.id, 'date', e.target.value)}
                        aria-label={`Date for row ${index + 1}`}
                      />
                      {rowErrors.date && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.date}
                        </div>
                      )}
                    </td>

                    {/* Inbound */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={`table-input ${rowErrors.inbound ? 'input-error' : ''}`}
                        value={row.inbound !== undefined ? row.inbound : ''}
                        onChange={(e) => onUpdateRow(row.id, 'inbound', e.target.value)}
                        placeholder="48000"
                        aria-label={`Inbound for row ${index + 1}`}
                      />
                      {rowErrors.inbound && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.inbound}
                        </div>
                      )}
                    </td>

                    {/* Outbound */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={`table-input ${rowErrors.outbound ? 'input-error' : ''}`}
                        value={row.outbound !== undefined ? row.outbound : ''}
                        onChange={(e) => onUpdateRow(row.id, 'outbound', e.target.value)}
                        placeholder="45000"
                        aria-label={`Outbound for row ${index + 1}`}
                      />
                      {rowErrors.outbound && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.outbound}
                        </div>
                      )}
                    </td>

                    {/* Processed */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={`table-input ${rowErrors.processed ? 'input-error' : ''}`}
                        value={row.processed !== undefined ? row.processed : ''}
                        onChange={(e) => onUpdateRow(row.id, 'processed', e.target.value)}
                        placeholder="46000"
                        aria-label={`Processed for row ${index + 1}`}
                      />
                      {rowErrors.processed && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.processed}
                        </div>
                      )}
                    </td>

                    {/* Capacity */}
                    <td>
                      <input
                        type="number"
                        min="1"
                        className={`table-input ${rowErrors.availableCapacity ? 'input-error' : ''}`}
                        value={row.availableCapacity !== undefined ? row.availableCapacity : ''}
                        onChange={(e) => onUpdateRow(row.id, 'availableCapacity', e.target.value)}
                        placeholder="50000"
                        aria-label={`Capacity for row ${index + 1}`}
                      />
                      {rowErrors.availableCapacity && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.availableCapacity}
                        </div>
                      )}
                    </td>

                    {/* Workers */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`table-input ${rowErrors.availableWorkers ? 'input-error' : ''}`}
                        value={row.availableWorkers !== undefined ? row.availableWorkers : ''}
                        onChange={(e) => onUpdateRow(row.id, 'availableWorkers', e.target.value)}
                        placeholder="28"
                        aria-label={`Workers for row ${index + 1}`}
                      />
                      {rowErrors.availableWorkers && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.availableWorkers}
                        </div>
                      )}
                    </td>

                    {/* Hours */}
                    <td>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        className={`table-input ${rowErrors.workingHours ? 'input-error' : ''}`}
                        value={row.workingHours !== undefined ? row.workingHours : ''}
                        onChange={(e) => onUpdateRow(row.id, 'workingHours', e.target.value)}
                        placeholder="8"
                        aria-label={`Hours for row ${index + 1}`}
                      />
                      {rowErrors.workingHours && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.workingHours}
                        </div>
                      )}
                    </td>

                    {/* On-Time */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        className={`table-input ${rowErrors.onTimeProcessed ? 'input-error' : ''}`}
                        value={row.onTimeProcessed !== undefined ? row.onTimeProcessed : ''}
                        onChange={(e) => onUpdateRow(row.id, 'onTimeProcessed', e.target.value)}
                        placeholder="43240"
                        aria-label={`On-Time volume for row ${index + 1}`}
                      />
                      {rowErrors.onTimeProcessed && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.onTimeProcessed}
                        </div>
                      )}
                    </td>

                    {/* Exceptions */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`table-input ${rowErrors.exceptions ? 'input-error' : ''}`}
                        value={row.exceptions !== undefined ? row.exceptions : ''}
                        onChange={(e) => onUpdateRow(row.id, 'exceptions', e.target.value)}
                        placeholder="320"
                        aria-label={`Exceptions for row ${index + 1}`}
                      />
                      {rowErrors.exceptions && (
                        <div className="field-error-msg">
                          <AlertCircle size={10} /> {rowErrors.exceptions}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-danger-ghost"
                        onClick={() => onDeleteRow(row.id)}
                        title="Delete operational record row"
                        aria-label={`Delete record row ${index + 1}`}
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
            id="btn-ops-add-row"
          >
            <Plus size={16} />
            Add Row
          </button>
          <button
            type="button"
            className="btn btn-outline-brown"
            onClick={onLoadDemo}
            id="btn-ops-load-demo"
          >
            <Database size={15} />
            Load Demo Data
          </button>
          {records.length > 0 && (
            <button
              type="button"
              className="btn btn-clear"
              onClick={onClearAll}
              id="btn-ops-clear-all"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="table-actions-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onUpdateDashboard}
            disabled={isLoading || records.length === 0}
            id="btn-ops-update-dashboard"
            style={{ minWidth: '200px' }}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Updating Dashboard...
              </>
            ) : (
              <>
                Update Dashboard
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
