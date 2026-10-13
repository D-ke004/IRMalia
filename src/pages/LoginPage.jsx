import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left — Branding */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-seal" style={{ background: 'transparent', padding: 0 }}>
            <img src="/logomalia.jpg" alt="Logo" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
          </div>
          <h1 className="login-brand-name">Barangay<br />Epifanio Malia</h1>
          <p className="login-brand-sub">General Mariano Alvarez, Cavite</p>
          <div className="login-brand-divider" />
          <p className="login-brand-system">Incident Report Management System</p>
          <p className="login-brand-tagline">
            Digitizing barangay blotter records for faster,<br />
            more accurate community justice.
          </p>
          <div className="login-brand-badges">
            <span className="login-badge">RA 7160 Compliant</span>
            <span className="login-badge">DILG Standards</span>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="login-form-panel">
        <div className="login-form-card">
          <div className="login-form-header">
            <h2>Officer Login</h2>
            <p>Sign in to access the blotter system</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-pw-wrap">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="login-pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? <span className="login-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="login-footer-note">
            Authorized personnel only. All access is logged and audited.
          </p>
        </div>
      </div>
    </div>
  );
}
