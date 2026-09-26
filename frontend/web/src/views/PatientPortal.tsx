import React, { useState } from 'react';
import { 
  Send, QrCode, AlertTriangle, ShieldCheck, Pill, 
  Calendar, CheckCircle, Clock, MapPin, Sparkles, Phone 
} from 'lucide-react';
import { api } from '../services/api';
import { StructuredIntake, SafetyAssessment, Referral, IntakeMessage } from '../types';
import { QRCodeModal } from '../components/QRCodeModal';

export const PatientPortal: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  // Intake Chat State
  const [chatMessages, setChatMessages] = useState<IntakeMessage[]>([
    {
      id: 'msg_1',
      sender: 'AI',
      text: 'Namaste Ramesh ji. How are you feeling today? Please describe your health symptoms, fever, or pain in your own words.',
      timestamp: '10:00 AM',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Medical State
  const [activeIntake, setActiveIntake] = useState<StructuredIntake | null>({
    id: 'intake_pat_882',
    case_id: 'case_pune_882',
    raw_transcript: 'Crushing chest pain radiating to left arm and neck with cold sweating since 1 hour.',
    detected_language: 'en',
    structured_symptoms: {
      chief_complaint: 'Crushing chest pain radiating to left arm',
      duration_days: 0.1,
      severity_score: 95,
      associated_symptoms: ['Left Arm Radiation', 'Cold Sweats', 'Shortness of Breath'],
      is_fever_present: false,
      is_chest_pain_present: true,
      is_dyspnea_present: true,
    },
    vitals: { systolic_bp: 158, diastolic_bp: 98, heart_rate: 112, spo2_percent: 92 },
    is_ai_generated: true,
    created_at: new Date().toISOString(),
  });

  const [activeSafety, setActiveSafety] = useState<SafetyAssessment | null>({
    id: 'safe_pat_882',
    intake_id: 'intake_pat_882',
    case_id: 'case_pune_882',
    category: 'EMERGENCY',
    urgency_score: 95,
    red_flags_detected: ['Suspected Acute Coronary Syndrome (ACS)', 'Diaphoresis', 'Tachycardia'],
    matched_protocol_code: 'PROTO-ACS-001',
    recommended_facility_tier: 'DISTRICT_HOSPITAL',
    requires_immediate_ambulance: true,
    assessed_at: new Date().toISOString(),
  });

  const [activeReferral, setActiveReferral] = useState<Referral | null>({
    id: 'ref_pat_882',
    case_id: 'case_pune_882',
    patient_id: 'pat_ramesh_k',
    originating_facility_id: 'fac_phc_haveli',
    target_facility_id: 'fac_dist_pune_01',
    target_facility_name: 'Pune District Civil Hospital (Aundh)',
    triage_category: 'EMERGENCY',
    urgency_score: 95,
    status: 'IN_TRANSIT',
    clinical_summary: 'Acute Coronary Syndrome suspected. Severe retrosternal chest pain with left arm radiation. High urgency priority care.',
    hmac_qr_token: 'HMAC_SIG_REF_pune_882_VERIFIED_AUTHENTIC',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
  });

  // Prescriptions List
  const [medicines, setMedicines] = useState([
    { id: '1', name: 'Aspirin 75mg', timing: 'Morning after food', taken: true },
    { id: '2', name: 'Clopidogrel 75mg', timing: 'Night after food', taken: false },
    { id: '3', name: 'Atorvastatin 40mg', timing: 'Night before sleep', taken: false },
    { id: '4', name: 'Metoprolol 25mg', timing: 'Morning & Evening', taken: true },
  ]);

  const toggleMedicine = (id: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isSubmitting) return;

    const userText = inputPrompt;
    setInputPrompt('');
    setIsSubmitting(true);

    const userMsg: IntakeMessage = {
      id: 'msg_' + Date.now(),
      sender: 'PATIENT',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const result = await api.submitIntake({
        case_id: 'case_pune_882',
        raw_transcript: userText,
        detected_language: 'en',
        chief_complaint: userText.slice(0, 45),
        vitals: { systolic_bp: 130, diastolic_bp: 85, heart_rate: 82, spo2_percent: 98 },
      });

      setActiveIntake(result.intake);
      setActiveSafety(result.safety);

      // AI Response message
      const aiReply: IntakeMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'AI',
        text: result.safety.category === 'EMERGENCY'
          ? '🚨 CRITICAL: Your symptoms indicate an urgent medical situation. An emergency referral has been generated, and 108 ambulance coordination is initiated. Please click on the QR Code below upon arriving at the hospital.'
          : 'Thank you. Your symptoms have been structured and forwarded to your assigned health centre for timely evaluation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, aiReply]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Patient Header Card */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
            RK
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Ramesh Kulkarni</h2>
              <span className="badge badge-routine" style={{ fontSize: '0.7rem' }}>ABHA VERIFIED</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              54 Yrs • Male • ABHA ID: 9821-4321-0091 • Village Shindewadi, Pune
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeReferral && (
            <button 
              className="btn-primary"
              onClick={() => setShowQrModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <QrCode size={18} /> View Arrival QR
            </button>
          )}
          <a href="tel:108" className="btn-emergency">
            <Phone size={16} /> Call 108
          </a>
        </div>
      </div>

      {/* Active Medical Triage Alert */}
      {activeSafety && (
        <div style={{
          background: activeSafety.category === 'EMERGENCY' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `1px solid ${activeSafety.category === 'EMERGENCY' ? 'rgba(225, 29, 72, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '12px',
              background: activeSafety.category === 'EMERGENCY' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: activeSafety.category === 'EMERGENCY' ? '#ff6b8b' : '#fbbf24',
            }}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className={`badge badge-${activeSafety.category.toLowerCase().replace('_', '')}`}>
                  {activeSafety.category} TRIAGE
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Protocol: {activeSafety.matched_protocol_code}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {activeSafety.red_flags_detected.length > 0 
                  ? activeSafety.red_flags_detected.join(' • ')
                  : 'Symptom Assessment Complete'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Target Destination: {activeReferral?.target_facility_name || 'District Civil Hospital'} • Status: {activeReferral?.status || 'Active'}
              </p>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => setShowQrModal(true)}
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <QrCode size={16} /> Open Hospital Check-in QR
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Intake Chat & Prescription Adherence */}
      <div className="grid-2">
        {/* Multilingual Conversational Intake Chat */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '520px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#14b8a6" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Symptom Intake Assistant</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Non-Authoritative Triage</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
            {chatMessages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'PATIENT' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: msg.sender === 'PATIENT' ? 'var(--primary)' : 'var(--bg-surface)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  borderTopRightRadius: msg.sender === 'PATIENT' ? '4px' : '16px',
                  borderTopLeftRadius: msg.sender === 'AI' ? '4px' : '16px',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.875rem',
                }}
              >
                <p>{msg.text}</p>
                <span style={{ display: 'block', textAlign: 'right', fontSize: '0.65rem', marginTop: '4px', opacity: 0.7 }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <input 
              type="text" 
              placeholder="Describe what you are experiencing..." 
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isSubmitting}
              style={{ flex: 1 }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting || !inputPrompt.trim()}
              style={{ padding: '0 18px' }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* E-Prescription & Follow-Up Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Medicines Adherence */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={18} color="#14b8a6" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Today's Medicine Schedule</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {medicines.filter(m => m.taken).length} / {medicines.length} Taken
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {medicines.map(med => (
                <div 
                  key={med.id}
                  onClick={() => toggleMedicine(med.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: med.taken ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                    border: `1px solid ${med.taken ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${med.taken ? '#10b981' : 'var(--text-muted)'}`,
                      backgroundColor: med.taken ? '#10b981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {med.taken && <CheckCircle size={14} color="#ffffff" />}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: med.taken ? 'line-through' : 'none', color: med.taken ? 'var(--text-muted)' : 'var(--text-main)' }}>
                        {med.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.timing}</p>
                    </div>
                  </div>
                  <span className={`badge ${med.taken ? 'badge-routine' : 'badge-sameday'}`} style={{ fontSize: '0.68rem' }}>
                    {med.taken ? 'TAKEN' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-Up Care & ASHA Worker Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#38bdf8" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Follow-Up Care Plan</h3>
              </div>
              <span className="badge badge-emergency" style={{ fontSize: '0.68rem' }}>
                HOME VISIT SCHEDULED
              </span>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned ASHA Worker:</span>
                <span style={{ fontWeight: 600 }}>Sunita Pawar (Haveli Ward 4)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Next Home Visit:</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Tomorrow, 10:00 AM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Clinical Target:</span>
                <span>BP Recheck, ECG review & Antiplatelet adherence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal for verified hospital arrival */}
      {showQrModal && activeReferral && (
        <QRCodeModal 
          token={activeReferral.hmac_qr_token}
          referralId={activeReferral.id}
          targetFacility={activeReferral.target_facility_name || 'Pune District Civil Hospital'}
          triageCategory={activeReferral.triage_category}
          expiresAt={activeReferral.expires_at}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
