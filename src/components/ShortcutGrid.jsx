import React from 'react';

const STREETS = [
  'Maquinay',
  'Antimony',
  'Bismuth',
  'Copper',
  'Hydrogen',
  'Manganese',
  'Neon',
  'Platinum',
  'Potassium',
  'Socio hope',
  'Eagle Ville',
];
const SEVERITIES = [
  { label:'Low',    val:'low',    color:'#10b981' },
  { label:'Medium', val:'medium', color:'#f59e0b' },
  { label:'High',   val:'high',   color:'#ef4444' },
];
const INCIDENT_GROUPS = [
  { title:'Public Order & Nuisance', items:[
    { label:'Noise Complaint', val:'Noise' },
    { label:'Animal Nuisance', val:'Animal' },
    { label:'Neighborhood Dispute', val:'Dispute' },
  ]},
  { title:'Property & Violations', items:[
    { label:'Theft / Robbery',    val:'Theft' },
    { label:'Vandalism / Damage', val:'Vandalism' },
    { label:'Trespassing',        val:'Trespassing' },
  ]},
  { title:'Safety & Emergency', items:[
    { label:'Medical Emergency',   val:'Medical' },
    { label:'Domestic Altercation',val:'Domestic' },
    { label:'Traffic Accident',    val:'Traffic' },
  ]},
  { title:'Other', items:[
    { label:'Drug-related',  val:'Drug' },
    { label:'Illegal Gambling', val:'Gambling' },
    { label:'Other Incidents', val:'Others' },
  ]},
];

export default function ShortcutGrid({ activeType, onSelectType, activePurok, onSelectPurok, activeSeverity, onSelectSeverity }) {
  return (
    <div className="dashboard-col">
      <div className="col-header"><h2>POS SHORTCUTS</h2></div>
      <div className="col-content" style={{ gap: '14px' }}>

        <div className="shortcut-section">
          <span className="shortcut-title" style={{ borderBottom:'1px solid var(--border-color)', paddingBottom:4, marginBottom:8 }}>Incident Category</span>
          {INCIDENT_GROUPS.map(g => (
            <div key={g.title} style={{ marginBottom:8 }}>
              <span className="shortcut-title" style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', display:'block', marginBottom:4 }}>{g.title}</span>
              <div className="shortcut-grid">
                {g.items.map(item => (
                  <button key={item.val} type="button"
                    className={`shortcut-btn ${activeType === item.val ? 'active' : ''}`}
                    onClick={() => onSelectType(item.val)} style={{ padding:8 }}>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcut-section">
          <span className="shortcut-title" style={{ borderBottom:'1px solid var(--border-color)', paddingBottom:4, marginBottom:8 }}>Streets</span>
          <div className="shortcut-grid">
            {STREETS.map(p => (
              <button key={p} type="button"
                className={`shortcut-btn ${activePurok === p ? 'active' : ''}`}
                onClick={() => onSelectPurok(p)} style={{ padding:8 }}>
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="shortcut-section">
          <span className="shortcut-title" style={{ borderBottom:'1px solid var(--border-color)', paddingBottom:4, marginBottom:8 }}>Urgency / Severity</span>
          <div className="shortcut-grid-3">
            {SEVERITIES.map(sev => (
              <button key={sev.val} type="button"
                className={`shortcut-btn ${activeSeverity === sev.val ? 'active' : ''}`}
                onClick={() => onSelectSeverity(sev.val)} style={{ padding:8 }}>
                <span style={{ color: activeSeverity === sev.val ? 'var(--color-active)' : sev.color }}>{sev.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
