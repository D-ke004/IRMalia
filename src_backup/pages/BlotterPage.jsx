import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActiveForm from '../components/ActiveForm';
import ShortcutsDrawer from '../components/ShortcutsDrawer';
import PrintableBlotter from '../components/PrintableBlotter';
import { getIncident, createIncident, updateIncident } from '../utils/api';

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
  complainant: { full_name: '', age: '', sex: '', civil_status: '', address: '', contact_number: '' },
  respondent: { full_name: '', age: '', sex: '', civil_status: '', address: '', contact_number: '' },
  witnesses: [],
});

export default function BlotterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState(emptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [printIncident, setPrintIncident] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const addToast = useCallback((msg, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const loadIncidentForEdit = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await getIncident(id);
      const inc = res.data;
      if (inc) {
        const complainant = inc.parties?.find(p => p.party_type === 'complainant') || {};
        const respondent = inc.parties?.find(p => p.party_type === 'respondent') || {};
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
          complainant: {
            full_name: complainant.full_name || '',
            age: complainant.age || '',
            sex: complainant.sex || '',
            civil_status: complainant.civil_status || '',
            address: complainant.address || '',
            contact_number: complainant.contact_number || '',
          },
          respondent: {
            full_name: respondent.full_name || '',
            age: respondent.age || '',
            sex: respondent.sex || '',
            civil_status: respondent.civil_status || '',
            address: respondent.address || '',
            contact_number: respondent.contact_number || '',
          },
          witnesses: inc.witnesses || [],
        });
        setIsEditing(true);
        addToast(`Loaded Case ${inc.case_id} for editing`, 'info');
      }
    } catch {
      addToast('Failed to load incident details.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (location.state?.incident) {
      const inc = location.state.incident;
      const complainant = inc.parties?.find(p => p.party_type === 'complainant') || {};
      const respondent = inc.parties?.find(p => p.party_type === 'respondent') || {};
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
        complainant: {
          full_name: complainant.full_name || '',
          age: complainant.age || '',
          sex: complainant.sex || '',
          civil_status: complainant.civil_status || '',
          address: complainant.address || '',
          contact_number: complainant.contact_number || '',
        },
        respondent: {
          full_name: respondent.full_name || '',
          age: respondent.age || '',
          sex: respondent.sex || '',
          civil_status: respondent.civil_status || '',
          address: respondent.address || '',
          contact_number: respondent.contact_number || '',
        },
        witnesses: inc.witnesses || [],
      });
      setIsEditing(true);
    } else if (editId) {
      loadIncidentForEdit(editId);
    } else {
      setFormData(p => ({ ...emptyForm(), officer_on_duty: user?.full_name || '' }));
      setIsEditing(false);
    }
  }, [editId, location.state, user, loadIncidentForEdit]);

  const handleFormChange = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  const handleShortcutSelect = (field, value) => {
    handleFormChange(field, value);
    setShowShortcuts(false);
  };

  const handleSave = async () => {
    const f = formData;
    if (!f.date_time_of_incident || !f.incident_type || !f.purok || !f.narrative) {
      addToast('Please fill all required fields (Date, Type, Purok, Narrative).', 'danger');
      return;
    }
    try {
      if (isEditing) {
        await updateIncident({ ...f, id: f.id });
        addToast(`Case ${f.caseId} updated successfully.`, 'success');
      } else {
        const r = await createIncident(f);
        addToast(`Blotter ${r.data.case_id} filed successfully.`, 'success');
      }
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      addToast(err.response?.data?.error || 'Save failed.', 'danger');
    }
  };

  const handleReset = () => {
    setFormData({ ...emptyForm(), officer_on_duty: user?.full_name || '' });
    setIsEditing(false);
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
          <h1>{isEditing ? `✏️ Edit Blotter Report (${formData.caseId})` : '📋 New Blotter Report'}</h1>
          <p>Complete official incident documentation and party details</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn btn-secondary ${showShortcuts ? 'active' : ''}`}
            onClick={() => setShowShortcuts(p => !p)}
            type="button"
          >
            ⚡ {showShortcuts ? 'Hide Shortcuts' : 'Incident Shortcuts'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/')}
            type="button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <ShortcutsDrawer
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        activeType={formData.incident_type}
        onSelectType={v => handleShortcutSelect('incident_type', v)}
        activePurok={formData.purok}
        onSelectPurok={v => handleShortcutSelect('purok', v)}
        activeSeverity={formData.severity}
        onSelectSeverity={v => handleShortcutSelect('severity', v)}
      />

      <div className="blotter-form-wrapper">
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
          />
        )}
      </div>

      <PrintableBlotter incident={printIncident} />

      {/* Toast HUD */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ fontWeight: 800, fontSize: '0.7rem', marginRight: 4 }}>
              {t.type === 'success' && '✓'}{t.type === 'info' && 'ℹ'}{t.type === 'danger' && '⚠'}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
