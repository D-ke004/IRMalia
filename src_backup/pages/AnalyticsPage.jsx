import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { getCharts, getStats } from '../utils/api';

const PIE_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316'];

export default function AnalyticsPage() {
  const [stats, setStats]   = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getCharts()])
      .then(([s, c]) => { setStats(s.data); setCharts(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>📊 Analytics & Reports</h1>
        <p>Incident data insights for Barangay Epifanio Malia</p>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        {[
          { label: 'Total Cases',        val: stats?.total,      color: '#6366f1' },
          { label: 'This Month',         val: stats?.this_month, color: '#f59e0b' },
          { label: 'Resolution Rate',    val: `${stats?.res_rate}%`, color: '#10b981' },
          { label: 'Open High Severity', val: stats?.high_open,  color: '#ef4444' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <span className="kpi-val" style={{ color: k.color }}>{k.val ?? 0}</span>
            <span className="kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Monthly Bar Chart */}
        <div className="chart-card wide">
          <h3>Monthly Incident Volume (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts?.monthly || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Incident Types */}
        <div className="chart-card">
          <h3>Incident Type Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={charts?.by_type || []} dataKey="value" nameKey="name"
                   cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   labelLine={false}>
                {(charts?.by_type || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Purok Horizontal Bar */}
        <div className="chart-card">
          <h3>Cases by Purok</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts?.by_purok || []} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={60} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Trend Line */}
        <div className="chart-card wide">
          <h3>Status Breakdown (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={charts?.status_trend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="pending"  stroke="#f59e0b" strokeWidth={2} dot={false} name="Pending" />
              <Line type="monotone" dataKey="active"   stroke="#6366f1" strokeWidth={2} dot={false} name="Active" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={false} name="Resolved" />
              <Line type="monotone" dataKey="referred" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Referred" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
