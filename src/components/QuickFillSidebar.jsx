import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const QUICK_TEMPLATES = [
  {
    id: 'pananakit',
    label: 'Pananakit / Physical Injury',
    labelEn: 'Physical Injury',
    labelTl: 'Pananakit / Pisikal na Pinsala',
    tag: 'Physical Injury',
    severity: 'high',
    status: 'active',
    priority: 1,
    incident_type: 'Physical Injury',
    narrative: 'Naganap ang pisikal na pananakit kung saan sinaktan, sinuntok, o tinamaan ang biktima na nagtamo ng pasa at galos sa katawan. Nangyari ang insidente matapos ang pagtatalo sa pagitan ng mga partido.',
    action_taken: 'Dinala ang biktima para sa Medico-Legal examination / gamutan sa pinakamalapit na ospital/klinika at inalerto ang kapulisan (PNP) kung kinakailangan ng pormal na pagsasampa ng kaso.',
  },
  {
    id: 'paninira',
    label: 'Paninirang Puri / Defamation',
    labelEn: 'Defamation / Verbal Abuse',
    labelTl: 'Paninirang Puri / Pagmumura',
    tag: 'Verbal / Slander',
    severity: 'medium',
    status: 'pending',
    priority: 2,
    incident_type: 'Defamation / Slander',
    narrative: 'Inirereklamo ang paninirang puri, pagmumura, at pamamahiya sa publiko o sa pamamagitan ng social media na walang sapat na batayan, na labis na nagdulot ng kahihiyan at pinsala sa reputasyon ng nagsumbong.',
    action_taken: 'Itinala ang salaysay at inilabas ang First Notice of Hearing (Unang Patawag) upang pagharapin ang dalawang partido sa tanggapan ng Lupon.',
  },
  {
    id: 'away_kapitbahay',
    label: 'Away Magkapitbahay / Dispute',
    labelEn: 'Neighbor Dispute',
    labelTl: 'Away Magkapitbahay',
    tag: 'Neighbor Dispute',
    severity: 'medium',
    status: 'pending',
    priority: 3,
    incident_type: 'Neighbor Dispute',
    narrative: 'Naganap ang mainitang pagtatalo at sigawan sa pagitan ng magkapitbahay dahil sa hindi pagkakaunawaan. Nagkaroon ng batuhan ng maaanghang na salita at naging sanhi ng tensyon at pagkagambala sa purok.',
    action_taken: 'Inimbitahan ang magkabilang panig sa Barangay Hall para sa pormal na paghaharap at pag-aayos sa pamamanan ng mediation ng Punong Barangay / Lupon Tagapamayapa.',
  },
  {
    id: 'ingay',
    label: 'Ingay / Videoke / Noise Disturbance',
    labelEn: 'Noise Disturbance',
    labelTl: 'Ingay / Maingay na Videoke',
    tag: 'Noise Disturbance',
    severity: 'low',
    status: 'pending',
    priority: 4,
    incident_type: 'Noise Disturbance',
    narrative: 'Inirereklamo ang labis na kaingayan dulot ng malakas na videoke / sound system / tambutso ng motor / pag-iingay ng nag-iinuman na nagaganap kahit dis-oras na ng gabi, na nagdudulot ng matinding istorbo at abala sa kapayapaan ng mga residente sa komunidad.',
    action_taken: 'Pinuntahan ng mga nakatalagang Barangay Tanod ang lugar upang pakiusapan, sitahin, at bigyan ng pormal na babala ukol sa umiiral na Barangay Anti-Noise Ordinance.',
  },
  {
    id: 'utang',
    label: 'Hindi Pagbabayad ng Utang',
    labelEn: 'Unpaid Debt / Financial Dispute',
    labelTl: 'Hindi Pagbabayad ng Utang',
    tag: 'Unpaid Debt',
    severity: 'low',
    status: 'pending',
    priority: 5,
    incident_type: 'Unpaid Debt / Financial Dispute',
    narrative: 'Naisulong ang reklamo dahil sa hindi pagbabayad ng inutang na halagang napagkasunduang babayaran sa takdang araw. Ilang beses nang sinisingil nang maayos subalit patuloy na hindi nagbabayad ang inirereklamo.',
    action_taken: 'Itinakda ang petsa ng pag-uusap at pagpapatawag (summons) sa respondent upang gumawa ng opisyal na kasunduan sa paraan at iskedyul ng pagbabayad (Payment Agreement).',
  },
  {
    id: 'parking',
    label: 'Harang sa Daan / Illegal Parking',
    labelEn: 'Illegal Parking / Obstruction',
    labelTl: 'Harang sa Daan / Bawal na Paradahan',
    tag: 'Traffic / Obstruction',
    severity: 'low',
    status: 'pending',
    priority: 6,
    incident_type: 'Illegal Parking / Obstruction',
    narrative: 'Inirereklamo ang sasakyan / gamit na iligal na nakaparada o nakaharang sa daanan o tapat ng gate/bahay, na nagiging sanhi ng masikip na trapiko at pagkaabala sa paglabas-masok ng mga tao at sasakyan.',
    action_taken: 'Sinita ng Barangay Tanod ang may-ari ng sasakyan/harang at inatasang ilipat kaagad ito sa tamang paradahan.',
  },
  {
    id: 'aso',
    label: 'Gala o Maingay na Aso (Pet Nuisance)',
    labelEn: 'Pet Nuisance',
    labelTl: 'Gala o Maingay na Aso',
    tag: 'Pet Nuisance',
    severity: 'low',
    status: 'pending',
    priority: 7,
    incident_type: 'Pet Nuisance',
    narrative: 'Inirereklamo ang alagang aso/hayop na pinababayaan gumala sa kalye, maingay na tumatahol buong gabi, nanghahabol ng mga naglalakad, o nagdudulot ng maruming kapaligiran sa tapat ng kapitbahay.',
    action_taken: 'Binalaan ang may-ari alinsunod sa Responsible Pet Ownership Ordinance na itali o ikulong ang alaga at linisin ang anumang dumi sa kalsada.',
  },
  {
    id: 'basura',
    label: 'Pagtatapon ng Basura / Kalinisan',
    labelEn: 'Illegal Waste Disposal / Sanitation',
    labelTl: 'Maling Pagtatapon ng Basura',
    tag: 'Sanitation',
    severity: 'low',
    status: 'pending',
    priority: 8,
    incident_type: 'Illegal Waste Disposal',
    narrative: 'Inirereklamo ang maling pagtatapon at pag-iipon ng basura sa hindi tamang lugar, pagsusunog ng plastik/basura (open burning), o pagpapadaloy ng maruming tubig sa kalsada.',
    action_taken: 'Nagbigay ng pormal na abiso at inspection report ang Barangay Environmental Committee upang linisin ang lugar at sundin ang tamang oras ng koleksyon ng basura.',
  },
  {
    id: 'other',
    label: 'Other Complaint',
    labelEn: 'Other Complaint',
    labelTl: 'Iba Pang Reklamo',
    tag: 'Other',
    severity: 'low',
    status: 'pending',
    priority: 9,
    incident_type: 'Other',
    narrative: '',
    action_taken: '',
  },
];


