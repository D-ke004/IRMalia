import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ActiveForm from '../components/ActiveForm';
import QuickFillSidebar from '../components/QuickFillSidebar';
import PrintableBlotter from '../components/PrintableBlotter';
import { getIncident, createIncident, updateIncident, getNextCaseId } from '../utils/api';

const defaultParty = () => ({ full_name: '', age: '', sex: '', civil_status: '', address: '', contact_number: '' });

const emptyForm = () => ({
  id: null,
  caseId: '',
  date_time_of_incident: '',
  incident_type: '',
  purok: '',
  street_address: '',
  severity: 'medium',
  status: 'pending',
  narrative: '',
  action_taken: '',
  referred_to: '',
  officer_on_duty: '',
  complainants: [defaultParty()],
  complainant: defaultParty(),
  respondents: [defaultParty()],
  respondent: defaultParty(),
  witnesses: [],
});

export default function BlotterPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState(emptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printIncident, setPrintIncident] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [nextCaseId, setNextCaseId] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addToast = useCallback((msg, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchNextCaseId = useCallback(async () => {
    try {
      const res = await getNextCaseId();
      if (res.data?.next_case_id) {
        setNextCaseId(res.data.next_case_id);
      }
    } catch {
      // silently fallback
    }
  }, []);

  const loadIncidentForEdit = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await getIncident(id);
      const inc = res.data;
      if (inc) {
        const partyComplainants = inc.parties?.filter(p => p.party_type === 'complainant') || [];
        const complainants = partyComplainants.length > 0
          ? partyComplainants.map(c => ({
              full_name: c.full_name || '',
              age: c.age || '',
              sex: c.sex || '',
              civil_status: c.civil_status || '',
              address: c.address || '',
              contact_number: c.contact_number || '',
            }))
          : (Array.isArray(inc.complainants) && inc.complainants.length > 0
              ? inc.complainants
              : [inc.complainant || defaultParty()]);

        const partyRespondents = inc.parties?.filter(p => p.party_type === 'respondent') || [];
        const respondents = partyRespondents.length > 0
          ? partyRespondents.map(r => ({
              full_name: r.full_name || '',
              age: r.age || '',
              sex: r.sex || '',
              civil_status: r.civil_status || '',
              address: r.address || '',
              contact_number: r.contact_number || '',
            }))
          : (Array.isArray(inc.respondents) && inc.respondents.length > 0
              ? inc.respondents
              : [inc.respondent || defaultParty()]);

        setFormData({
          id: inc.id,
          caseId: inc.case_id,
          date_time_of_incident: inc.date_time_of_incident?.slice(0, 16) || '',
          incident_type: inc.incident_type || '',
          purok: inc.purok || '',
          street_address: inc.street_address || '',
          severity: inc.severity || 'medium',
          status: inc.status || 'pending',
          narrative: inc.narrative || '',
          action_taken: inc.action_taken || '',
          referred_to: inc.referred_to || '',
          officer_on_duty: inc.officer_on_duty || user?.full_name || '',
          complainants: complainants.length > 0 ? complainants : [defaultParty()],
          complainant: complainants[0] || defaultParty(),
          respondents: respondents.length > 0 ? respondents : [defaultParty()],
          respondent: respondents[0] || defaultParty(),
          witnesses: inc.witnesses || [],
        });
        setIsEditing(true);
        addToast(`Case ${inc.case_id} loaded for editing`, 'info');
      }
    } catch {
      addToast(t('save_failed'), 'danger');
    } finally {
      setLoading(false);
    }
  }, [user, addToast, t]);

  useEffect(() => {
    if (location.state?.incident) {
      const inc = location.state.incident;
      const partyComplainants = inc.parties?.filter(p => p.party_type === 'complainant') || [];
      const complainants = partyComplainants.length > 0
        ? partyComplainants.map(c => ({
            full_name: c.full_name || '',
            age: c.age || '',
            sex: c.sex || '',
            civil_status: c.civil_status || '',
            address: c.address || '',
            contact_number: c.contact_number || '',
          }))
        : (Array.isArray(inc.complainants) && inc.complainants.length > 0
            ? inc.complainants
            : [inc.complainant || defaultParty()]);

      const partyRespondents = inc.parties?.filter(p => p.party_type === 'respondent') || [];
      const respondents = partyRespondents.length > 0
        ? partyRespondents.map(r => ({
            full_name: r.full_name || '',
            age: r.age || '',
            sex: r.sex || '',
            civil_status: r.civil_status || '',
            address: r.address || '',
            contact_number: r.contact_number || '',
          }))
        : (Array.isArray(inc.respondents) && inc.respondents.length > 0
            ? inc.respondents
            : [inc.respondent || defaultParty()]);

      setFormData({
        id: inc.id,
        caseId: inc.case_id,
        date_time_of_incident: inc.date_time_of_incident?.slice(0, 16) || '',
        incident_type: inc.incident_type || '',
        purok: inc.purok || '',
        street_address: inc.street_address || '',
        severity: inc.severity || 'medium',
        status: inc.status || 'pending',
        narrative: inc.narrative || '',
        action_taken: inc.action_taken || '',
        referred_to: inc.referred_to || '',
        officer_on_duty: inc.officer_on_duty || user?.full_name || '',
        complainants: complainants.length > 0 ? complainants : [defaultParty()],
        complainant: complainants[0] || defaultParty(),
        respondents: respondents.length > 0 ? respondents : [defaultParty()],
        respondent: respondents[0] || defaultParty(),
        witnesses: inc.witnesses || [],
      });
      setIsEditing(true);
    } else if (editId) {
      loadIncidentForEdit(editId);
    } else {
      setFormData(p => ({ ...emptyForm(), officer_on_duty: user?.full_name || '' }));
      setIsEditing(false);
      fetchNextCaseId();
    }
  }, [editId, location.state, user, loadIncidentForEdit, fetchNextCaseId]);

  useEffect(() => {
    if (location.state?.template) {
      const tpl = location.state.template;
      handleSelectTemplate(tpl);
    }
  }, []);

  const handleFormChange = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  const handleSelectTemplate = (tpl) => {
    setActiveTemplateId(tpl.id);
    const nowIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      date_time_of_incident: prev.date_time_of_incident || nowIso,
      incident_type: tpl.incident_type || tpl.label,
      severity: tpl.severity,
      status: tpl.status || prev.status,
      narrative: tpl.narrative,
      action_taken: tpl.action_taken,
    }));
    setDrawerOpen(false);
    addToast(`${t('template_applied')} "${tpl.label}"!`, 'info');
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    const f = formData;
    if (!f.date_time_of_incident || !f.incident_type || !f.purok || (isEditing && !f.narrative)) {
      addToast(t('toast_fill_required'), 'danger');
      return;
    }
    if (!isEditing && !f.narrative) {
      f.narrative = "Statement to be updated via incident list edit action.";
    }
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateIncident({ ...f, id: f.id });
        addToast(`${t('case_updated')} (${f.caseId})`, 'success');
      } else {
        const r = await createIncident(f);
        addToast(`${t('case_saved')} ${r.data.case_id}`, 'success');
      }
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      addToast(err.response?.data?.error || t('save_failed'), 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...emptyForm(), officer_on_duty: user?.full_name || '' });
    setIsEditing(false);
    setActiveTemplateId(null);
    fetchNextCaseId();
    if (editId) setSearchParams({});
  };

  const triggerPrint = (inc) => {
    setPrintIncident(inc);
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="blotter-page-container">
      <div className="page-header flex-header">
        <div>
          <h1>
            {isEditing
              ? `${t('blotter_edit_title')} (${formData.caseId})`
              : t('blotter_new_title')}
          </h1>
          <p>{t('blotter_subtitle')}</p>
        </div>
        <div className="header-actions">
          {!isEditing && (
            <button
              className="btn-show-quickfill"
              onClick={() => setDrawerOpen(true)}
              type="button"
              style={{ background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>{t('quick_file_title')}</span>
            </button>
          )}
          <button
            className="btn-friendly-back"
            onClick={() => navigate('/')}
            type="button"
          >
            {t('back_home')}
          </button>
        </div>
      </div>

      <div className="blotter-layout-container full-width">
        {/* Main Center Form */}
        <div className="blotter-form-wrapper expanded">
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <ActiveForm
              formData={formData}
              onChange={handleFormChange}
              onSave={handleSave}
              onReset={handleReset}
              onPrintCurrent={() => triggerPrint(formData)}
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              nextCaseId={nextCaseId}
              onOpenQuickFill={() => setDrawerOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Quick Fill Drawer Menu */}
      <QuickFillSidebar
        isOpen={drawerOpen}
        onSelectTemplate={handleSelectTemplate}
        activeTemplateId={activeTemplateId}
        nextCaseId={nextCaseId}
        onClose={() => setDrawerOpen(false)}
      />

      <PrintableBlotter incident={printIncident} />

      {/* Toast HUD */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', marginRight: 6 }}>
              {t.type === 'success' && '✓'}{t.type === 'info' && 'ℹ'}{t.type === 'danger' && '⚠️'}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

