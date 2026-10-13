import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getIncidents } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

// Clean inline SVGs
const Icons = {
  Total: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <line x1="3" x2="21" y1="9" y2="9"/>
      <line x1="9" x2="9" y1="21" y2="9"/>
    </svg>
  ),
  Pending: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Active: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Resolved: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Referred: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="5" x2="19" y1="12" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  HighOpen: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" x2="12" y1="9" y2="13"/>
      <line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  ),
  ResRate: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  ThisMonth: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  )
};

const STATUS_BORDER_COLORS = {
  pending: '#ea580c',
  active: '#2563eb',
  resolved: '#0d9488',
  referred: '#64748b',
};

export default function StatsSummary({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [modalIncidents, setModalIncidents] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {});
  }, [refreshKey]);

  const handleCardClick = async (key) => {
    if (['pending', 'active', 'resolved', 'referred'].includes(key)) {
      setSelectedStatus(key);
      setLoadingModal(true);
      try {
        const res = await getIncidents({ status: key, per_page: 50 });
        setModalIncidents(res.data?.data || []);
      } catch {
        setModalIncidents([]);
      } finally {
        setLoadingModal(false);
      }
    } else {
      navigate('/incidents');
    }
  };

  const PRIMARY_COLOR = '#2563eb';
  const SLATE_COLOR = '#475569';

  // PRIORITIZED ORDER: Pending, Active, Resolved, Referred first
  const CARDS = [
    { key: 'pending',    labelKey: 'stat_pending',    Icon: Icons.Pending, color: '#ea580c' },
    { key: 'active',     labelKey: 'stat_active',     Icon: Icons.Active, color: '#2563eb' },
    { key: 'resolved',   labelKey: 'stat_resolved',   Icon: Icons.Resolved, color: '#0d9488' },
    { key: 'referred',   labelKey: 'stat_referred',   Icon: Icons.Referred, color: '#64748b' },
    { key: 'total',      labelKey: 'stat_total',      Icon: Icons.Total, color: PRIMARY_COLOR },
    { key: 'high_open',  labelKey: 'stat_high_open',  Icon: Icons.HighOpen, color: '#dc2626' },
    { key: 'res_rate',   labelKey: 'stat_res_rate',   Icon: Icons.ResRate, suffix: '%', color: '#10b981' },
    { key: 'this_month', labelKey: 'stat_this_month', Icon: Icons.ThisMonth, color: '#8b5cf6' },
  ];

  return (
    <>
      <div className="friendly-stats-summary">
        {CARDS.map(c => {
          const raw = stats?.[c.key];
          const val = raw != null ? raw : null;
          const isClickable = ['pending', 'active', 'resolved', 'referred'].includes(c.key);
          return (
            <div
              key={c.key}
              className={`friendly-stat-card ${isClickable ? 'clickable-stat-card' : ''}`}
              style={{ borderTop: `4px solid ${c.color || PRIMARY_COLOR}`, cursor: 'pointer' }}
              onClick={() => handleCardClick(c.key)}
              title={isClickable ? `Click to view ${c.key} cases modal` : 'Click to view all incidents'}
            >
              <div className="stat-card-header">
                <span className="stat-card-icon" style={{ color: c.color || SLATE_COLOR, display: 'flex', alignItems: 'center' }}>
                  <c.Icon />
                </span>
                <span className="stat-card-title" style={{ color: SLATE_COLOR }}>{t(c.labelKey)}</span>
              </div>
              <div className="stat-card-body">
                <span className="stat-card-number" style={{ color: c.color || PRIMARY_COLOR }}>
                  {val != null ? `${val}${c.suffix || ''}` : <span className="stat-loading" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Modal for Prioritized Cards */}
      {selectedStatus && (
        <div className="status-modal-overlay" onClick={() => setSelectedStatus(null)}>
          <div className="status-modal-content" onClick={e => e.stopPropagation()}>
            <div className="status-modal-header" style={{ borderLeft: `6px solid ${STATUS_BORDER_COLORS[selectedStatus] || '#2563eb'}` }}>
              <div>
                <h2>{selectedStatus.toUpperCase()} Cases Summary</h2>
                <p>Click any case below to proceed directly to its information.</p>
              </div>
              <button type="button" className="status-modal-close" onClick={() => setSelectedStatus(null)}>✕</button>
            </div>

            <div className="status-modal-body">
              {loadingModal ? (
                <div style={{ textAlign: 'center', padding: '30px' }}><div className="spinner" /></div>
              ) : modalIncidents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No {selectedStatus} cases found at this moment.
                </div>
              ) : (
                <div className="status-modal-list">
                  {modalIncidents.map(inc => (
                    <div
                      key={inc.id}
                      className="status-modal-item"
                      onClick={() => {
                        setSelectedStatus(null);
                        navigate(`/blotter?edit=${inc.id}`, { state: { incident: inc } });
                      }}
                    >
                      <div className="smi-top">
                        <span className="smi-id">{inc.case_id}</span>
                        <span className="smi-type">{inc.incident_type}</span>
                        <span className="smi-purok">{inc.purok}</span>
                      </div>
                      <div className="smi-mid">
                        <span><strong>Complainant:</strong> {inc.complainant_name || '—'}</span>
                        {inc.respondent_name && <span> vs. <strong>Respondent:</strong> {inc.respondent_name}</span>}
                      </div>
                      <div className="smi-date">
                        {inc.date_time_of_incident ? new Date(inc.date_time_of_incident).toLocaleString('en-US') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

