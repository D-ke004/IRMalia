import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const [time, setTime] = React.useState('');
  const { lang, toggleLang } = useLanguage();

  React.useEffect(() => {
    const tick = () => setTime(new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="app-header">
      <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img src="/logomalia.jpg" alt="Barangay Epifanio Malia Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
        <div className="brand-details">
          <h1>BARANGAY EPIFANIO MALIA</h1>
          <p>General Mariano Alvarez, Cavite • Incident Blotter System</p>
        </div>
      </div>
      <div className="header-meta">
        <div className="live-clock">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, opacity: 0.7 }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{time}</span>
        </div>
        <button
          className="lang-toggle-btn"
          onClick={toggleLang}
          title="Switch Language / Palitan ang Wika"
          type="button"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lang-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span className="lang-segment">
            <span className={lang === 'en' ? 'lang-code active' : 'lang-code'}>EN</span>
            <span className="lang-sep">/</span>
            <span className={lang === 'tl' ? 'lang-code active' : 'lang-code'}>FIL</span>
          </span>
          <span className="lang-action-text">{lang === 'en' ? 'Tagalog' : 'English'}</span>
        </button>
      </div>
    </header>
  );
}