const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };
const SEVERITY_LABELS = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };

export default function QuickFillSidebar({ isOpen, onSelectTemplate, activeTemplateId, nextCaseId, onClose }) {
  const [filterText, setFilterText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customComplaint, setCustomComplaint] = useState('');
  const [customSeverity, setCustomSeverity] = useState('low');
  const { t } = useLanguage();

  if (!isOpen) return null;

  const filtered = QUICK_TEMPLATES
    .filter(tpl =>
      tpl.label.toLowerCase().includes(filterText.toLowerCase()) ||
      tpl.tag.toLowerCase().includes(filterText.toLowerCase())
    )
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const handleSelect = (tpl) => {
    if (tpl.id === 'other') {
      // Show inline custom input instead of immediately applying
      setShowOtherInput(true);
      setCustomComplaint('');
      setCustomSeverity('low');
      return;
    }
    onSelectTemplate(tpl);
    if (onClose) onClose();
  };

  const handleApplyCustom = () => {
    const trimmed = customComplaint.trim();
    if (!trimmed) return;
    onSelectTemplate({
      id: 'other',
      label: 'Other Complaint',
      tag: 'Other',
      severity: customSeverity,
      status: 'pending',
      incident_type: trimmed,
      narrative: '',
      action_taken: '',
    });
    setShowOtherInput(false);
    setCustomComplaint('');
    if (onClose) onClose();
  };

  return (
    <div className="quickfill-drawer-backdrop" onClick={onClose}>
      <aside className="quickfill-drawer-content" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="quickfill-header">
          <div className="quickfill-title-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <div>
              <h3 className="quickfill-title">{t('quickfill_drawer_title')}</h3>
              <span className="quickfill-subtitle">{t('quickfill_drawer_subtitle')}</span>
            </div>
            <button type="button" className="qf-drawer-close" onClick={onClose} title="Close drawer">
              ✕
            </button>
          </div>
          <p className="quickfill-desc">
            {t('quickfill_desc')}
          </p>
          <div className="quickfill-priority-hint">
            <span className="qf-priority-dot high" /> High Urgency
            <span className="qf-priority-dot medium" /> Medium
            <span className="qf-priority-dot low" /> Low
          </div>
        </div>

        {/* Case ID Callout Card */}
        {nextCaseId && (
          <div className="quickfill-case-preview-card">
            <span className="qf-card-label">{t('quickfill_case_label')}</span>
            <span className="qf-card-val">{nextCaseId}</span>
            <span className="qf-card-hint">{t('quickfill_case_hint')}</span>
          </div>
        )}

        {/* Quick Search */}
        <div className="quickfill-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="qf-search-icon">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="quickfill-search-input"
            placeholder={t('quickfill_search')}
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
          {filterText && (
            <button className="quickfill-clear-btn" onClick={() => setFilterText('')} type="button">✕</button>
          )}
        </div>

        {/* Template Buttons List or Custom Input Panel */}
        {showOtherInput ? (
          /* ── Custom Complaint Input Panel ── */
          <div style={{
            background: '#f0f7ff', border: '2px solid #2563eb', borderRadius: 12,
            padding: '18px 16px', margin: '8px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>✏️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e3a8a' }}>Custom Complaint</div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Type your own complaint type below</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOtherInput(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', padding: 4 }}
                title="Back to template list"
              >← Back</button>
            </div>

            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
              Complaint / Incident Type *
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Theft, Trespassing, Family Dispute..."
              value={customComplaint}
              onChange={e => setCustomComplaint(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleApplyCustom(); }}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid #93c5fd', borderRadius: 8,
                fontSize: '0.9rem', outline: 'none',
                boxSizing: 'border-box', color: '#1e293b',
                background: '#ffffff',
              }}
            />

            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', margin: '12px 0 6px' }}>
              Urgency Level
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['high', '#dc2626', 'High'], ['medium', '#d97706', 'Medium'], ['low', '#10b981', 'Low']].map(([val, color, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCustomSeverity(val)}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer',
                    border: customSeverity === val ? `2px solid ${color}` : '1.5px solid #e2e8f0',
                    background: customSeverity === val ? color + '18' : '#f8fafc',
                    color: customSeverity === val ? color : '#64748b',
                    fontWeight: customSeverity === val ? 800 : 500,
                    fontSize: '0.8rem', transition: 'all 0.15s',
                  }}
                >{lbl}</button>
              ))}
            </div>

            <button
              type="button"
              disabled={!customComplaint.trim()}
              onClick={handleApplyCustom}
              style={{
                width: '100%', marginTop: 14,
                padding: '11px', borderRadius: 8,
                background: customComplaint.trim() ? '#2563eb' : '#e2e8f0',
                color: customComplaint.trim() ? '#ffffff' : '#94a3b8',
                border: 'none', fontWeight: 800, fontSize: '0.9rem',
                cursor: customComplaint.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              ⚡ Apply Custom Complaint
            </button>
          </div>
        ) : (
          <div className="quickfill-list">
            {filtered.map(tpl => {
              const isSelected = activeTemplateId === tpl.id;
              const sevLabel = SEVERITY_LABELS[tpl.severity] || tpl.severity.toUpperCase();
              return (
                <button
                  key={tpl.id}
                  type="button"
                  className={`quickfill-card-btn sev-${tpl.severity} ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelect(tpl)}
                >
                  <div className="qf-btn-top">
                    <span className="qf-btn-label">{tpl.label}</span>
                    <span className={`qf-btn-badge sev-tag-${tpl.severity}`}>
                      {sevLabel}
                    </span>
                  </div>
                  <p className="qf-btn-snippet">
                    {tpl.id === 'other'
                      ? 'Type your own complaint — leave fields blank for manual entry.'
                      : tpl.narrative.slice(0, 90) + '…'
                    }
                  </p>
                  <div className="qf-btn-action-row">
                    <span className="qf-tag-pill">{tpl.tag}</span>
                    <span className="qf-apply-text">
                      {tpl.id === 'other' ? 'Custom Input →' : (isSelected ? t('quickfill_applied') : t('quickfill_apply'))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="quickfill-tip-footer">
          {t('quickfill_tip')}
        </div>
      </aside>
    </div>
  );
}

