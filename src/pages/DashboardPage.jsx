import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import StatsSummary from '../components/StatsSummary';
import DashboardCharts from '../components/DashboardCharts';
import { QUICK_TEMPLATES } from '../components/QuickFillSidebar';

// Show top 4 templates (by priority — high to low)
const DASHBOARD_SHORTCUTS = QUICK_TEMPLATES.slice(0, 4);

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [statsKey, setStatsKey] = useState(0);

  const addToast = useCallback((msg, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  // Auto-refresh stats every 30s & on tab refocus
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) setStatsKey(p => p + 1);
    }, 30000);
    const handleVisibility = () => { if (!document.hidden) setStatsKey(p => p + 1); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', handleVisibility); };
  }, []);

  const handleQuickFile = (template) => {
    navigate('/blotter', { state: { template } });
  };

  return (
    <div className="dashboard-page-container">
      {/* Top Application Header */}
      <Header />

      {/* Admin Welcome & Action Banner */}
      <div className="friendly-welcome-banner">
        <div className="welcome-info">
          <h2>{t('good_morning')}, <span className="officer-highlight">{user?.full_name || 'Officer'}</span>!</h2>
          <p>{t('dashboard_subtitle')}</p>
        </div>

        <div className="welcome-cta">
          <button
            type="button"
            className="btn-giant-action"
            onClick={() => navigate('/blotter')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>{t('file_new_blotter')}</span>
          </button>
        </div>
      </div>

      {/* Quick File Shortcuts — top 4 templates */}
      <div className="dashboard-quickfile-section">
        <div className="qf-section-header">
          <div className="qf-header-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span className="qf-section-title">{t('quick_file_title')}</span>
          </div>
          <span className="qf-section-sub">{t('quick_file_subtitle')}</span>
        </div>
        <div className="dashboard-quickfile-grid">
          {DASHBOARD_SHORTCUTS.map(tpl => {
            const label = lang === 'tl' ? (tpl.labelTl || tpl.label) : (tpl.labelEn || tpl.label);
            return (
              <button
                key={tpl.id}
                type="button"
                className={`dash-quickfile-btn sev-${tpl.severity}`}
                onClick={() => handleQuickFile(tpl)}
              >
                <div className="dqf-top">
                  <span className="dqf-label">{label}</span>
                  <span className={`dqf-sev-badge sev-tag-${tpl.severity}`}>
                    {tpl.severity.toUpperCase()}
                  </span>
                </div>
                <span className="dqf-sub">
                  <span>{t('quick_file_btn')}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="dashboard-stats-wrapper">
        <StatsSummary refreshKey={statsKey} />
      </div>

      {/* Live Operational Visual Charts */}
      <div className="dashboard-charts-wrapper">
        <DashboardCharts refreshKey={statsKey} />
      </div>



      {/* Toast HUD */}
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
