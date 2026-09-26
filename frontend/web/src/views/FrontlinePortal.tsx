import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, HeartPulse, Activity, RefreshCw, 
  CheckCircle, AlertCircle, Clock, ShieldCheck, MapPin, Search 
} from 'lucide-react';
import { api } from '../services/api';
import { FollowUpTask, OfflineMutation } from '../types';

export const FrontlinePortal: React.FC = () => {
  const [workerId] = useState('ASHA-HAV-042');
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [offlineMutations, setOfflineMutations] = useState<OfflineMutation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Assisted Intake Form State
  const [patientName, setPatientName] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [age, setAge] = useState('45');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [complaint, setComplaint] = useState('');
  const [systolic, setSystolic] = useState('130');
  const [diastolic, setDiastolic] = useState('85');
  const [pulse, setPulse] = useState('78');
  const [spo2, setSpo2] = useState('98');
  const [temp, setTemp] = useState('98.6');
  const [intakeResult, setIntakeResult] = useState<any | null>(null);

  // Selected Task for Home Visit Completion
  const [selectedTask, setSelectedTask] = useState<FollowUpTask | null>(null);
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSystolic, setVisitSystolic] = useState('124');
  const [visitDiastolic, setVisitDiastolic] = useState('82');
  const [visitSpo2, setVisitSpo2] = useState('97');

  useEffect(() => {
    loadWorkerData();
  }, []);

  const loadWorkerData = async () => {
    const queue = await api.getWorkerFollowUpQueue(workerId);
    setTasks(queue);
    setOfflineMutations(api.getOfflineMutations());
  };

  const handleSyncBatch = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await api.syncOfflineBatch(workerId);
      setSyncStatusMsg(`Successfully reconciled ${res.processed} offline mutations with server authority.`);
      setOfflineMutations(api.getOfflineMutations());
      await loadWorkerData();
    } catch {
      setSyncStatusMsg('Sync failed; changes safely retained in offline cryptographic queue.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAssistedIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) return;

    const vitalsData = {
      systolic_bp: parseInt(systolic) || 120,
      diastolic_bp: parseInt(diastolic) || 80,
      heart_rate: parseInt(pulse) || 72,
      spo2_percent: parseInt(spo2) || 98,
      temperature_f: parseFloat(temp) || 98.6,
    };

    try {
      const res = await api.submitIntake({
        case_id: 'case_fl_' + Date.now().toString(36),
        raw_transcript: `[Assisted ASHA Entry for ${patientName || 'Anonymous'}] ${complaint}`,
        detected_language: 'en',
        chief_complaint: complaint,
        vitals: vitalsData,
      });

      setIntakeResult(res);

      // If Emergency, also enqueue offline record
      api.queueOfflineMutation({
        entity_type: 'INTAKE',
        action: 'CREATE',
        payload: { patient: patientName, complaint, vitals: vitalsData, triage: res.safety.category },
        client_timestamp: new Date().toISOString(),
      });
      setOfflineMutations(api.getOfflineMutations());

      // Reset form
      setComplaint('');
      setPatientName('');
      setAbhaId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    await api.completeFollowUpVisit(selectedTask.id, {
      worker_id: workerId,
      visit_notes: visitNotes || 'Patient examined at home. Medication compliance verified.',
      vitals: {
        systolic_bp: parseInt(visitSystolic),
        diastolic_bp: parseInt(visitDiastolic),
        spo2: parseInt(visitSpo2),
      },
    });

    // Queue mutation for audit
    api.queueOfflineMutation({
      entity_type: 'FOLLOWUP_VISIT',
      action: 'UPDATE',
      payload: { task_id: selectedTask.id, worker_id: workerId, vitals: { visitSystolic, visitDiastolic, visitSpo2 } },
      client_timestamp: new Date().toISOString(),
    });

    setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
    setSelectedTask(null);
    setVisitNotes('');
    setOfflineMutations(api.getOfflineMutations());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Frontline Worker Top Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Sunita Pawar (ASHA)</h2>
              <span className="badge badge-routine" style={{ fontSize: '0.7rem' }}>AUTHORIZED ANM/ASHA</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Worker ID: {workerId} • Sub-Centre: Shindewadi • Haveli PHC Catchment
            </p>
          </div>
        </div>

        {/* Offline Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Offline Rules: <strong style={{ color: '#14b8a6' }}>v1.2.0-deterministic-pilot</strong>
            </span>
            <span style={{ color: offlineMutations.length > 0 ? '#fbbf24' : '#10b981' }}>
              {offlineMutations.length} Pending Local Mutations
            </span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={handleSyncBatch} 
            disabled={isSyncing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={isSyncing ? 'pulse-emergency' : ''} />
            {isSyncing ? 'Reconciling...' : 'Batch Sync'}
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.85rem' }}>
          <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          {syncStatusMsg}
        </div>
      )}

      {/* Main Grid: Assisted Intake & Assigned Home Visits */}
      <div className="grid-2">
        {/* Assisted Intake Questionnaire */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <UserPlus size={20} color="#14b8a6" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Frontline Assisted Intake</h3>
          </div>

          <form onSubmit={handleAssistedIntakeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Patient Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Anand Varma" 
                  value={patientName} 
                  onChange={e => setPatientName(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ABHA Number / National ID</label>
                <input 
                  type="text" 
                  placeholder="ABHA-1234-5678-9012" 
                  value={abhaId} 
                  onChange={e => setAbhaId(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Age (Years)</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={e => setAge(e.target.value)} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Gender</label>
                <select 
                  value={gender} 
                  onChange={e => setGender(e.target.value as any)} 
                  style={{ width: '100%' }}
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Vital Signs Panel */}
            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Activity size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Point-of-Care Vitals</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>BP Sys/Dia</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" placeholder="120" value={systolic} onChange={e => setSystolic(e.target.value)} style={{ width: '100%', padding: '6px' }} />
                    <input type="number" placeholder="80" value={diastolic} onChange={e => setDiastolic(e.target.value)} style={{ width: '100%', padding: '6px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Pulse (bpm)</label>
                  <input type="number" placeholder="75" value={pulse} onChange={e => setPulse(e.target.value)} style={{ width: '100%', padding: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>SpO2 (%)</label>
                  <input type="number" placeholder="98" value={spo2} onChange={e => setSpo2(e.target.value)} style={{ width: '100%', padding: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Temp (°F)</label>
                  <input type="number" step="0.1" placeholder="98.6" value={temp} onChange={e => setTemp(e.target.value)} style={{ width: '100%', padding: '6px' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Chief Complaint & Clinical Symptoms</label>
              <textarea 
                rows={3} 
                placeholder="e.g. Continuous high fever, petechiae on skin, abdominal tenderness..." 
                value={complaint} 
                onChange={e => setComplaint(e.target.value)} 
                required 
                style={{ width: '100%' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Run Safety Triage & Generate Referral
            </button>
          </form>

          {/* Intake Triage Assessment Feedback */}
          {intakeResult && (
            <div style={{ marginTop: '16px', background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={`badge badge-${intakeResult.safety.category.toLowerCase().replace('_', '')}`}>
                  {intakeResult.safety.category} TRIAGE
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Score: {intakeResult.safety.urgency_score} / 100
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Protocol: {intakeResult.safety.matched_protocol_code} • Facility: {intakeResult.safety.recommended_facility_tier}
              </p>
              {intakeResult.safety.requires_immediate_ambulance && (
                <div style={{ color: '#ff6b8b', fontSize: '0.8rem', fontWeight: 700, marginTop: '6px' }}>
                  🚨 Zero-Click 108 Emergency Dispatch Triggered
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assigned Follow-Up Care Queue */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartPulse size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Assigned Follow-Up Queue</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {tasks.length} Active Tasks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {tasks.map(task => (
              <div 
                key={task.id}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${task.priority === 'CRITICAL' ? 'rgba(225, 29, 72, 0.4)' : 'var(--border-color)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={`badge ${task.priority === 'CRITICAL' ? 'badge-emergency' : task.priority === 'HIGH' ? 'badge-sameday' : 'badge-routine'}`}>
                      {task.priority} • {task.task_type}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '6px' }}>
                      Patient ID: {task.patient_id}
                    </h4>
                  </div>
                  {task.status === 'ESCALATED_DHO' && (
                    <span className="badge badge-emergency" style={{ fontSize: '0.65rem' }}>
                      LEVEL 3 DHO ALERT
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {task.instructions}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                  <button 
                    className="btn-primary"
                    onClick={() => setSelectedTask(task)}
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    Log Home Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Home Visit Modal */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', background: '#0f172a', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Log ASHA Home Visit
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Task: {selectedTask.instructions}
            </p>

            <form onSubmit={handleCompleteVisit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>BP Systolic</label>
                  <input type="number" value={visitSystolic} onChange={e => setVisitSystolic(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>BP Diastolic</label>
                  <input type="number" value={visitDiastolic} onChange={e => setVisitDiastolic(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>SpO2 (%)</label>
                  <input type="number" value={visitSpo2} onChange={e => setVisitSpo2(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Visit Notes & Medication Adherence</label>
                <textarea 
                  rows={3} 
                  placeholder="Patient was alert, verified morning tablets taken in front of ASHA, no chest distress..." 
                  value={visitNotes} 
                  onChange={e => setVisitNotes(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save & Complete Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
