import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SEV_COLORS = { high: '#dc2626', medium: '#d97706', low: '#2563eb' };
const STATUS_COLORS = { pending: '#ea580c', active: '#2563eb', resolved: '#0d9488', referred: '#64748b', archived: '#94a3b8' };

const SEVERITY_RANK = { high: 3, medium: 2, low: 1 };
const STATUS_RANK   = { pending: 1, active: 2, referred: 3, resolved: 4, archived: 5 };

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
  onSelectIncident, onQuickResolve, onQuickDelete, onQuickPrint,
  dashboardMode = false,
  lastUpdated = null,
  onRefresh = null,
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('table');
  const DEFAULT_SORT = [{ key: 'date', direction: 'desc' }];
  const [sortRules, setSortRules] = useState(DEFAULT_SORT);

  const handleSort = (key) => {
    setSortRules(prev => {
      const idx = prev.findIndex(r => r.key === key);
      if (idx === -1) {
        const defaultDir = key === 'status' ? 'asc' : 'desc';
        return [{ key, direction: defaultDir }, ...prev];
      } else {
        const current = prev[idx];
        const nextDir = current.direction === 'desc' ? 'asc' : 'desc';
        return [{ key, direction: nextDir }, ...prev.filter(r => r.key !== key)];
      }
    });
  };

  const removeSortRule = (key) => {
    setSortRules(prev => {
      const remaining = prev.filter(r => r.key !== key);
      return remaining.length > 0 ? remaining : DEFAULT_SORT;
    });
  };

  const resetSortRules = () => setSortRules(DEFAULT_SORT);

  const getSortInfo = (key) => {
    const index = sortRules.findIndex(r => r.key === key);
    if (index === -1) return { active: false, badge: '⇅' };
    const rule = sortRules[index];
    const priority = sortRules.length > 1 ? ` (#${index + 1})` : '';
    let label = '';
    if (key === 'date')     label = rule.direction === 'desc' ? '▼ Latest' : '▲ Oldest';
    if (key === 'severity') label = rule.direction === 'desc' ? '▼ High→Low' : '▲ Low→High';
    if (key === 'status')   label = rule.direction === 'asc' ? '▲ Pending→Solved' : '▼ Solved→Pending';
    return { active: true, badge: `${label}${priority}`, index };
  };

  const sortedIncidents = React.useMemo(() => {
    if (!incidents || incidents.length === 0) return [];
    const list = [...incidents];
    return list.sort((a, b) => {
      for (const rule of sortRules) {
        let diff = 0;
        if (rule.key === 'date') {
          const timeA = new Date(a.date_time_of_incident || a.date_time_filed || 0).getTime();
          const timeB = new Date(b.date_time_of_incident || b.date_time_filed || 0).getTime();
          diff = rule.direction === 'desc' ? timeB - timeA : timeA - timeB;
        } else if (rule.key === 'severity') {
          const rankA = SEVERITY_RANK[a.severity?.toLowerCase()] || 0;
          const rankB = SEVERITY_RANK[b.severity?.toLowerCase()] || 0;
          diff = rule.direction === 'desc' ? rankB - rankA : rankA - rankB;
        } else if (rule.key === 'status') {
          const rankA = STATUS_RANK[a.status?.toLowerCase()] || 99;
          const rankB = STATUS_RANK[b.status?.toLowerCase()] || 99;
          diff = rule.direction === 'asc' ? rankA - rankB : rankB - rankA;
        }
        if (diff !== 0) return diff;
      }
      return 0;
    });
  }, [incidents, sortRules]);

  const dateSortInfo   = getSortInfo('date');
  const sevSortInfo    = getSortInfo('severity');
  const statusSortInfo = getSortInfo('status');

  const setStatus = s => onFilterChange(f => ({ ...f, status: s, page: 1 }));
  const setSearch = s => onFilterChange(f => ({ ...f, search: s, page: 1 }));

  const handleEdit = (inc) => {
    if (onSelectIncident) {
      onSelectIncident(inc);
    }
    navigate(`/blotter?edit=${inc.id}`, { state: { incident: inc } });
  };

  return (
    <div className="queue-panel-full friendly-queue-box">
      {/* Control Header */}
      <div className="queue-header">
        <div className="queue-header-top">
          <div className="queue-title-wrap">
            {!dashboardMode && (
              <h2 className="queue-title">{t('queue_title_full')}</h2>
            )}
            <span className="queue-count-pill">
              {total} {dashboardMode ? t('total_open_cases') : t('total_cases_count')}
            </span>
            {dashboardMode && (
              <span className="live-pulse-badge" title="Auto sync active">
                <span className="live-pulse-dot" /> {t('live_sync')}
              </span>
            )}
          </div>

          <div className="queue-controls-right">
            {dashboardMode && onRefresh && (
              <button
                type="button"
                className="btn-refresh-sync"
                onClick={onRefresh}
                title="Refresh Data"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>{t('refresh_btn')}</span>
                {lastUpdated && (
                  <span className="refresh-time-ago">
                    ({new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                  </span>
                )}
              </button>
            )}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <line x1="3" x2="21" y1="9" y2="9"/>
                  <line x1="3" x2="21" y1="15" y2="15"/>
                  <line x1="12" x2="12" y1="9" y2="21"/>
                </svg>
                {t('view_table')}
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                {t('view_cards')}
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Buttons */}
        <div className="queue-toolbar">
          <div className="queue-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="queue-search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="friendly-search-input"
              placeholder={t('search_queue_placeholder')}
              value={filters.search || ''}
              onChange={e => setSearch(e.target.value)}
            />
            {filters.search && (
              <button className="queue-search-clear" onClick={() => setSearch('')}>{t('clear_filter')}</button>
            )}
          </div>

          <div className="friendly-filter-buttons">
            {dashboardMode ? (
              [
                ['pending,active', t('filter_all_open')],
                ['pending', t('filter_pending_only')],
                ['active', t('filter_active_only')],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`friendly-filter-btn ${(filters.status || '') === val ? 'active' : ''}`}
                  onClick={() => setStatus(val)}
                >
                  {label}
                </button>
              ))
            ) : (
              [
                ['', t('filter_all')],
                ['pending', 'Pending'],
                ['active', 'Active'],
                ['resolved', 'Resolved'],
                ['referred', 'Referred']
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`friendly-filter-btn ${(filters.status || '') === val ? 'active' : ''}`}
                  onClick={() => setStatus(val)}
                >
                  {label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Multi-Sort Bar */}
      <div className="active-sort-pills-bar">
        <span className="asp-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="6" y1="12" x2="18" y2="12"/>
            <line x1="8" y1="18" x2="16" y2="18"/>
          </svg>
          {t('sort_label')}
        </span>
        <div className="asp-pills-container">
          {sortRules.map((rule, idx) => {
            const colName = rule.key === 'date' ? t('col_date_time')
              : rule.key === 'severity' ? t('col_severity')
              : t('col_status');
            const dirLabel = rule.key === 'date'
              ? (rule.direction === 'desc' ? 'Latest' : 'Oldest')
              : rule.key === 'severity'
              ? (rule.direction === 'desc' ? 'High → Low' : 'Low → High')
              : (rule.direction === 'asc' ? 'Pending → Solved' : 'Solved → Pending');
            return (
              <span
                key={rule.key}
                className="asp-chip"
                onClick={() => handleSort(rule.key)}
              >
                <span className="asp-priority">#{idx + 1}</span>
                <span className="asp-name">{colName}:</span>
                <span className="asp-dir">{dirLabel}</span>
                {sortRules.length > 1 && (
                  <button
                    type="button"
                    className="asp-close-btn"
                    onClick={(e) => { e.stopPropagation(); removeSortRule(rule.key); }}
                  >
                    ✕
                  </button>
                )}
              </span>
            );
          })}
        </div>
        {(sortRules.length > 1 || sortRules[0]?.key !== 'date' || sortRules[0]?.direction !== 'desc') && (
          <button type="button" className="asp-reset-btn" onClick={resetSortRules}>
            {t('sort_reset')}
          </button>
        )}
      </div>

      {/* Main Table / Grid Content */}
      <div className="queue-body">
        {loading ? (
          <div className="queue-empty"><div className="spinner" /></div>
        ) : incidents.length === 0 ? (
          <div className="friendly-queue-empty">
            <div className="empty-icon-large">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </div>
            <h3>{t('empty_no_incidents')}</h3>
            <p>{filters.search || filters.status ? t('empty_sub_search') : t('empty_sub_blank')}</p>
            <button className="btn-giant-action" style={{ marginTop: 14, fontSize: '0.95rem', padding: '12px 24px' }} onClick={() => navigate('/blotter')}>
              {t('btn_file_new_blotter')}
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="table-responsive">
            <table className="friendly-queue-table">
              <thead>
                <tr>
                  <th>{t('col_case_id')}</th>
                  <th>{t('col_type_purok')}</th>
                  <th>{t('col_complainant')}</th>
                  <th
                    className={`sortable-th ${dateSortInfo.active ? 'active-sort' : ''}`}
                    onClick={() => handleSort('date')}
                  >
                    <div className="th-sort-wrapper">
                      <span>{t('col_date_time')}</span>
                      <span className="th-sort-badge">{dateSortInfo.badge}</span>
                    </div>
                  </th>
                  <th
                    className={`sortable-th ${sevSortInfo.active ? 'active-sort' : ''}`}
                    onClick={() => handleSort('severity')}
                  >
                    <div className="th-sort-wrapper">
                      <span>{t('col_severity')}</span>
                      <span className="th-sort-badge">{sevSortInfo.badge}</span>
                    </div>
                  </th>
                  <th
                    className={`sortable-th ${statusSortInfo.active ? 'active-sort' : ''}`}
                    onClick={() => handleSort('status')}
                  >
                    <div className="th-sort-wrapper">
                      <span>{t('col_status')}</span>
                      <span className="th-sort-badge">{statusSortInfo.badge}</span>
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedIncidents.map(inc => {
                  const sevColor = SEV_COLORS[inc.severity] || '#64748b';
                  const statusColor = STATUS_COLORS[inc.status] || '#64748b';
                  const newTicket = isNew(inc.date_time_filed);

                  return (
                    <tr
                      key={inc.id}
                      className={`row-clickable ${selectedId === inc.id ? 'row-selected' : ''}`}
                      onClick={() => handleEdit(inc)}
                      title="Click row to view & edit case information"
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="cell-case-id">
                        <span className="case-id-text">{inc.case_id}</span>
                        {newTicket && <span className="badge-new-soft">{t('badge_new')}</span>}
                      </td>

                      <td className="cell-type-purok">
                        <span className="incident-type-primary">{inc.incident_type}</span>
                        <span className="purok-sub">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}>
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {inc.purok}
                        </span>
                      </td>

                      <td className="cell-complainant">
                        <span className="complainant-name">{inc.complainant_names || inc.complainant_name || '—'}</span>
                        {(inc.respondent_names || inc.respondent_name) && (
                          <span className="respondent-sub">vs. {inc.respondent_names || inc.respondent_name}</span>
                        )}
                      </td>

                      <td className="cell-date-time">
                        <span className="date-text">{fmt(inc.date_time_of_incident)}</span>
                      </td>

                      <td className="cell-severity">
                        <span className="friendly-sev-badge" style={{ color: sevColor, background: sevColor + '18', borderColor: sevColor + '35' }}>
                          {inc.severity?.toUpperCase()}
                        </span>
                      </td>

                      <td className="cell-status">
                        <span className="friendly-status-pill" style={{ color: statusColor, background: statusColor + '18', borderColor: statusColor + '35' }}>
                          {inc.status}
                        </span>
                      </td>

                      <td className="cell-actions" style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div className="friendly-action-group">
                          <button
                            className="friendly-act-btn edit"
                            onClick={() => handleEdit(inc)}
                            title="Edit / Update Case"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                            </svg>
                            <span>{t('btn_edit')}</span>
                          </button>

                          {inc.status !== 'resolved' && (
                            <button
                              className="friendly-act-btn resolve"
                              onClick={() => onQuickResolve(inc.id)}
                              title="Mark as Resolved"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              <span>{t('btn_resolve')}</span>
                            </button>
                          )}

                          <button
                            className="friendly-act-btn print"
                            onClick={() => onQuickPrint(inc)}
                            title="Print Blotter"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9"/>
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                              <rect width="12" height="8" x="6" y="14"/>
                            </svg>
                            <span>{t('btn_print')}</span>
                          </button>

                          <button
                            className="friendly-act-btn archive"
                            onClick={() => onQuickDelete(inc.id)}
                            title="Archive"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
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
          /* Cards View — Clickable to proceed straight to case info */
          <div className="queue-grid-container">
            {sortedIncidents.map(inc => {
              const sevColor = SEV_COLORS[inc.severity] || '#64748b';
              const statusColor = STATUS_COLORS[inc.status] || '#64748b';
              const isSelected = selectedId === inc.id;
              const newTicket = isNew(inc.date_time_filed);

              return (
                <div
                  key={inc.id}
                  className={`q-card ${isSelected ? 'selected' : ''}`}
                  style={{ '--sev-color': sevColor, cursor: 'pointer' }}
                  onClick={() => handleEdit(inc)}
                  title="Click card to proceed to case info"
                >
                  <div className="q-card-sev-bar" />
                  <div className="q-card-inner">
                    <div className="q-card-top">
                      <span className="q-case-id">{inc.case_id}</span>
                      <div className="q-card-badges">
                        {newTicket && <span className="q-badge-new">{t('badge_new')}</span>}
                        <span className="q-badge-status" style={{ color: statusColor, background: statusColor + '20' }}>
                          {inc.status}
                        </span>
                      </div>
                    </div>

                    <div className="q-card-type">
                      <span className="q-sev-label" style={{ color: sevColor }}>{inc.severity?.toUpperCase()}</span>
                      <span className="q-type-name">{inc.incident_type}</span>
                      <span className="q-purok-tag">{inc.purok}</span>
                    </div>

                    <p className="q-card-narrative">{inc.narrative}</p>

                    <div className="q-card-footer">
                      <span className="q-reporter">{inc.complainant_name || inc.officer_on_duty || '—'}</span>
                      <span className="q-time">{fmt(inc.date_time_of_incident)}</span>
                    </div>

                    <div className="q-card-actions-static" onClick={e => e.stopPropagation()}>
                      <button className="friendly-act-btn edit" onClick={() => handleEdit(inc)}>{t('btn_edit')}</button>
                      {inc.status !== 'resolved' && (
                        <button className="friendly-act-btn resolve" onClick={() => onQuickResolve(inc.id)}>{t('btn_resolve')}</button>
                      )}
                      <button className="friendly-act-btn print" onClick={() => onQuickPrint(inc)}>{t('btn_print')}</button>
                      <button className="friendly-act-btn archive" onClick={() => onQuickDelete(inc.id)}>{t('btn_archive')}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {dashboardMode && (
        <div className="queue-dashboard-footer-notice">
          <div className="notice-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="notice-text">
            <strong>{t('notice_looking_for')}</strong>
            <span>{t('notice_sub')}</span>
          </div>
          <button
            type="button"
            className="btn-view-all-incidents"
            onClick={() => navigate('/incidents')}
          >
            {t('btn_view_all_records')}
          </button>
        </div>
      )}
    </div>
  );
}
