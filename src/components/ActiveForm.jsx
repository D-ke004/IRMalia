import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

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

const PRESET_TYPES = [
  { labelKey: 'Ingay / Videoke (Noise)', type: 'Noise Disturbance / Maingay (Ingay)' },
  { labelKey: 'Away Magkapitbahay (Dispute)', type: 'Neighbor Dispute / Away Magkapitbahay' },
  { labelKey: 'Hindi Pagbabayad ng Utang', type: 'Unpaid Debt / Hindi Pagbabayad ng Utang' },
  { labelKey: 'Harang sa Daan / Parking', type: 'Traffic / Illegal Parking / Harang sa Daan' },
  { labelKey: 'Gala o Maingay na Aso', type: 'Pet Nuisance / Gala o Maingay na Aso' },
  { labelKey: 'Basura at Kalinisan', type: 'Garbage & Sanitation / Pagtatapon ng Basura' },
  { labelKey: 'Paninirang Puri / Tsismis', type: 'Verbal Abuse / Paninirang Puri / Intriga' },
  { labelKey: 'Pananakit / Sakitan (Physical Injury)', type: 'Physical Injury / Pananakit / Sakitan' },
];

/**
 * Format a Philippine mobile number as 0XXX-XXX-XXXX (4-3-4)
 * Works while typing: strips non-digits, then formats.
 */
function formatPHPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
}

