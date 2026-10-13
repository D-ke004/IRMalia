import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { getCharts, getStats } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const PIE_COLORS = ['#2563eb','#d97706','#0d9488','#dc2626','#8b5cf6','#06b6d4','#f97316'];

export default function AnalyticsPage() {
  const [stats, setStats]   = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([getStats(), getCharts()])
      .then(([s, c]) => { setStats(s.data); setCharts(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="analytics-page">
      <div className="page-header flex-header" style={{ marginBottom: 24 }}>
        <div>
          <h1>Analytics & Reports</h1>
          <p>Comprehensive incident data insights & statistical trends for Barangay Epifanio Malia</p>
        </div>
        <div className="header-actions">
          <span className="live-pulse-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
            <span className="live-pulse-dot" style={{ background: '#2563eb' }} /> Live System Insights
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: t('stat_total'),        val: stats?.total,      color: '#2563eb', border: '#2563eb' },
          { label: t('stat_this_month'),   val: stats?.this_month, color: '#d97706', border: '#d97706' },
          { label: t('stat_res_rate'),     val: `${stats?.res_rate}%`, color: '#0d9488', border: '#0d9488' },
          { label: t('stat_high_open'),    val: stats?.high_open,  color: '#dc2626', border: '#dc2626' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: `4px solid ${k.border}`, borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span className="kpi-val" style={{ color: k.color, fontSize: '2rem', fontWeight: 800, display: 'block' }}>{k.val ?? 0}</span>
            <span className="kpi-label" style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        {/* Monthly Bar Chart */}
        <div className="chart-card wide" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Monthly Incident Volume (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts?.monthly || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }} />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Incident Types */}
        <div className="chart-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Incident Type Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts?.by_type || []} dataKey="value" nameKey="name"
                   cx="50%" cy="50%" outerRadius={95} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   labelLine={false}>
                {(charts?.by_type || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Purok Horizontal Bar */}
        <div className="chart-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Cases by Purok</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts?.by_purok || []} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={75} />
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }} />
              <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Trend Line */}
        <div className="chart-card wide" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Status Breakdown Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts?.status_trend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }} />
              <Legend />
              <Line type="monotone" dataKey="pending"  stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} name="Pending" />
              <Line type="monotone" dataKey="active"   stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Active" />
              <Line type="monotone" dataKey="resolved" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} name="Resolved" />
              <Line type="monotone" dataKey="referred" stroke="#64748b" strokeWidth={2.5} dot={{ r: 3 }} name="Referred" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

