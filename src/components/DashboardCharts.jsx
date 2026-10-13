import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { getWeeklyStats } from '../utils/api';

const DONUT_COLORS = {
  pending:  '#f59e0b',
  active:   '#2563eb',
  resolved: '#0d9488',
  referred: '#64748b',
};

const DONUT_LABELS = {
  pending:  'Pending',
  active:   'Active',
  resolved: 'Resolved',
  referred: 'Referred',
};

const CustomTooltipBar = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-chart-tooltip">
      <p className="ttt-label">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.fill, margin: '2px 0', fontSize: '0.82rem' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const CustomTooltipDonut = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="dash-chart-tooltip">
      <p style={{ color: d.payload.fill, margin: 0, fontWeight: 700 }}>{d.name}</p>
      <p style={{ margin: '2px 0', fontSize: '0.82rem' }}>Count: <strong>{d.value}</strong></p>
    </div>
  );
};

export default function DashboardCharts({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await getWeeklyStats();
      setData(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Build last-7-days skeleton so we always show 7 bars even if no data
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day:   d.toISOString().slice(0, 10),
      high: 0, medium: 0, low: 0, total: 0,
    };
  });

  const barData = weekDays.map(skeleton => {
    const match = (data?.daily || []).find(r => r.day === skeleton.day);
    return match
      ? { ...skeleton, high: +match.high, medium: +match.medium, low: +match.low, total: +match.total }
      : skeleton;
  });

  const donutData = data?.status_now
    ? Object.entries(data.status_now)
        .filter(([, v]) => +v > 0)
        .map(([k, v]) => ({ name: DONUT_LABELS[k] || k, value: +v, fill: DONUT_COLORS[k] || '#94a3b8' }))
    : [];

  const avgDays = data?.avg_resolution_days ?? null;

  return (
    <div className="dash-charts-section">
      <div className="dash-charts-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <h3 className="dash-charts-title">Live Incident Overview</h3>
        </div>
        {loading && <span className="dash-chart-loading-pill">Loading…</span>}
      </div>

      <div className="dash-charts-grid">
        {/* Weekly Bar Chart */}
        <div className="dash-chart-card wide">
          <div className="dash-chart-card-header">
            <span className="dash-chart-card-title">Daily Incidents — Last 7 Days</span>
            <span className="dash-chart-card-sub">Stacked by Severity</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'inherit' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'inherit' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltipBar />} cursor={{ fill: '#f1f5f9' }} />
              <Legend
                iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }}
              />
              <Bar dataKey="high"   stackId="a" fill="#dc2626" name="High"   radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium" radius={[0, 0, 0, 0]} />
              <Bar dataKey="low"    stackId="a" fill="#2563eb" name="Low"    radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Donut */}
        <div className="dash-chart-card">
          <div className="dash-chart-card-header">
            <span className="dash-chart-card-title">Current Status Split</span>
            <span className="dash-chart-card-sub">Live snapshot</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={78}
                paddingAngle={3}
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipDonut />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="donut-legend">
            {donutData.map(d => (
              <div key={d.name} className="donut-legend-item">
                <span className="donut-dot" style={{ background: d.fill }} />
                <span className="donut-label">{d.name}</span>
                <span className="donut-val" style={{ color: d.fill }}>{d.value}</span>
              </div>
            ))}
            {donutData.length === 0 && !loading && (
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>No data yet</p>
            )}
          </div>
        </div>

        {/* Avg Resolution KPI */}
        <div className="dash-chart-card kpi-only">
          <div className="dash-chart-card-header">
            <span className="dash-chart-card-title">Avg. Resolution Time</span>
            <span className="dash-chart-card-sub">Resolved cases</span>
          </div>
          <div className="kpi-big-center">
            {avgDays !== null
              ? <><span className="kpi-big-val">{avgDays}</span><span className="kpi-big-unit">days</span></>
              : <span className="kpi-big-val" style={{ fontSize: '2rem' }}>—</span>
            }
          </div>
          <p className="kpi-hint">Average time from filing to resolution</p>

          {/* Mini legend for severity colors */}
          <div className="sev-color-key">
            {[['#dc2626','High'],['#f59e0b','Medium'],['#2563eb','Low']].map(([c,l]) => (
              <div key={l} className="sev-key-item">
                <span className="sev-key-dot" style={{ background: c }} />
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
