import React, { useState } from 'react';

const PUROKS    = ['Purok 1','Purok 2','Purok 3','Purok 4','Purok 5','Purok 6'];
const SEXES     = ['Male','Female','Other'];
const CIV_STAT  = ['Single','Married','Widowed','Separated'];
const REFERRED  = ['PNP (Police)','DSWD','Hospital / Clinic','Barangay Court','Municipal Court','Other'];

const TABS = [
  { id: 'case',    icon: '📋', label: 'Case Info' },
  { id: 'parties', icon: '👤', label: 'Parties'   },
  { id: 'details', icon: '📝', label: 'Details'   },
];

/* ── Reusable Party Section ── */
function PartySection({ label, color, data, onChange }) {
  return (
    <div className="party-block" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="party-block-title" style={{ color }}>{label}</div>

      <div className="form-row-grid">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Full Name</label>
          <input type="text" className="form-control" placeholder="Full legal name"
            value={data.full_name} onChange={e => onChange('full_name', e.target.value)} />
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label>Age</label>
          <input type="number" className="form-control" placeholder="Age" min="1" max="120"
            value={data.age} onChange={e => onChange('age', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Sex</label>
          <select className="form-control" value={data.sex} onChange={e => onChange('sex', e.target.value)}>
            <option value="">—</option>
            {SEXES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Civil Status</label>
          <select className="form-control" value={data.civil_status} onChange={e => onChange('civil_status', e.target.value)}>
            <option value="">—</option>
            {CIV_STAT.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row-grid">
        <div className="form-group">
          <label>Home Address</label>
          <input type="text" className="form-control" placeholder="Complete address"
            value={data.address} onChange={e => onChange('address', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input type="tel" className="form-control" placeholder="e.g. 0917-123-4567"
            value={data.contact_number} onChange={e => onChange('contact_number', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function ActiveForm({ formData, onChange, onSave, onReset, onPrintCurrent, isEditing }) {
  const [activeTab, setActiveTab] = useState('case');

  const setNow = () => {
    const now = new Date();
    onChange('date_time_of_incident', new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const updateParty = (type, field, val) => onChange(type, { ...formData[type], [field]: val });

  const addWitness    = () => onChange('witnesses', [...(formData.witnesses||[]), { full_name:'', address:'', contact_number:'' }]);
  const removeWitness = (i) => onChange('witnesses', formData.witnesses.filter((_, j) => j !== i));
  const updateWitness = (i, field, val) => {
    const arr = [...formData.witnesses];
    arr[i] = { ...arr[i], [field]: val };
    onChange('witnesses', arr);
  };

  /* Tab fill indicators */
  const filled = {
    case:    !!(formData.date_time_of_incident && formData.incident_type && formData.purok),
    parties: !!(formData.complainant?.full_name),
    details: !!(formData.narrative),
  };

  return (
    <div className="form-panel">
      {/* Panel Header */}
      <div className="form-panel-header">
        <div className="form-panel-title">
          {isEditing
            ? <><span className="form-edit-badge">EDIT</span> <span>{formData.caseId}</span></>
            : 'New Blotter Report'
          }
        </div>
        <div className="form-panel-caseid">
          {!isEditing && <span className="caseid-placeholder">Case ID: AUTO-GENERATED</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="form-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`form-tab ${activeTab === t.id ? 'active' : ''} ${filled[t.id] ? 'filled' : ''}`}
            onClick={() => setActiveTab(t.id)}
            type="button"
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {filled[t.id] && <span className="tab-dot" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="form-tab-content">
        <form onSubmit={e => { e.preventDefault(); onSave(); }}>

          {/* ── TAB: CASE INFO ── */}
          {activeTab === 'case' && (
            <div className="tab-pane">
              <div className="form-row-grid">
                <div className="form-group">
                  <label>Case Number</label>
                  <input type="text" className="form-control" value={formData.caseId || 'AUTO-GENERATED'} readOnly />
                </div>
                <div className="form-group">
                  <label>Incident Date & Time *</label>
                  <div className="input-container">
                    <input type="datetime-local" className="form-control" style={{ paddingRight: 80 }}
                      value={formData.date_time_of_incident || ''} required
                      onChange={e => onChange('date_time_of_incident', e.target.value)} />
                    <button type="button" className="btn btn-secondary btn-inline" onClick={setNow}>NOW</button>
                  </div>
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Incident Type *</label>
                  <input type="text" className="form-control" placeholder="Select ⚡ shortcut or type manually"
                    value={formData.incident_type || ''} required
                    onChange={e => onChange('incident_type', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Location / Purok *</label>
                  <select className="form-control" value={formData.purok || ''} required
                    onChange={e => onChange('purok', e.target.value)}>
                    <option value="">— Choose Purok —</option>
                    {PUROKS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Exact Street Address of Incident</label>
                <input type="text" className="form-control"
                  placeholder="House no., street name, landmark..."
                  value={formData.street_address || ''}
                  onChange={e => onChange('street_address', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Urgency / Severity</label>
                <div className="severity-row">
                  {[['low','🟢','Low','#10b981'],['medium','🟡','Medium','#f59e0b'],['high','🔴','High','#ef4444']].map(([val, icon, lbl, color]) => (
                    <button key={val} type="button"
                      className={`severity-btn ${formData.severity === val ? 'selected' : ''}`}
                      style={{ '--sev-color': color }}
                      onClick={() => onChange('severity', val)}>
                      {icon} {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab nav hint */}
              <div className="tab-next-hint">
                Next: <button type="button" className="tab-next-btn" onClick={() => setActiveTab('parties')}>👤 Parties →</button>
              </div>
            </div>
          )}

          {/* ── TAB: PARTIES ── */}
          {activeTab === 'parties' && (
            <div className="tab-pane">
              <PartySection label="COMPLAINANT / REPORTER" color="#10b981"
                data={formData.complainant || {}} onChange={(f, v) => updateParty('complainant', f, v)} />

              <PartySection label="RESPONDENT / SUBJECT" color="#ef4444"
                data={formData.respondent || {}} onChange={(f, v) => updateParty('respondent', f, v)} />

              {/* Witnesses */}
              <div className="witnesses-header">
                <span>WITNESSES ({formData.witnesses?.length || 0})</span>
                <button type="button" className="btn btn-secondary" style={{ fontSize:'0.75rem', padding:'4px 12px' }} onClick={addWitness}>
                  + Add Witness
                </button>
              </div>
              {(formData.witnesses || []).map((w, i) => (
                <div key={i} className="witness-row">
                  <span className="witness-num">#{i+1}</span>
                  <input type="text" className="form-control" placeholder="Full name"
                    value={w.full_name} onChange={e => updateWitness(i, 'full_name', e.target.value)} />
                  <input type="text" className="form-control" placeholder="Address"
                    value={w.address} onChange={e => updateWitness(i, 'address', e.target.value)} />
                  <input type="tel" className="form-control" placeholder="Contact"
                    value={w.contact_number} onChange={e => updateWitness(i, 'contact_number', e.target.value)} />
                  <button type="button" className="btn btn-secondary btn-icon-only" style={{ flexShrink:0 }} onClick={() => removeWitness(i)}>✕</button>
                </div>
              ))}

              <div className="tab-next-hint">
                Next: <button type="button" className="tab-next-btn" onClick={() => setActiveTab('details')}>📝 Details →</button>
              </div>
            </div>
          )}

          {/* ── TAB: DETAILS ── */}
          {activeTab === 'details' && (
            <div className="tab-pane">
              <div className="form-group" style={{ flexGrow:1 }}>
                <label>Narrative / Incident Details *</label>
                <textarea className="form-control narrative-area" required
                  placeholder="Comprehensive narrative — Who, What, Where, When, Why, How..."
                  value={formData.narrative || ''}
                  onChange={e => onChange('narrative', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Action Taken / Resolution Notes</label>
                <textarea className="form-control" style={{ minHeight:80 }}
                  placeholder="Actions taken by desk officer, mediation agreement, warnings issued..."
                  value={formData.action_taken || ''}
                  onChange={e => onChange('action_taken', e.target.value)} />
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Referred To</label>
                  <select className="form-control" value={formData.referred_to || ''}
                    onChange={e => onChange('referred_to', e.target.value)}>
                    <option value="">— Not Referred —</option>
                    {REFERRED.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Officer on Duty</label>
                  <input type="text" className="form-control" placeholder="Attending officer"
                    value={formData.officer_on_duty || ''}
                    onChange={e => onChange('officer_on_duty', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Case Status</label>
                <div className="status-radio-group">
                  {['pending','active','resolved','referred'].map(s => (
                    <button key={s} type="button"
                      className={`status-radio-btn ${s} ${formData.status === s ? 'selected' : ''}`}
                      onClick={() => onChange('status', s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ALWAYS VISIBLE: Action Buttons ── */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onReset}>
              {isEditing ? 'Cancel Edit' : 'Clear Form'}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-primary" onClick={onPrintCurrent}
                style={{ background:'var(--color-referred)', color:'#fff' }}>
                🖨 Print
              </button>
            )}
            <button type="submit" className="btn btn-success">
              {isEditing ? '✓ Update Blotter' : '✓ Post Blotter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
