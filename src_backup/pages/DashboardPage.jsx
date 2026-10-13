import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StatsSummary from '../components/StatsSummary';
import TicketQueue from '../components/TicketQueue';
import PrintableBlotter from '../components/PrintableBlotter';
import { getIncidents, deleteIncident, resolveIncident } from '../utils/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [printIncident, setPrintIncident] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [statsKey, setStatsKey] = useState(0);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });

  const addToast = useCallback((msg, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getIncidents({ status: filters.status, search: filters.search, page: filters.page });
      setIncidents(r.data?.data || []);
      setTotal(r.data?.total || 0);
    } catch {
      setIncidents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleQuickResolve = async (id) => {
    try {
      const inc = incidents.find(i => i.id === id);
      await resolveIncident(id);
      addToast(`Case ${inc?.case_id} resolved successfully.`, 'success');
      fetchIncidents();
      setStatsKey(p => p + 1);
    } catch {
      addToast('Failed to resolve incident.', 'danger');
    }
  };

  const handleQuickDelete = async (id) => {
    const inc = incidents.find(i => i.id === id);
    if (!window.confirm(`Archive case "${inc?.case_id}"?`)) return;
    try {
      await deleteIncident(id);
      addToast(`Case ${inc?.case_id} archived.`, 'danger');
      fetchIncidents();
      setStatsKey(p => p + 1);
    } catch (err) {
      addToast(err.response?.data?.error || 'Archive failed.', 'danger');
    }
  };

  const triggerPrint = (inc) => {
    setPrintIncident(inc);
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="dashboard-page-container">
      {/* Top Application Header */}
      <Header />

      {/* Admin Action Header */}
      <div className="dashboard-welcome-bar">
        <div className="welcome-text">
          <h2>Welcome back, <span className="officer-name">{user?.full_name || 'Officer'}</span> 👋</h2>
          <p>Barangay Epifanio Malia Incident Management Control Panel</p>
        </div>
        <div className="dashboard-action-buttons">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/blotter')}
          >
            ➕ File New Blotter Report
          </button>
        </div>
      </div>

      {/* Stats Summary Widget Grid */}
      <div className="dashboard-stats-wrapper">
        <StatsSummary refreshKey={statsKey} />
      </div>

      {/* Full-width Incident Queue Table / Grid */}
      <main className="dashboard-main-content">
        <TicketQueue
          incidents={incidents}
          total={total}
          loading={loading}
          filters={filters}
          onFilterChange={setFilters}
          onQuickResolve={handleQuickResolve}
          onQuickDelete={handleQuickDelete}
          onQuickPrint={triggerPrint}
        />
      </main>

      <PrintableBlotter incident={printIncident} />

      {/* Toast HUD */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ fontWeight: 800, fontSize: '0.7rem', marginRight: 4 }}>
              {t.type === 'success' && '✓'}{t.type === 'info' && 'ℹ'}{t.type === 'danger' && '⚠'}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
