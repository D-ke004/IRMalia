import React, { useEffect, useState, useMemo } from 'react';
import { getAuditLogs } from '../utils/api';

const ACTION_COLOR = {
  LOGIN: '#6366f1', LOGOUT: '#94a3b8',
  CREATE_INCIDENT: '#10b981', UPDATE_INCIDENT: '#f59e0b',
  ARCHIVE_INCIDENT: '#ef4444', CREATE_USER: '#06b6d4',
  UPDATE_USER: '#f97316', PRINT: '#8b5cf6',
  RESOLVE_INCIDENT: '#0d9488',
};

const DATE_RANGES = [
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year',  label: 'This Year' },
  { key: 'all',   label: 'All Time' },
];

function isWithinRange(dateStr, range) {
  if (range === 'all' || !dateStr) return true;
  const date = new Date(dateStr);
  const now  = new Date();
  if (range === 'week')  { const w = new Date(now); w.setDate(now.getDate() - 7); return date >= w; }
  if (range === 'month') { return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); }
  if (range === 'year')  { return date.getFullYear() === now.getFullYear(); }
  return true;
}

const fmt = (ts) => ts ? new Date(ts).toLocaleString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '—';

export default function AuditPage() {
  const [allLogs,      setAllLogs]      = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [dateRange,    setDateRange]    = useState('all');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getAuditLogs(page).then(r => {
      setAllLogs(r.data.data || []);
      setTotal(r.data.total || 0);
    }).finally(() => setLoading(false));
  }, [page]);

  const allActions = useMemo(() => {
    const s = new Set(allLogs.map(l => l.action).filter(Boolean));
    return Array.from(s).sort();
  }, [allLogs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allLogs.filter(l => {
      const matchSearch = !q || [l.full_name, l.username, l.action, l.table_name, l.record_id, l.ip_address]
        .some(v => v?.toLowerCase().includes(q));
      const matchDate   = isWithinRange(l.created_at, dateRange);
      const matchAction = !actionFilter || l.action === actionFilter;
      return matchSearch && matchDate && matchAction;
    });
  }, [allLogs, search, dateRange, actionFilter]);

  const hasActiveFilters = search || dateRange !== 'all' || actionFilter;
  const clearFilters = () => { setSearch(''); setDateRange('all'); setActionFilter(''); };

  const btnBase = { padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s', fontWeight: 500 };

  return (
    <div className="audit-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          🔍 System Audit Trail
        </h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.9rem' }}>
          Complete log of all system actions — <strong>{total}</strong> total entries
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '14px 18px', marginBottom: 16,
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search user, action, table, IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
              border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem',
              outline: 'none', boxSizing: 'border-box', color: '#1e293b', background: '#f8fafc',
            }}
          />
        </div>

        {/* Date Range Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DATE_RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setDateRange(r.key)}
              style={{
                ...btnBase,
                border: dateRange === r.key ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: dateRange === r.key ? '#eff6ff' : '#f8fafc',
                color: dateRange === r.key ? '#2563eb' : '#64748b',
                fontWeight: dateRange === r.key ? 700 : 500,
              }}
            >{r.label}</button>
          ))}
        </div>

        {/* Action Dropdown */}
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{
            padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#f8fafc', color: '#334155', fontSize: '0.875rem', cursor: 'pointer', minWidth: 160,
          }}
        >
          <option value="">All Action Types</option>
          {allActions.map(a => (
            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{ ...btnBase, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: 600 }}
          >✕ Clear</button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>No logs match your filters.</p>
            <p style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>Try adjusting the date range or clearing the search.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Time', 'User', 'Action', 'Table', 'Record ID', 'IP Address'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.05em',
                      color: '#64748b', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr
                    key={l.id}
                    style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}
                  >
                    <td style={{ padding: '9px 14px', color: '#475569', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {fmt(l.created_at)}
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{l.full_name || '—'}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{l.username}</div>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 9px', borderRadius: 20,
                        background: (ACTION_COLOR[l.action] || '#64748b') + '18',
                        color: ACTION_COLOR[l.action] || '#64748b',
                        fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.03em', whiteSpace: 'nowrap',
                      }}>
                        {l.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', color: '#475569', fontSize: '0.8rem' }}>{l.table_name || '—'}</td>
                    <td style={{ padding: '9px 14px', color: '#475569', fontSize: '0.8rem', fontFamily: 'monospace' }}>{l.record_id || '—'}</td>
                    <td style={{ padding: '9px 14px', color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace' }}>{l.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => p - 1)}
          style={{ ...btnBase, border: '1px solid #e2e8f0', background: '#fff', color: page <= 1 ? '#cbd5e1' : '#334155', fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >← Previous</button>
        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
          Page {page} of {Math.max(1, Math.ceil(total / 50))}
        </span>
        <button
          disabled={page >= Math.ceil(total / 50)}
          onClick={() => setPage(p => p + 1)}
          style={{ ...btnBase, border: '1px solid #e2e8f0', background: '#fff', color: page >= Math.ceil(total / 50) ? '#cbd5e1' : '#334155', fontWeight: 600, cursor: page >= Math.ceil(total / 50) ? 'not-allowed' : 'pointer' }}
        >Next →</button>
      </div>
    </div>
  );
}

