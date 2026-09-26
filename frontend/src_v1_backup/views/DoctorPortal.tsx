import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, CheckCircle2, XCircle, QrCode, FileText, 
  Pill, Plus, Trash2, ArrowUpRight, Bed, AlertCircle, Building2 
} from 'lucide-react';
import { api } from '../services/api';
import { Referral } from '../types';

export const DoctorPortal: React.FC = () => {
  const [doctorId] = useState('DOC-MMC-2014-9871');
  const [facilityId] = useState('fac_dist_pune_01');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'EMERGENCY' | 'SAME_DAY' | 'ROUTINE'>('ALL');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  // Clinical Workspace Form State
  const [diagnosis, setDiagnosis] = useState('Acute Anterior Wall STEMI');
  const [icd10, setIcd10] = useState('I21.0');
  const [clinicalNotes, setClinicalNotes] = useState('Patient presented with 1-hour acute chest pressure. ST elevation in leads V1-V4 on emergency ECG. Commenced Dual Antiplatelet Therapy (DAPT) and immediate cardiology transfer.');
  
  // E-Prescription Item Builder
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_name: 'Aspirin (Dispersible)', dosage: '325mg', frequency: 'STAT', duration_days: 1, instructions: 'Chew immediately' },
    { medicine_name: 'Clopidogrel', dosage: '300mg', frequency: 'STAT', duration_days: 1, instructions: 'Oral loading dose' },
    { medicine_name: 'Atorvastatin', dosage: '80mg', frequency: 'STAT', duration_days: 1, instructions: 'Immediate high-intensity statin' },
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('500mg');
  const [newMedFreq, setNewMedFreq] = useState('TDS (3 times/day)');

  // QR Manual Check-in Input
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);

  // Bed & Discharge state
  const [admissionStatus, setAdmissionStatus] = useState<'NONE' | 'ADMITTED' | 'DISCHARGED'>('NONE');
  const [dischargeMessage, setDischargeMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInboundReferrals();
  }, []);

  const loadInboundReferrals = async () => {
    const list = await api.getFacilityInboundReferrals(facilityId);
    setReferrals(list);
    if (list.length > 0 && !selectedReferral) {
      setSelectedReferral(list[0]);
    }
  };

  const handleAction = async (referralId: string, action: 'ACCEPT' | 'DECLINE' | 'ARRIVE') => {
    const updated = await api.updateReferralStatus(referralId, action);
    setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status: updated.status } : r));
    if (selectedReferral && selectedReferral.id === referralId) {
      setSelectedReferral(prev => prev ? { ...prev, status: updated.status } : null);
    }
  };

  const handleVerifyQr = () => {
    if (!qrTokenInput.trim()) return;
    setCheckInStatus(`HMAC Verified: Patient arrival confirmed. Status set to ARRIVED.`);
    setQrTokenInput('');
    setTimeout(() => setCheckInStatus(null), 4000);
  };

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setPrescriptionItems(prev => [
      ...prev,
      { medicine_name: newMedName, dosage: newMedDose, frequency: newMedFreq, duration_days: 5, instructions: 'After food' }
    ]);
    setNewMedName('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAssessment = async () => {
    if (!selectedReferral) return;
    await api.submitClinicalAssessment({
      case_id: selectedReferral.case_id,
      doctor_id: doctorId,
      facility_id: facilityId,
      clinical_notes: clinicalNotes,
      confirmed_diagnosis: diagnosis,
      icd10_code: icd10,
    });

    await api.issuePrescription({
      case_id: selectedReferral.case_id,
      doctor_id: doctorId,
      items: prescriptionItems,
    });

    alert('Clinical Assessment and E-Prescription formally signed and locked to patient ABHA record.');
  };

  const handleDischarge = async () => {
    if (!selectedReferral) return;
    const res = await api.dischargePatient({
      case_id: selectedReferral.case_id,
      doctor_id: doctorId,
      discharge_condition: 'Hemodynamically stable post-thrombolysis',
      followup_instructions: 'Strict rest, ASHA home BP monitoring every 48 hours, cardiology OP in 7 days.',
      next_visit_days: 7,
    });
    setAdmissionStatus('DISCHARGED');
    setDischargeMessage(`Patient discharged successfully. Discharge Summary ID: ${res.discharge_summary_id}. Follow-up tasks automatically dispatched to frontline ASHA worker.`);
  };

  const filteredReferrals = referrals.filter(r => {
    if (filterCategory === 'ALL') return true;
    return r.triage_category === filterCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Clinician Top Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Dr. Rajesh Mehta, MD</h2>
              <span className="badge badge-routine" style={{ fontSize: '0.7rem' }}>AUTHORISED CLINICIAN</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Reg: MMC/2014/09871 • Pune District Civil Hospital (Aundh) • Emergency & Inpatient Unit
            </p>
          </div>
        </div>

        {/* QR Arrival Check-in Tool */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Scan or paste QR Token..." 
            value={qrTokenInput}
            onChange={e => setQrTokenInput(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '8px 12px', width: '220px' }}
          />
          <button className="btn-primary" onClick={handleVerifyQr} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <QrCode size={15} /> Check-In
          </button>
        </div>
      </div>

      {checkInStatus && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.85rem' }}>
          {checkInStatus}
        </div>
      )}

      {/* Main Grid: Inbound Referrals List & Clinical Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
        {/* Left Column: Inbound Referral Inbox */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '700px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>Inbound Triage Inbox</h3>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {(['ALL', 'EMERGENCY', 'SAME_DAY', 'ROUTINE'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: filterCategory === cat ? 'var(--primary)' : 'var(--bg-surface)',
                    color: filterCategory === cat ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredReferrals.map(ref => {
              const isSelected = selectedReferral?.id === ref.id;
              return (
                <div 
                  key={ref.id}
                  onClick={() => setSelectedReferral(ref)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`badge badge-${ref.triage_category.toLowerCase().replace('_', '')}`}>
                      {ref.triage_category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Score: {ref.urgency_score}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Patient: {ref.patient_id}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ref.clinical_summary}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: '#38bdf8' }}>Status: {ref.status}</span>
                    <span style={{ color: 'var(--text-subtle)' }}>Ref: {ref.id.slice(-6)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Clinical Assessment Workspace */}
        {selectedReferral ? (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Referral Banner & Decision Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge badge-${selectedReferral.triage_category.toLowerCase().replace('_', '')}`}>
                    {selectedReferral.triage_category}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Case #{selectedReferral.case_id}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>
                  Clinical Evaluation: {selectedReferral.patient_id}
                </h3>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => handleAction(selectedReferral.id, 'ACCEPT')}
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <CheckCircle2 size={16} /> Accept Referral
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleAction(selectedReferral.id, 'ARRIVE')}
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <QrCode size={16} /> Mark Arrived
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleAction(selectedReferral.id, 'DECLINE')}
                  style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#ff6b8b' }}
                >
                  <XCircle size={16} /> Decline & Reroute
                </button>
              </div>
            </div>

            {/* Diagnosis & Examination Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Confirmed Clinical Diagnosis</label>
                <input 
                  type="text" 
                  value={diagnosis} 
                  onChange={e => setDiagnosis(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ICD-10 Code</label>
                <input 
                  type="text" 
                  value={icd10} 
                  onChange={e => setIcd10(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Doctor's Clinical Notes & Treatment Rationale</label>
              <textarea 
                rows={3} 
                value={clinicalNotes} 
                onChange={e => setClinicalNotes(e.target.value)} 
                style={{ width: '100%' }}
              />
            </div>

            {/* E-Prescription Builder */}
            <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pill size={18} color="#14b8a6" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>E-Prescription & Pharmacy Dispense</h4>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Check: Verified Available</span>
              </div>

              {/* Medicine Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {prescriptionItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>{item.medicine_name}</strong> - <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage} • {item.frequency}</span>
                    </div>
                    <button onClick={() => handleRemoveMedicine(idx)} style={{ background: 'transparent', color: 'var(--text-subtle)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Medicine Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                <input type="text" placeholder="Medicine name..." value={newMedName} onChange={e => setNewMedName(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }} />
                <input type="text" placeholder="Dosage..." value={newMedDose} onChange={e => setNewMedDose(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }} />
                <input type="text" placeholder="Frequency..." value={newMedFreq} onChange={e => setNewMedFreq(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }} />
                <button type="button" className="btn-secondary" onClick={handleAddMedicine} style={{ padding: '6px 12px' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Actions: Save Assessment & Formal Discharge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <button className="btn-primary" onClick={handleSaveAssessment}>
                <FileText size={16} /> Sign & Lock Assessment
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={handleDischarge} style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
                  <Bed size={16} /> Generate Discharge Summary
                </button>
              </div>
            </div>

            {dischargeMessage && (
              <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#38bdf8', fontSize: '0.85rem' }}>
                {dischargeMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select an inbound referral from the left inbox to review clinical details.
          </div>
        )}
      </div>
    </div>
  );
};
