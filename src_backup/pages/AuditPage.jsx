import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../utils/api';

const ACTION_COLOR = {
  LOGIN: '#6366f1', LOGOUT: '#94a3b8',
  CREATE_INCIDENT: '#10b981', UPDATE_INCIDENT: '#f59e0b',
  ARCHIVE_INCIDENT: '#ef4444', CREATE_USER: '#06b6d4',
  UPDATE_USER: '#f97316', PRINT: '#8b5cf6',
};

export default function AuditPage() {
  const [logs, setLogs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAuditLogs(page).then(r => {
      setLogs(r.data.data);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [page]);

  const fmt = (ts) => ts ? new Date(ts).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <div className="audit-page">
      <div className="page-header">
        <h1>🔍 Audit Trail</h1>
        <p>Complete log of all system actions — {total} total entries</p>
      </div>

      <div className="audit-card">
        {loading ? <div className="page-loader"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table className="audit-table">
              <thead>
                <tr><th>Time</th><th>User</th><th>Action</th><th>Table</th><th>Record</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="audit-time">{fmt(l.created_at)}</td>
                    <td>{l.full_name || '—'}<br /><small style={{color:'#64748b'}}>{l.username}</small></td>
                    <td>
                      <span className="audit-action" style={{ background: (ACTION_COLOR[l.action] || '#64748b') + '22', color: ACTION_COLOR[l.action] || '#94a3b8' }}>
                        {l.action}
                      </span>
                    </td>
                    <td>{l.table_name || '—'}</td>
                    <td>{l.record_id || '—'}</td>
                    <td style={{fontFamily:'monospace',fontSize:'0.75rem'}}>{l.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="audit-pagination">
          <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {Math.ceil(total / 50)}</span>
          <button className="btn btn-secondary" disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}
