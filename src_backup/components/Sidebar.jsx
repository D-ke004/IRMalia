import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',          label: 'Dashboard',     icon: '🏠', exact: true },
  { to: '/blotter',   label: 'Add Blotter',   icon: '📋' },
  { to: '/analytics', label: 'Analytics',     icon: '📊' },
  { to: '/users',     label: 'User Accounts', icon: '👥', adminOnly: true },
  { to: '/audit',     label: 'Audit Trail',   icon: '🔍', adminOnly: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">EM</div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-title">Brgy. Malia</span>
            <span className="sidebar-subtitle">IRMS</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={() => setCollapsed(p => !p)} title="Toggle Sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.filter(n => !n.adminOnly || user?.role === 'admin').map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? n.label : ''}
          >
            <span className="sidebar-icon">{n.icon}</span>
            {!collapsed && <span className="sidebar-label">{n.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.full_name?.[0] || '?'}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.full_name}</span>
              <span className={`sidebar-user-role role-${user?.role}`}>{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
