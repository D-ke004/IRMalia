import React, { useEffect, useState } from 'react';
import { getStats } from '../utils/api';

const CARDS = [
  { key:'total',      label:'Total Reports',      color:'#6366f1', border:'#6366f1' },
  { key:'pending',    label:'Pending Triage',      color:'#f97316', border:'#f97316' },
  { key:'active',     label:'Active Cases',        color:'#eab308', border:'#eab308' },
  { key:'resolved',   label:'Resolved / Closed',   color:'#10b981', border:'#10b981' },
  { key:'referred',   label:'Referred Out',         color:'#0ea5e9', border:'#0ea5e9' },
  { key:'high_open',  label:'High Severity Open',  color:'#ef4444', border:'#ef4444' },
  { key:'res_rate',   label:'Resolution Rate',      color:'#10b981', border:'#10b981', suffix:'%', format: v => `${v}` },
  { key:'this_month', label:'Filed This Month',     color:'#a78bfa', border:'#a78bfa', sub: (s) => s?.last_month != null ? `${s.this_month - s.last_month >= 0 ? '+' : ''}${s.this_month - s.last_month} vs last month` : null },
];

export default function StatsSummary({ refreshKey }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {});
  }, [refreshKey]);

  return (
    <div className="stats-summary">
      {CARDS.map(c => {
        const raw = stats?.[c.key];
        const val = raw != null ? (c.format ? c.format(raw) : raw) : null;
        const sub = c.sub ? c.sub(stats) : null;
        return (
          <div key={c.key} className="stat-card" style={{ borderLeft: `3px solid ${c.border}` }}>
            <div className="stat-info">
              <span className="stat-label">{c.label}</span>
              <span className="stat-val" style={{ color: c.color }}>
                {val != null ? `${val}${c.suffix || ''}` : <span className="stat-loading" />}
              </span>
              {sub && <span className="stat-sub">{sub}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
