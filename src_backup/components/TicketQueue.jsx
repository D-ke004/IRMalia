import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SEV_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const STATUS_COLORS = { pending: '#f97316', active: '#eab308', resolved: '#10b981', referred: '#0ea5e9', archived: '#64748b' };

const isNew = (iso) => {
  if (!iso) return false;
  return (Date.now() - new Date(iso).getTime()) < 5 * 60 * 1000;
};

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function TicketQueue({
  incidents, total, loading, selectedId,
  filters, onFilterChange,
  onSelectIncident, onQuickResolve, onQuickDelete, onQuickPrint
}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const setStatus = s => onFilterChange(f => ({ ...f, status: s, page: 1 }));
  const setSearch = s => onFilterChange(f => ({ ...f, search: s, page: 1 }));

  const handleEdit = (inc) => {
    if (onSelectIncident) {
      onSelectIncident(inc);
    }
    navigate(`/blotter?edit=${inc.id}`, { state: { incident: inc } });
  };

  return (
    <div className="queue-panel-full">
      {/* Control Header */}
      <div className="queue-header">
        <div className="queue-header-top">
          <div className="queue-title-wrap">
            <h2 className="queue-title">📋 Incident Blotter Queue</h2>
            <span className="queue-count-pill">{total} Total Records</span>
          </div>

          <div className="queue-controls-right">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                ☰ Table
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Cards View"
              >
                ▦ Cards
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="queue-toolbar">
          {/* Search */}
          <div className="queue-search-wrap">
            <span className="queue-search-icon">🔍</span>
            <input
              type="text"
              className="queue-search-input"
              placeholder="Search by Case ID, Complainant, Purok, Type..."
              value={filters.search || ''}
              onChange={e => setSearch(e.target.value)}
            />
            {filters.search && (
              <button className="queue-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="queue-filters">
            {[
              ['', 'All Reports'],
              ['pending', 'Pending'],
              ['active', 'Active'],
              ['resolved', 'Resolved'],
              ['referred', 'Referred']
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={`q-filter-btn ${(filters.status || '') === val ? 'active' : ''}`}
                onClick={() => setStatus(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="queue-body">
        {loading ? (
          <div className="queue-empty"><div className="spinner" /></div>
        ) : incidents.length === 0 ? (
          <div className="queue-empty">
            <div className="queue-empty-icon">📂</div>
            <h3>No Blotter Reports Found</h3>
            <p>{filters.search || filters.status ? 'No incidents match your current search criteria.' : 'No incidents have been recorded yet.'}</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/blotter')}>
              + File New Blotter Report
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="table-responsive">
            <table className="clean-queue-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Incident Type & Location</th>
                  <th>Complainant / Reporter</th>
                  <th>Date & Time</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => {
                  const sevColor = SEV_COLORS[inc.severity] || '#64748b';
                  const statusColor = STATUS_COLORS[inc.status] || '#64748b';
                  const newTicket = isNew(inc.date_time_filed);

                  return (
                    <tr key={inc.id} className={selectedId === inc.id ? 'row-selected' : ''}>
                      <td className="cell-case-id">
                        <span className="case-id-badge">{inc.case_id}</span>
                        {newTicket && <span className="badge-new-tag">NEW</span>}
                      </td>

                      <td className="cell-type">
                        <div className="type-title">{inc.incident_type}</div>
                        <div className="purok-subtag">📍 {inc.purok} {inc.street_address ? `• ${inc.street_address}` : ''}</div>
                      </td>

                      <td className="cell-reporter">
                        <span className="reporter-name">👤 {inc.complainant_name || inc.complainant?.full_name || 'Anonymous / Unspecified'}</span>
                      </td>

                      <td className="cell-time">
                        {fmt(inc.date_time_of_incident)}
                      </td>

                      <td className="cell-severity">
                        <span className="sev-pill" style={{ color: sevColor, backgroundColor: sevColor + '15', borderColor: sevColor + '40' }}>
                          {inc.severity?.toUpperCase()}
                        </span>
                      </td>

                      <td className="cell-status">
                        <span className="status-pill" style={{ color: statusColor, backgroundColor: statusColor + '15', borderColor: statusColor + '40' }}>
                          {inc.status}
                        </span>
                      </td>

                      <td className="cell-actions" style={{ textAlign: 'right' }}>
                        <div className="table-actions-group">
                          <button
                            className="table-action-btn edit"
                            onClick={() => handleEdit(inc)}
                            title="Edit Report"
                          >
                            ✏️ Edit
                          </button>

                          {inc.status !== 'resolved' && (
                            <button
                              className="table-action-btn resolve"
                              onClick={() => onQuickResolve(inc.id)}
                              title="Mark as Resolved"
                            >
                              ✓ Resolve
                            </button>
                          )}

                          <button
                            className="table-action-btn print"
                            onClick={() => onQuickPrint(inc)}
                            title="Print Blotter"
                          >
                            🖨 Print
                          </button>

                          <button
                            className="table-action-btn archive"
                            onClick={() => onQuickDelete(inc.id)}
                            title="Archive Report"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid / Cards View */
          <div className="queue-grid-container">
            {incidents.map(inc => {
              const sevColor = SEV_COLORS[inc.severity] || '#64748b';
              const statusColor = STATUS_COLORS[inc.status] || '#64748b';
              const isSelected = selectedId === inc.id;
              const newTicket = isNew(inc.date_time_filed);

              return (
                <div
                  key={inc.id}
                  className={`q-card ${isSelected ? 'selected' : ''}`}
                  style={{ '--sev-color': sevColor }}
                >
                  <div className="q-card-sev-bar" />
                  <div className="q-card-inner">
                    <div className="q-card-top">
                      <span className="q-case-id">{inc.case_id}</span>
                      <div className="q-card-badges">
                        {newTicket && <span className="q-badge-new">⚡ NEW</span>}
                        <span className="q-badge-status" style={{ color: statusColor, background: statusColor + '20' }}>
                          {inc.status}
                        </span>
                      </div>
                    </div>

                    <div className="q-card-type">
                      <span className="q-sev-label" style={{ color: sevColor }}>{inc.severity?.toUpperCase()}</span>
                      <span className="q-type-name">{inc.incident_type}</span>
                      <span className="q-purok-tag">📍 {inc.purok}</span>
                    </div>

                    <p className="q-card-narrative">{inc.narrative}</p>

                    <div className="q-card-footer">
                      <span className="q-reporter">👤 {inc.complainant_name || inc.officer_on_duty || '—'}</span>
                      <span className="q-time">{fmt(inc.date_time_of_incident)}</span>
                    </div>

                    <div className="q-card-actions-static">
                      <button className="q-action-btn edit" onClick={() => handleEdit(inc)}>✏️ Edit</button>
                      {inc.status !== 'resolved' && (
                        <button className="q-action-btn resolve" onClick={() => onQuickResolve(inc.id)}>✓ Resolve</button>
                      )}
                      <button className="q-action-btn print" onClick={() => onQuickPrint(inc)}>🖨 Print</button>
                      <button className="q-action-btn archive" onClick={() => onQuickDelete(inc.id)}>Archive</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
