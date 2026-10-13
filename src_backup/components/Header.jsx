import React from 'react';

export default function Header() {
  const [time, setTime] = React.useState('');
  React.useEffect(() => {
    const tick = () => setTime(new Date().toLocaleDateString('en-US', {
      weekday:'long', year:'numeric', month:'long', day:'numeric',
      hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true,
    }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-details">
          <h1>BARANGAY EPIFANIO MALIA</h1>
          <p>General Mariano Alvarez, Cavite • Incident Blotter System</p>
        </div>
      </div>
      <div className="header-meta">
        <div className="live-clock"><span>{time}</span></div>
      </div>
    </header>
  );
}