/* ── Party Information Box ── */
function PartyBlock({ title, subtitle, color, data, onChange, errors = {}, t, onRemove = null, removeLabel = null }) {
  const handlePhone = (e) => {
    const formatted = formatPHPhone(e.target.value);
    onChange('contact_number', formatted);
  };

  const sexOptions = [
    { val: 'Male', label: t('sex_male') },
    { val: 'Female', label: t('sex_female') },
    { val: 'Other', label: t('sex_other') },
  ];

  const civilOptions = [
    { val: 'Single', label: t('civil_single') },
    { val: 'Married', label: t('civil_married') },
    { val: 'Widowed', label: t('civil_widowed') },
    { val: 'Separated', label: t('civil_separated') },
  ];

  return (
    <div className="friendly-party-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="party-header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ color, margin: 0 }}>{title}</h3>
          {subtitle && <span className="party-subtitle" style={{ marginBottom: 0 }}>{subtitle}</span>}
        </div>
        {onRemove && (
          <button
            type="button"
            className="btn-remove-party"
            onClick={onRemove}
            title={removeLabel || 'Remove'}
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>✕</span>
            <span>{removeLabel || 'Remove'}</span>
          </button>
        )}
      </div>

      <div className="form-grid-2">
        <div className={`form-group-friendly full-width ${errors.full_name ? 'field-error' : ''}`}>
          <label>{t('full_name_label')}</label>
          <input
            type="text"
            className={`friendly-input ${errors.full_name ? 'input-error' : ''}`}
            placeholder={t('full_name_placeholder')}
            value={data.full_name || ''}
            onChange={e => onChange('full_name', e.target.value)}
          />
          {errors.full_name && <span className="field-error-msg">⚠ {errors.full_name}</span>}
        </div>

        <div className="form-group-friendly">
          <label>{t('age_label')}</label>
          <input
            type="number"
            className="friendly-input"
            placeholder={t('age_placeholder')}
            min="1"
            max="120"
            value={data.age || ''}
            onChange={e => onChange('age', e.target.value)}
          />
        </div>

        <div className="form-group-friendly">
          <label>{t('sex_label')}</label>
          <select
            className="friendly-input"
            value={data.sex || ''}
            onChange={e => onChange('sex', e.target.value)}
          >
            <option value="">{t('sex_placeholder')}</option>
            {sexOptions.map(s => (
              <option key={s.val} value={s.val}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group-friendly">
          <label>{t('civil_status_label')}</label>
          <select
            className="friendly-input"
            value={data.civil_status || ''}
            onChange={e => onChange('civil_status', e.target.value)}
          >
            <option value="">{t('civil_placeholder')}</option>
            {civilOptions.map(s => (
              <option key={s.val} value={s.val}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group-friendly">
          <label>{t('contact_label')}</label>
          <input
            type="tel"
            className="friendly-input"
            placeholder={t('contact_placeholder')}
            value={data.contact_number || ''}
            onChange={handlePhone}
            maxLength={13}
          />
        </div>

        <div className="form-group-friendly full-width">
          <label>{t('address_home_label')}</label>
          <input
            type="text"
            className="friendly-input"
            placeholder={t('address_home_placeholder')}
            value={data.address || ''}
            onChange={e => onChange('address', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function ActiveForm({
  formData,
  onChange,
  onSave,
  onReset,
  onPrintCurrent,
  isEditing,
  isSubmitting = false,
  nextCaseId,
  onOpenQuickFill
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const { t } = useLanguage();

  const setNow = () => {
    const now = new Date();
    onChange('date_time_of_incident', new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const updateParty = (type, field, val) => onChange(type, { ...(formData[type] || {}), [field]: val });

  const complainantsList = (formData.complainants && formData.complainants.length > 0)
    ? formData.complainants
    : [formData.complainant || { full_name: '', age: '', sex: '', civil_status: '', address: '', contact_number: '' }];

  const addComplainant = () => {
    const nextList = [
      ...complainantsList,
      { full_name: '', age: '', sex: '', civil_status: '', address: '', contact_number: '' },
    ];
    onChange('complainants', nextList);
    onChange('complainant', nextList[0]);
  };

  const removeComplainant = (indexToRemove) => {
    if (complainantsList.length <= 1) return;
    const nextList = complainantsList.filter((_, i) => i !== indexToRemove);
    onChange('complainants', nextList);
    onChange('complainant', nextList[0]);
  };

  const updateComplainant = (index, field, val) => {
    const nextList = complainantsList.map((c, i) => (i === index ? { ...c, [field]: val } : c));
    onChange('complainants', nextList);
    onChange('complainant', nextList[0]);
  };

  const respondentsList = (formData.respondents && formData.respondents.length > 0)
    ? formData.respondents
    : [formData.respondent || { full_name: '', age: '', sex: '', civil_status: '', address: '', contact_number: '' }];

  const addRespondent = () => {
    const nextList = [
      ...respondentsList,
      { full_name: '', age: '', sex: '', civil_status: '', address: '', contact_number: '' },
    ];
    onChange('respondents', nextList);
    onChange('respondent', nextList[0]);
  };

  const removeRespondent = (indexToRemove) => {
    if (respondentsList.length <= 1) return;
    const nextList = respondentsList.filter((_, i) => i !== indexToRemove);
    onChange('respondents', nextList);
    onChange('respondent', nextList[0]);
  };

  const updateRespondent = (index, field, val) => {
    const nextList = respondentsList.map((r, i) => (i === index ? { ...r, [field]: val } : r));
    onChange('respondents', nextList);
    onChange('respondent', nextList[0]);
  };

  const addWitness = () => onChange('witnesses', [...(formData.witnesses || []), { full_name: '', address: '', contact_number: '' }]);
  const removeWitness = (i) => onChange('witnesses', formData.witnesses.filter((_, j) => j !== i));
  const updateWitness = (i, field, val) => {
    const arr = [...formData.witnesses];
    const newVal = field === 'contact_number' ? formatPHPhone(val) : val;
    arr[i] = { ...arr[i], [field]: newVal };
    onChange('witnesses', arr);
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.date_time_of_incident) errs.date_time_of_incident = 'Required';
    if (!formData.incident_type)          errs.incident_type = 'Required';
    if (!formData.purok)                  errs.purok = 'Required';
    return errs;
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }
      setFieldErrors({});
    }
    setCurrentStep(p => Math.min(2, p + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevStep = () => {
    setFieldErrors({});
    setCurrentStep(p => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveClick = () => {
    const errs = {};
    if (isEditing && !formData.narrative) errs.narrative = 'Required';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    onSave();
  };

  // Clear error on field change
  const handleChange = (field, value) => {
    onChange(field, value);
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const referredOptions = [
    { val: 'PNP (Pulisya)', label: t('referred_pnp') },
    { val: 'DSWD', label: t('referred_dswd') },
    { val: 'Ospital / Klinika', label: t('referred_hospital') },
    { val: 'Barangay Lupon / Court', label: t('referred_lupon') },
    { val: 'Municipal Court', label: t('referred_municipal') },
    { val: 'Iba pa (Others)', label: t('referred_others') },
  ];

  return (
    <div className="friendly-form-container">
      {/* Form Top Header */}
      <div className="friendly-form-header">
        <div className="form-header-badge">
          {isEditing
            ? `EDITING CASE: ${formData.caseId}`
            : `NEW BLOTTER — CASE NO. ${nextCaseId || '...'}`}
        </div>
        <p className="form-header-help">
          Follow the <b>2 Simple Steps</b> below to file a complaint.
        </p>

        {/* 2-Step Wizard Indicator Bar */}
        <div className="friendly-wizard-tracker">
          {[
            { step: 1, labelKey: 'step1_label' },
            { step: 2, labelKey: 'step2_label' },
          ].map(s => (
            <button
              key={s.step}
              type="button"
              className={`wizard-step-pill ${currentStep === s.step ? 'active' : currentStep > s.step ? 'completed' : ''}`}
              onClick={() => {
                if (s.step < currentStep || (formData.date_time_of_incident && formData.incident_type && formData.purok)) {
                  setCurrentStep(s.step);
                }
              }}
            >
              {t(s.labelKey)} {currentStep > s.step && '✓'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); handleSaveClick(); }} className="friendly-form-body">

        {/* ── STEP 1: INCIDENT INFO ── */}
        {currentStep === 1 && (
          <div className="form-section-card step-card">
            <div className="section-title-banner">
              <span className="section-num">1</span>
              <div>
                <h2>{t('step1_heading')}</h2>
                <p>{t('step1_sub')}</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group-friendly">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{t('case_id_label')}</span>
                  {!isEditing && (
                    <span className="case-id-preview-badge">{t('case_auto')}</span>
                  )}
                </label>
                <div className="case-id-display-wrapper">
                  <input
                    type="text"
                    className="friendly-input readonly-input highlight-case-id"
                    value={
                      isEditing
                        ? (formData.caseId || '—')
                        : (nextCaseId ? `${nextCaseId} (Auto)` : t('case_computing'))
                    }
                    readOnly
                  />
                </div>
              </div>

              <div className={`form-group-friendly ${fieldErrors.date_time_of_incident ? 'field-error' : ''}`}>
                <label>{t('date_time_label')}</label>
                <div className="input-with-button">
                  <input
                    type="datetime-local"
                    className={`friendly-input ${fieldErrors.date_time_of_incident ? 'input-error' : ''}`}
                    value={formData.date_time_of_incident || ''}
                    required
                    onChange={e => handleChange('date_time_of_incident', e.target.value)}
                  />
                  <button type="button" className="btn-now-shortcut" onClick={setNow}>
                    {t('now_btn')}
                  </button>
                </div>
                {fieldErrors.date_time_of_incident && (
                  <span className="field-error-msg">⚠ {t('date_time_label').replace(' *','')} is required</span>
                )}
              </div>
            </div>

            {/* Incident Type — plain input + Quick Fill hint */}
            <div className={`form-group-friendly full-width ${fieldErrors.incident_type ? 'field-error' : ''}`} style={{ marginTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{t('incident_type_label')}</span>
                {onOpenQuickFill && (
                  <button
                    type="button"
                    onClick={onOpenQuickFill}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '0',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                    }}
                  >
                    ⚡ Quick Fill Templates
                  </button>
                )}
              </label>

              {formData.incident_type ? (
                /* Selected Banner */
                <div className="preset-selected-banner">
                  <div className="preset-selected-left">
                    <span className="preset-selected-check">✓</span>
                    <div className="preset-selected-details">
                      <span className="preset-selected-caption">{t('incident_type_label')}</span>
                      <strong className="preset-selected-title">{formData.incident_type}</strong>
                    </div>
                  </div>
                  {onOpenQuickFill && (
                    <button
                      type="button"
                      className="btn-change-preset"
                      onClick={onOpenQuickFill}
                      title="Open Quick Fill Drawer"
                    >
                      Change
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  className={`friendly-input ${fieldErrors.incident_type ? 'input-error' : ''}`}
                  placeholder={t('incident_type_placeholder')}
                  value={formData.incident_type || ''}
                  onChange={e => handleChange('incident_type', e.target.value)}
                />
              )}

              {fieldErrors.incident_type && (
                <span className="field-error-msg">⚠ {t('incident_type_label').replace(' *', '')} is required</span>
              )}
            </div>

            <div className="form-grid-2" style={{ marginTop: 14 }}>
              <div className={`form-group-friendly ${fieldErrors.purok ? 'field-error' : ''}`}>
                <label>{t('purok_label')}</label>
                <select
                  className={`friendly-input ${fieldErrors.purok ? 'input-error' : ''}`}
                  value={formData.purok || ''}
                  required
                  onChange={e => handleChange('purok', e.target.value)}
                >
                  <option value="">{t('purok_placeholder')}</option>
                  {STREETS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {fieldErrors.purok && (
                  <span className="field-error-msg">⚠ Street is required</span>
                )}
              </div>

              <div className="form-group-friendly">
                <label>{t('address_label')}</label>
                <input
                  type="text"
                  className="friendly-input"
                  placeholder={t('address_placeholder')}
                  value={formData.street_address || ''}
                  onChange={e => onChange('street_address', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-friendly full-width" style={{ marginTop: 16 }}>
              <label>{t('severity_label')}</label>
              <div className="friendly-severity-selector">
                {[
                  ['high',   t('sev_high'),   '#dc2626'],
                  ['medium', t('sev_medium'),  '#d97706'],
                  ['low',    t('sev_low'),     '#10b981'],
                ].map(([val, lbl, color]) => (
                  <button
                    key={val}
                    type="button"
                    className={`severity-option-btn ${formData.severity === val ? 'active' : ''}`}
                    style={{ '--btn-color': color }}
                    onClick={() => onChange('severity', val)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Referred To & Officer — moved to step 1 for compact 2-step flow */}
            <div className="form-grid-2" style={{ marginTop: 14 }}>
              <div className="form-group-friendly">
                <label>{t('officer_label')}</label>
                <input
                  type="text"
                  className="friendly-input"
                  placeholder={t('officer_placeholder')}
                  value={formData.officer_on_duty || ''}
                  onChange={e => onChange('officer_on_duty', e.target.value)}
                />
              </div>

              <div className="form-group-friendly">
                <label>{t('referred_to_label')}</label>
                <select
                  className="friendly-input"
                  value={formData.referred_to || ''}
                  onChange={e => onChange('referred_to', e.target.value)}
                >
                  <option value="">{t('referred_placeholder')}</option>
                  {referredOptions.map(r => (
                    <option key={r.val} value={r.val}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="form-group-friendly full-width" style={{ marginTop: 16 }}>
              <label>{t('status_label')}</label>
              <div className="friendly-status-selector">
                {[
                  ['pending',  t('status_pending')],
                  ['active',   t('status_active')],
                  ['resolved', t('status_resolved')],
                  ['referred', t('status_referred')],
                ].map(([s, lbl]) => (
                  <button
                    key={s}
                    type="button"
                    className={`status-choice-btn ${s} ${formData.status === s ? 'selected' : ''}`}
                    onClick={() => onChange('status', s)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1 Navigation */}
            <div className="step-navigation-bar">
              <button type="button" className="btn-friendly-cancel" onClick={onReset}>
                {t('clear_btn')}
              </button>
              <button type="button" className="btn-step-next" onClick={goToNextStep}>
                {t('next_step')}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: PEOPLE INVOLVED ── */}
        {currentStep === 2 && (
          <div className="form-section-card step-card">
            <div className="section-title-banner">
              <span className="section-num">2</span>
              <div>
                <h2>{t('step2_heading')}</h2>
                <p>{t('step2_sub')}</p>
              </div>
            </div>

            <div className="parties-stacked-layout">
              {/* Multiple Complainants */}
              <div className="complainants-group-block" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {complainantsList.map((comp, idx) => (
                  <PartyBlock
                    key={idx}
                    title={
                      complainantsList.length > 1
                        ? `${t('complainant_title')} #${idx + 1}`
                        : t('complainant_title')
                    }
                    subtitle={
                      idx === 0
                        ? t('complainant_sub')
                        : (t('additional_complainant_sub') || `Karagdagang nagsumbong #${idx + 1} / Additional complainant #${idx + 1}`)
                    }
                    color="#10b981"
                    data={comp}
                    onChange={(f, v) => updateComplainant(idx, f, v)}
                    onRemove={idx > 0 ? () => removeComplainant(idx) : null}
                    removeLabel={t('remove_complainant_btn') || `Remove Complainant #${idx + 1}`}
                    errors={{}}
                    t={t}
                  />
                ))}

                {/* + Add Complainant Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2px' }}>
                  <button
                    type="button"
                    className="btn-add-complainant"
                    onClick={addComplainant}
                    style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1.5px dashed #34d399',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 2px rgba(16,185,129,0.06)',
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: '1', fontWeight: 900 }}>+</span>
                    <span>{t('add_complainant_btn') || '+ Add Complainant'}</span>
                  </button>
                </div>
              </div>

              {/* Multiple Respondents */}
              <div className="respondents-group-block" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {respondentsList.map((resp, idx) => (
                  <PartyBlock
                    key={idx}
                    title={
                      respondentsList.length > 1
                        ? `${t('respondent_title')} #${idx + 1}`
                        : t('respondent_title')
                    }
                    subtitle={
                      idx === 0
                        ? t('respondent_sub')
                        : (t('additional_respondent_sub') || `Karagdagang inirereklamo #${idx + 1} / Additional respondent #${idx + 1}`)
                    }
                    color="#ef4444"
                    data={resp}
                    onChange={(f, v) => updateRespondent(idx, f, v)}
                    onRemove={idx > 0 ? () => removeRespondent(idx) : null}
                    removeLabel={t('remove_respondent_btn') || `Remove Respondent #${idx + 1}`}
                    errors={{}}
                    t={t}
                  />
                ))}

                {/* + Add Respondent Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2px' }}>
                  <button
                    type="button"
                    className="btn-add-respondent"
                    onClick={addRespondent}
                    style={{
                      background: '#fff5f5',
                      color: '#dc2626',
                      border: '1.5px dashed #f87171',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 2px rgba(220,38,38,0.06)',
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: '1', fontWeight: 900 }}>+</span>
                    <span>{t('add_respondent_btn') || '+ Add Respondent'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Witnesses */}
            <div className="witnesses-block" style={{ marginTop: 18 }}>
              <div className="witnesses-header-flex">
                <div>
                  <h3>{t('witnesses_title')}</h3>
                  <p>{t('witnesses_sub')}</p>
                </div>
                <button type="button" className="btn-add-witness" onClick={addWitness}>
                  {t('add_witness')}
                </button>
              </div>

              {(formData.witnesses || []).map((w, i) => (
                <div key={i} className="witness-item-row">
                  <span className="witness-number">#{i + 1}</span>
                  <input
                    type="text"
                    className="friendly-input"
                    placeholder={t('witness_name_placeholder')}
                    value={w.full_name || ''}
                    onChange={e => updateWitness(i, 'full_name', e.target.value)}
                  />
                  <input
                    type="text"
                    className="friendly-input"
                    placeholder={t('witness_address_placeholder')}
                    value={w.address || ''}
                    onChange={e => updateWitness(i, 'address', e.target.value)}
                  />
                  <input
                    type="tel"
                    className="friendly-input"
                    placeholder={t('witness_phone_placeholder')}
                    value={w.contact_number || ''}
                    onChange={e => updateWitness(i, 'contact_number', e.target.value)}
                    maxLength={13}
                  />
                  <button type="button" className="btn-remove-witness" onClick={() => removeWitness(i)} title="Remove">
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Narrative in Step 2 for editing context */}
            {isEditing && (
              <div className="form-group-friendly full-width" style={{ marginTop: 18 }}>
                <label>{t('narrative_label')}</label>
                <textarea
                  className={`friendly-textarea ${fieldErrors.narrative ? 'input-error' : ''}`}
                  rows={5}
                  placeholder="Isulat dito ang buong kwento: Sino, Ano, Saan, Kailan, at Paano nangyari..."
                  value={formData.narrative || ''}
                  onChange={e => { onChange('narrative', e.target.value); if (fieldErrors.narrative) setFieldErrors(p => { const n = {...p}; delete n.narrative; return n; }); }}
                />
                {fieldErrors.narrative && <span className="field-error-msg">⚠ Narrative/Statement is required</span>}
              </div>
            )}

            {/* Non-edit narrative is hidden per user request */}
            {/* Action Taken */}
            <div className="form-group-friendly full-width" style={{ marginTop: 14 }}>
              <label>{t('action_taken_label')}</label>
              <textarea
                className="friendly-textarea"
                rows={3}
                placeholder="Mga ginawa ng desk officer, patawag sa Lupon, o kasunduan na napagkayarian..."
                value={formData.action_taken || ''}
                onChange={e => onChange('action_taken', e.target.value)}
              />
            </div>

            {/* Step 2 Navigation */}
            <div className="step-navigation-bar">
              <button type="button" className="btn-step-prev" onClick={goToPrevStep}>
                {t('prev_step')}
              </button>

              {isEditing && (
                <button type="button" className="btn-friendly-print" onClick={onPrintCurrent}>
                  {t('print_btn')}
                </button>
              )}

              <button type="submit" className="btn-friendly-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (isEditing ? t('update_btn') : t('save_btn'))}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
