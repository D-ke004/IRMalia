import React from 'react';

export default function PrintableBlotter({ incident }) {
  if (!incident) return null;

  const fmt = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', {
      weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:true
    });
  };

  const complainant = incident.parties?.find(p => p.party_type === 'complainant') || incident.complainant || {};
  const respondent  = incident.parties?.find(p => p.party_type === 'respondent')  || incident.respondent  || {};
  const witnesses   = incident.witnesses || [];
  const nowStr      = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:true });

  return (
    <div className="print-only-container">
      <div className="blotter-sheet">
        <div className="print-watermark">BARANGAY MALIA</div>

        {/* Header */}
        <div className="blotter-header">
          <p className="blotter-header-sub">Republic of the Philippines</p>
          <p className="blotter-header-sub">Province of Cavite</p>
          <p className="blotter-header-sub">Municipality of General Mariano Alvarez</p>
          <p className="blotter-header-sub" style={{ fontWeight:'bold' }}>BARANGAY EPIFANIO MALIA</p>
          <p className="blotter-header-sub" style={{ fontSize:'9pt', color:'#666', marginTop:4 }}>Office of the Barangay Captain & Lupong Tagapamayapa</p>
          <h1 className="blotter-header-title">OFFICIAL INCIDENT BLOTTER REPORT</h1>
        </div>

        <div className="blotter-body">
          {/* Case Details */}
          {[
            ['CASE NUMBER',          incident.case_id || incident.caseId,   { fontFamily:'monospace', fontWeight:'bold', fontSize:'12pt' }],
            ['INCIDENT TYPE',        incident.incident_type,                  { fontWeight:'bold' }],
            ['DATE & TIME OF INCIDENT', fmt(incident.date_time_of_incident || incident.dateTime), {}],
            ['INCIDENT LOCATION',    `${incident.purok || '—'}${incident.street_address ? ', ' + incident.street_address : ''} • Brgy. Epifanio Malia, GMA, Cavite`, {}],
            ['CASE URGENCY / SEVERITY', incident.severity?.toUpperCase(), { fontWeight:'bold' }],
            ['CASE STATUS',          incident.status?.toUpperCase(),          { fontWeight:'bold' }],
            incident.referred_to ? ['REFERRED TO',  incident.referred_to, {}] : null,
            incident.officer_on_duty ? ['OFFICER ON DUTY', incident.officer_on_duty, {}] : null,
          ].filter(Boolean).map(([label, val, style]) => (
            <div className="blotter-row" key={label}>
              <div className="blotter-label">{label}:</div>
              <div className="blotter-value" style={style}>{val || '—'}</div>
            </div>
          ))}

          {/* Complainant */}
          <div style={{ marginTop:12, borderTop:'1px double #000', paddingTop:10 }}>
            <h3 style={{ fontSize:'10pt', fontWeight:'bold', textTransform:'uppercase', marginBottom:8 }}>Complainant / Reporter</h3>
            {[
              ['Full Name',       complainant.full_name],
              ['Age / Sex',       [complainant.age, complainant.sex, complainant.civil_status].filter(Boolean).join(' / ')],
              ['Address',         complainant.address],
              ['Contact',         complainant.contact_number],
            ].map(([label, val]) => val ? (
              <div className="blotter-row" key={label}>
                <div className="blotter-label">{label}:</div>
                <div className="blotter-value">{val}</div>
              </div>
            ) : null)}
          </div>

          {/* Respondent */}
          {respondent.full_name && (
            <div style={{ marginTop:10, borderTop:'1px solid #ccc', paddingTop:10 }}>
              <h3 style={{ fontSize:'10pt', fontWeight:'bold', textTransform:'uppercase', marginBottom:8 }}>Respondent / Subject</h3>
              {[
                ['Full Name',       respondent.full_name],
                ['Age / Sex',       [respondent.age, respondent.sex, respondent.civil_status].filter(Boolean).join(' / ')],
                ['Address',         respondent.address],
                ['Contact',         respondent.contact_number],
              ].map(([label, val]) => val ? (
                <div className="blotter-row" key={label}>
                  <div className="blotter-label">{label}:</div>
                  <div className="blotter-value">{val}</div>
                </div>
              ) : null)}
            </div>
          )}

          {/* Witnesses */}
          {witnesses.length > 0 && (
            <div style={{ marginTop:10, borderTop:'1px solid #ccc', paddingTop:10 }}>
              <h3 style={{ fontSize:'10pt', fontWeight:'bold', textTransform:'uppercase', marginBottom:8 }}>Witnesses</h3>
              {witnesses.map((w, i) => (
                <p key={i} style={{ margin:'2px 0', fontSize:'9pt' }}>
                  {i + 1}. {w.full_name}{w.address ? ` — ${w.address}` : ''}{w.contact_number ? ` (${w.contact_number})` : ''}
                </p>
              ))}
            </div>
          )}

          {/* Narrative */}
          <div style={{ marginTop:12 }}>
            <h3 style={{ fontSize:'10pt', fontWeight:'bold', textTransform:'uppercase', marginBottom:4 }}>Incident Narrative / Statement of Facts:</h3>
            <div className="blotter-narrative-box">{incident.narrative}</div>
          </div>

          {/* Action Taken */}
          <div style={{ marginTop:10 }}>
            <h3 style={{ fontSize:'10pt', fontWeight:'bold', textTransform:'uppercase', marginBottom:4 }}>Action Taken / Resolution Summary:</h3>
            <div className="blotter-narrative-box" style={{ minHeight:80 }}>
              {incident.action_taken || 'No resolution recorded at time of printing.'}
            </div>
          </div>

          {/* Signatures */}
          <div className="blotter-signatures">
            <div>
              <div className="blotter-signature-line">
                <span className="blotter-signature-title">{complainant.full_name || '___________________________'}</span>
                <p>Complainant Signature / Thumbmark</p>
              </div>
            </div>
            {respondent.full_name && (
              <div>
                <div className="blotter-signature-line">
                  <span className="blotter-signature-title">{respondent.full_name}</span>
                  <p>Respondent Signature / Thumbmark</p>
                </div>
              </div>
            )}
            <div>
              <div className="blotter-signature-line">
                <span className="blotter-signature-title">{incident.officer_on_duty || '_______________________'}</span>
                <p>Desk Officer / Attending Investigator</p>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'center', marginTop:20 }}>
            <div style={{ width:'60%' }} className="blotter-signature-line">
              <span className="blotter-signature-title">HON. BARANGAY CAPTAIN</span>
              <p>Punong Barangay (Attesting Authority)</p>
            </div>
          </div>

          <div style={{ textAlign:'center', fontSize:'8pt', color:'#777', marginTop:30, borderTop:'1px solid #ddd', paddingTop:10 }}>
            Document generated on: {nowStr} • Barangay Malia Incident Report Management System
          </div>
        </div>
      </div>
    </div>
  );
}
