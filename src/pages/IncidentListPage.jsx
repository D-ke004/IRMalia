import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PrintableBlotter from '../components/PrintableBlotter';
import { useLanguage } from '../context/LanguageContext';
import { getIncidents, deleteIncident, resolveIncident } from '../utils/api';

const SEV_COLORS    = { high: '#dc2626', medium: '#d97706', low: '#2563eb' };
const STATUS_COLORS = { pending: '#ea580c', active: '#2563eb', resolved: '#0d9488', referred: '#64748b', archived: '#94a3b8' };

const SEVERITY_RANK = { high: 3, medium: 2, low: 1 };
const STATUS_RANK   = { pending: 1, active: 2, referred: 3, resolved: 4, archived: 5 };

const STATUS_TABS = [
  { value: '',         labelKey: 'all_tab' },
  { value: 'pending',  label: 'Pending' },
  { value: 'active',   label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'referred', label: 'Referred' },
];

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const isNew = (iso) => iso && (Date.now() - new Date(iso).getTime()) < 5 * 60 * 1000;

export default function IncidentListPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [incidents, setIncidents]       = useState([]);
  const [total,     setTotal]           = useState(0);
  const [loading,   setLoading]         = useState(true);
  const [printIncident, setPrintIncident] = useState(null);
  const [toasts,    setToasts]          = useState([]);
  const [filters,   setFilters]         = useState({ status: '', search: '', page: 1 });
  const DEFAULT_SORT = [{ key: 'date', direction: 'desc' }];
  const [sortRules, setSortRules]       = useState(DEFAULT_SORT);
  const [viewMode,  setViewMode]        = useState('table');

  const addToast = useCallback((msg, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const handleSort = (key) => {
    setSortRules(prev => {
      const idx = prev.findIndex(r => r.key === key);
      if (idx === -1) {
        // Add new sort as #1 primary while preserving existing rules
        const defaultDir = key === 'status' ? 'asc' : 'desc';
        return [{ key, direction: defaultDir }, ...prev];
      } else {
        // Toggle direction and bring to #1 priority
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

  const resetSortRules = () => {
    setSortRules(DEFAULT_SORT);
  };

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

  const sortRulesParam = sortRules.map(r => `${r.key}:${r.direction}`).join(',');

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getIncidents({
        status: filters.status,
        search: filters.search,
        page: filters.page,
        sort_rules: sortRulesParam,
      });
      setIncidents(r.data?.data || []);
      setTotal(r.data?.total || 0);
    } catch {
      setIncidents([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, sortRulesParam]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

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

  const handleResolve = async (id) => {
    try {
      const inc = incidents.find(i => i.id === id);
      await resolveIncident(id);
      addToast(`${t('case_resolved')} ${inc?.case_id}`, 'success');
      fetchIncidents();
    } catch { addToast(t('resolve_failed'), 'danger'); }
  };

  const handleDelete = async (id) => {
    const inc = incidents.find(i => i.id === id);
    if (!window.confirm(`${t('confirm_archive')} "${inc?.case_id}"?`)) return;
    try {
      await deleteIncident(id);
      addToast(`${t('case_archived')} ${inc?.case_id}`, 'danger');
      fetchIncidents();
    } catch (err) {
      addToast(err.response?.data?.error || t('archive_failed'), 'danger');
    }
  };

  const triggerPrint = (inc) => { setPrintIncident(inc); setTimeout(() => window.print(), 150); };

  const setTab    = v => setFilters(f => ({ ...f, status: v, page: 1 }));
  const setSearch = s => setFilters(f => ({ ...f, search: s, page: 1 }));

  const dateSortInfo   = getSortInfo('date');
  const sevSortInfo    = getSortInfo('severity');
  const statusSortInfo = getSortInfo('status');

  return (
    <div className="incident-list-page">
      <Header />

      {/* Page Heading */}
      <div className="incident-list-heading">
        <div className="ilh-left">
          <h1 className="ilh-title">{t('incident_list_title')}</h1>
          <p className="ilh-sub">{t('incident_list_sub')}</p>
        </div>
        <button className="btn-giant-action" style={{ fontSize: '0.95rem', padding: '10px 22px' }} onClick={() => navigate('/blotter')}>
          {t('file_new')}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="il-tabs-row">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            type="button"
            className={`il-tab ${filters.status === tab.value ? 'active' : ''}`}
            onClick={() => setTab(tab.value)}
          >
            <span>{tab.labelKey ? t(tab.labelKey) : tab.label}</span>
          </button>
        ))}
        <span className="il-total-pill">{total} {t('total_cases_count')}</span>
      </div>

      {/* Search + View Toggle */}
      <div className="il-toolbar">
        <div className="queue-search-wrap" style={{ flex: 1 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="queue-search-icon">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="friendly-search-input"
            placeholder={t('search_placeholder') || "Search complainant or respondent name..."}
            value={filters.search || ''}
            onChange={e => setSearch(e.target.value)}
          />
          {filters.search && (
            <button className="queue-search-clear" onClick={() => setSearch('')}>✕ Clear</button>
          )}
        </div>
        <div className="view-mode-toggle">
          <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>{t('view_table')}</button>
          <button className={`view-btn ${viewMode === 'grid'  ? 'active' : ''}`} onClick={() => setViewMode('grid')}>{t('view_cards')}</button>
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
            const colName = rule.key === 'date' ? t('col_datetime')
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
                title="Click to toggle direction or promote to #1 priority"
              >
                <span className="asp-priority">#{idx + 1}</span>
                <span className="asp-name">{colName}:</span>
                <span className="asp-dir">{dirLabel}</span>
                {sortRules.length > 1 && (
                  <button
                    type="button"
                    className="asp-close-btn"
                    title="Remove this sort rule"
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
          <button type="button" className="asp-reset-btn" onClick={resetSortRules} title="Reset to default sort order">
            {t('sort_reset')}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="il-body">
        {loading ? (
          <div className="queue-empty"><div className="spinner" /></div>
        ) : incidents.length === 0 ? (
          <div className="friendly-queue-empty">
            <div className="empty-icon-large">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </div>
            <h3>{t('empty_title')}</h3>
            <p>{filters.search || filters.status ? t('empty_sub_search') : t('empty_sub_blank')}</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="table-responsive">
            <table className="friendly-queue-table">
              <thead>
                <tr>
                  <th>{t('col_caseid')}</th>
                  <th>{t('col_type')}</th>
                  <th>{t('col_reporter')}</th>
                  <th
                    className={`sortable-th ${dateSortInfo.active ? 'active-sort' : ''}`}
                    onClick={() => handleSort('date')}
                    title="Click to sort by Date & Time (Latest ↔ Oldest)"
                  >
                    <div className="th-sort-wrapper">
                      <span>{t('col_datetime')}</span>
                      <span className="th-sort-badge">{dateSortInfo.badge}</span>
                    </div>
                  </th>
                  <th
                    className={`sortable-th ${sevSortInfo.active ? 'active-sort' : ''}`}
                    onClick={() => handleSort('severity')}
                    title="Click to sort by Severity (High ↔ Low)"
                  >
                    <div className="th-sort-wrapper">
                      <span>{t('col_severity')}</span>
                      <span className="th-sort-badge">{sevSortInfo.badge}</span>
                    </div>
                  </th>
                  <th
                    className={`sortable-th ${statusSortInfo.active ? 'active-sort' : ''}`}
                    onClick={() => handleSort('status')}
                    title="Click to sort by Status (Pending ↔ Solved)"
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
                  const sevColor    = SEV_COLORS[inc.severity]    || '#64748b';
                  const statusColor = STATUS_COLORS[inc.status]   || '#64748b';
                  return (
                    <tr key={inc.id}>
                      <td className="cell-case-id">
                        <span className="case-id-badge">{inc.case_id}</span>
                        {isNew(inc.date_time_filed) && <span className="badge-new-tag">{t('badge_new')}</span>}
                      </td>
                      <td className="cell-type">
                        <div className="type-title">{inc.incident_type}</div>
                        <div className="purok-subtag">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3, verticalAlign: 'middle' }}>
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {inc.purok}{inc.street_address ? ` • ${inc.street_address}` : ''}
                        </div>
                      </td>
                      <td className="cell-reporter">
                        <span className="reporter-name">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {inc.complainant_names || inc.complainant_name || '—'}
                        </span>
                        {(inc.respondent_names || inc.respondent_name) && (
                          <div className="respondent-sub" style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>vs.</span> {inc.respondent_names || inc.respondent_name}
                          </div>
                        )}
                      </td>
                      <td className="cell-time">{fmt(inc.date_time_of_incident)}</td>
                      <td className="cell-severity">
                        <span className="friendly-sev-pill" style={{ color: sevColor, backgroundColor: sevColor + '15', borderColor: sevColor + '40' }}>
                          {inc.severity?.toUpperCase()}
                        </span>
                      </td>
                      <td className="cell-status">
                        <span className="friendly-status-pill" style={{ color: statusColor, backgroundColor: statusColor + '15', borderColor: statusColor + '40' }}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="cell-actions" style={{ textAlign: 'right' }}>
                        <div className="friendly-actions-group">
                          <button className="friendly-act-btn edit"
                            onClick={() => navigate(`/blotter?edit=${inc.id}`, { state: { incident: inc } })}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                            </svg>
                            <span>{t('btn_edit')}</span>
                          </button>
                          {inc.status !== 'resolved' && (
                            <button className="friendly-act-btn resolve" onClick={() => handleResolve(inc.id)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              <span>{t('btn_resolve')}</span>
                            </button>
                          )}
                          <button className="friendly-act-btn print" onClick={() => triggerPrint(inc)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9"/>
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                              <rect width="12" height="8" x="6" y="14"/>
                            </svg>
                            <span>{t('btn_print')}</span>
                          </button>
                          <button className="friendly-act-btn archive" onClick={() => handleDelete(inc.id)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            <span>{t('btn_archive')}</span>
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
          <div className="queue-grid-container">
            {sortedIncidents.map(inc => {
              const sevColor    = SEV_COLORS[inc.severity]    || '#64748b';
              const statusColor = STATUS_COLORS[inc.status]   || '#64748b';
              return (
                <div key={inc.id} className="q-card" style={{ '--sev-color': sevColor }}>
                  <div className="q-card-sev-bar" />
                  <div className="q-card-inner">
                    <div className="q-card-top">
                      <span className="q-case-id">{inc.case_id}</span>
                      <div className="q-card-badges">
                        {isNew(inc.date_time_filed) && <span className="q-badge-new">{t('badge_new')}</span>}
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
                      <span className="q-reporter">
                        {inc.complainant_names || inc.complainant_name || '—'}
                        {(inc.respondent_names || inc.respondent_name) ? ` vs. ${inc.respondent_names || inc.respondent_name}` : ''}
                      </span>
                      <span className="q-time">{fmt(inc.date_time_of_incident)}</span>
                    </div>
                    <div className="q-card-actions-static">
                      <button className="friendly-act-btn edit" onClick={() => navigate(`/blotter?edit=${inc.id}`, { state: { incident: inc } })}>{t('btn_edit')}</button>
                      {inc.status !== 'resolved' && (
                        <button className="friendly-act-btn resolve" onClick={() => handleResolve(inc.id)}>{t('btn_resolve')}</button>
                      )}
                      <button className="friendly-act-btn print" onClick={() => triggerPrint(inc)}>{t('btn_print')}</button>
                      <button className="friendly-act-btn archive" onClick={() => handleDelete(inc.id)}>{t('btn_archive')}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="il-pagination">
            <button
              className="il-page-btn"
              disabled={filters.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            >{t('prev_page')}</button>
            <span className="il-page-info">Page {filters.page}</span>
            <button
              className="il-page-btn"
              disabled={incidents.length < 20}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            >{t('next_page')}</button>
          </div>
        )}
      </div>

      <PrintableBlotter incident={printIncident} />

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', marginRight: 6 }}>
              {t.type === 'success' && '✓'}{t.type === 'info' && 'ℹ'}{t.type === 'danger' && '⚠️'}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

