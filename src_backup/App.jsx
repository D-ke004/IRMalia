import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage     from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BlotterPage   from './pages/BlotterPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage     from './pages/UsersPage';
import AuditPage     from './pages/AuditPage';
import Sidebar       from './components/Sidebar';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loader"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route path="/*" element={
        <ProtectedRoute>
          <div className="app-layout">
            <Sidebar />
            <main className="app-main">
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="blotter"   element={<BlotterPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="users"     element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
                <Route path="audit"     element={<ProtectedRoute adminOnly><AuditPage /></ProtectedRoute>} />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
