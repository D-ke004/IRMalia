import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const NavIcons = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Incidents: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Blotter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10"/>
      <line x1="12" x2="12" y1="20" y2="4"/>
      <line x1="6" x2="6" y1="20" y2="14"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Audit: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  )
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const NAV = [
    { to: '/',          labelKey: 'nav_home',      icon: NavIcons.Home,      exact: true },
    { to: '/incidents', labelKey: 'nav_incidents', icon: NavIcons.Incidents, exact: false },
    { to: '/blotter',   labelKey: 'nav_blotter',   icon: NavIcons.Blotter,   exact: false },
    { to: '/analytics', labelKey: 'nav_analytics', icon: NavIcons.Analytics, exact: false },
    { to: '/users',     labelKey: 'nav_users',     icon: NavIcons.Users,     adminOnly: true },
    { to: '/audit',     labelKey: 'nav_audit',     icon: NavIcons.Audit,     adminOnly: true },
  ];

  const handleLogout = async () => {
    if (window.confirm(t('confirm_logout'))) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar friendly-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <img src="/logomalia.jpg" alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
        <div className="sidebar-brand-text">
          <span className="sidebar-title">Brgy. Epifanio Malia</span>
          <span className="sidebar-subtitle">Incident Blotter System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.filter(n => !n.adminOnly || user?.role === 'admin').map(n => {
          const IconComponent = n.icon;
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">
                <IconComponent />
              </span>
              <span className="sidebar-label">{t(n.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user?.full_name?.[0] || 'U'}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.full_name || 'Desk Officer'}</span>
            <span className="sidebar-user-role-badge">{user?.role?.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} type="button">
          <NavIcons.Logout />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
