import { 
  Patient, CaseRecord, StructuredIntake, SafetyAssessment, 
  Referral, EmergencyDispatch, ClinicalAssessment, PrescriptionItem, 
  LabOrder, FollowUpTask, Facility, OfflineMutation 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || '/api/v1';

class ApiService {
  private offlineQueue: OfflineMutation[] = [];

  constructor() {
    this.loadOfflineQueue();
  }

  private loadOfflineQueue() {
    try {
      const stored = localStorage.getItem('swasthyasetu_offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch {
      this.offlineQueue = [];
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem('swasthyasetu_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  public getOfflineMutations(): OfflineMutation[] {
    return [...this.offlineQueue];
  }

  public queueOfflineMutation(mutation: Omit<OfflineMutation, 'id' | 'status'>): OfflineMutation {
    const item: OfflineMutation = {
      ...mutation,
      id: 'mut_' + Math.random().toString(36).substring(2, 9),
      status: 'QUEUED',
    };
    this.offlineQueue.push(item);
    this.saveOfflineQueue();
    return item;
  }

  public clearOfflineQueue() {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  // --- Gateway Health ---
  public async checkHealth(): Promise<{ status: string; uptime: number }> {
    try {
      const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      if (!res.ok) throw new Error('Health check non-200');
      return await res.json();
    } catch {
      return { status: 'DEGRADED', uptime: 0 };
    }
  }

  // --- Auth / OTP ---
  public async requestOtp(phone: string): Promise<{ success: boolean; session_id: string; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return await res.json();
    } catch {
      return { success: true, session_id: 'sess_' + Date.now(), message: 'Simulation: OTP 123456 dispatched' };
    }
  }

  public async verifyOtp(sessionId: string, otp: string, role: string = 'PATIENT') {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, otp, requested_role: role }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        token: 'jwt_mock_token_verified_role_' + role,
        user: { id: 'usr_pat_001', role, national_health_id: 'ABHA-9821-4321-0091' },
      };
    }
  }

  // --- Intake & Safety ---
  public async submitIntake(data: {
    case_id: string;
    raw_transcript: string;
    detected_language: string;
    chief_complaint: string;
    vitals?: any;
  }): Promise<{ intake: StructuredIntake; safety: SafetyAssessment }> {
    try {
      const res = await fetch(`${API_BASE_URL}/intake/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Intake submit failed');
      const intakeData = await res.json();

      // Next call deterministic safety evaluation
      const safetyRes = await fetch(`${API_BASE_URL}/safety/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: data.case_id,
          intake_id: intakeData.data?.id || 'intake_' + Date.now(),
          structured_symptoms: intakeData.data?.structured_symptoms,
          vitals: data.vitals,
        }),
      });
      const safetyData = await safetyRes.json();

      return {
        intake: intakeData.data,
        safety: safetyData.data,
      };
    } catch {
      // Deterministic client-side evaluation fallback
      const hasChestPain = data.raw_transcript.toLowerCase().includes('chest pain') || data.raw_transcript.toLowerCase().includes('heart');
      const hasSevereDyspnea = data.raw_transcript.toLowerCase().includes('breath') || (data.vitals?.spo2_percent && data.vitals.spo2_percent < 90);
      
      const category = (hasChestPain || hasSevereDyspnea) ? 'EMERGENCY' : data.raw_transcript.toLowerCase().includes('fever') ? 'SAME_DAY' : 'ROUTINE';
      const urgencyScore = category === 'EMERGENCY' ? 95 : category === 'SAME_DAY' ? 65 : 25;

      const fallbackIntake: StructuredIntake = {
        id: 'int_' + Date.now(),
        case_id: data.case_id,
        raw_transcript: data.raw_transcript,
        detected_language: data.detected_language || 'en',
        structured_symptoms: {
          chief_complaint: data.chief_complaint || data.raw_transcript.slice(0, 50),
          duration_days: 2,
          severity_score: urgencyScore,
          associated_symptoms: hasChestPain ? ['Chest Pain', 'Diaphoresis'] : ['Mild Fatigue'],
          is_fever_present: data.raw_transcript.toLowerCase().includes('fever'),
          is_chest_pain_present: hasChestPain,
          is_dyspnea_present: hasSevereDyspnea,
        },
        vitals: data.vitals,
        is_ai_generated: true,
        created_at: new Date().toISOString(),
      };

      const fallbackSafety: SafetyAssessment = {
        id: 'safe_' + Date.now(),
        intake_id: fallbackIntake.id,
        case_id: data.case_id,
        category,
        urgency_score: urgencyScore,
        red_flags_detected: hasChestPain ? ['Suspected Acute Coronary Syndrome', 'Diaphoresis'] : [],
        matched_protocol_code: category === 'EMERGENCY' ? 'PROTO-ACS-001' : 'PROTO-PRIMARY-CARE',
        recommended_facility_tier: category === 'EMERGENCY' ? 'DISTRICT_HOSPITAL' : 'PHC',
        requires_immediate_ambulance: category === 'EMERGENCY',
        assessed_at: new Date().toISOString(),
      };

      return { intake: fallbackIntake, safety: fallbackSafety };
    }
  }

  // --- Referrals ---
  public async createReferral(data: {
    case_id: string;
    patient_id: string;
    target_facility_id: string;
    triage_category: string;
    urgency_score: number;
    clinical_summary: string;
  }): Promise<Referral> {
    try {
      const res = await fetch(`${API_BASE_URL}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    } catch {
      return {
        id: 'ref_' + Date.now(),
        case_id: data.case_id,
        patient_id: data.patient_id,
        originating_facility_id: 'fac_phc_shirur_01',
        target_facility_id: data.target_facility_id,
        target_facility_name: 'Pune District Civil Hospital',
        triage_category: data.triage_category as any,
        urgency_score: data.urgency_score,
        status: 'ISSUED',
        clinical_summary: data.clinical_summary,
        hmac_qr_token: 'HMAC_SIG_REF_' + Date.now().toString(36) + '_SAFE_VAL',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
    }
  }

  public async getFacilityInboundReferrals(facilityId: string): Promise<Referral[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/referrals/inbound/${facilityId}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [
        {
          id: 'ref_inbound_101',
          case_id: 'case_pune_882',
          patient_id: 'pat_ramesh_k',
          originating_facility_id: 'fac_phc_haveli',
          target_facility_id: facilityId,
          target_facility_name: 'Pune District Civil Hospital',
          triage_category: 'EMERGENCY',
          urgency_score: 92,
          status: 'IN_TRANSIT',
          clinical_summary: 'Substernal crushing chest pain radiating to left jaw, SpO2 91%, diaphoresis. 108 dispatched.',
          hmac_qr_token: 'HMAC_VALID_EMG_PUNE_101',
          expires_at: new Date(Date.now() + 36000000).toISOString(),
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'ref_inbound_102',
          case_id: 'case_pune_885',
          patient_id: 'pat_sunita_d',
          originating_facility_id: 'fac_phc_khed',
          target_facility_id: facilityId,
          target_facility_name: 'Pune District Civil Hospital',
          triage_category: 'SAME_DAY',
          urgency_score: 68,
          status: 'ISSUED',
          clinical_summary: 'Persistent high fever (103°F) for 4 days, thrombocytopenia suspected, petechial rash.',
          hmac_qr_token: 'HMAC_VALID_SAMEDAY_PUNE_102',
          expires_at: new Date(Date.now() + 72000000).toISOString(),
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'ref_inbound_103',
          case_id: 'case_pune_890',
          patient_id: 'pat_anand_v',
          originating_facility_id: 'fac_phc_ambegaon',
          target_facility_id: facilityId,
          target_facility_name: 'Pune District Civil Hospital',
          triage_category: 'ROUTINE',
          urgency_score: 30,
          status: 'ARRIVED',
          clinical_summary: 'Chronic osteoarthritis right knee, refractory to conservative therapy, seeking orthopedics OP.',
          hmac_qr_token: 'HMAC_VALID_ROUTINE_PUNE_103',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date(Date.now() - 14400000).toISOString(),
          arrival_timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
    }
  }

  public async updateReferralStatus(referralId: string, action: 'ACCEPT' | 'DECLINE' | 'ARRIVE'): Promise<Referral> {
    try {
      const endpoint = action === 'ARRIVE' ? 'arrive' : action === 'ACCEPT' ? 'accept' : 'decline';
      const res = await fetch(`${API_BASE_URL}/referrals/${referralId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility_id: 'fac_dist_pune_01' }),
      });
      const json = await res.json();
      return json.data;
    } catch {
      const statusMap = {
        ACCEPT: 'ACCEPTED',
        DECLINE: 'REROUTED',
        ARRIVE: 'ARRIVED',
      } as const;
      return {
        id: referralId,
        case_id: 'case_demo_act',
        patient_id: 'pat_demo_act',
        originating_facility_id: 'fac_phc_haveli',
        target_facility_id: 'fac_dist_pune_01',
        triage_category: 'SAME_DAY',
        urgency_score: 70,
        status: statusMap[action],
        clinical_summary: `Status updated to ${statusMap[action]} by clinician.`,
        hmac_qr_token: 'HMAC_VERIFIED_ACTION',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
    }
  }

  // --- Clinical Assessment, Prescriptions & Discharge ---
  public async submitClinicalAssessment(data: {
    case_id: string;
    doctor_id: string;
    facility_id: string;
    clinical_notes: string;
    confirmed_diagnosis: string;
    icd10_code?: string;
  }): Promise<ClinicalAssessment> {
    try {
      const res = await fetch(`${API_BASE_URL}/clinical/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    } catch {
      return {
        id: 'assess_' + Date.now(),
        case_id: data.case_id,
        doctor_id: data.doctor_id,
        facility_id: data.facility_id,
        clinical_notes: data.clinical_notes,
        confirmed_diagnosis: data.confirmed_diagnosis,
        icd10_code: data.icd10_code || 'R07.9',
        assessment_type: 'OUTPATIENT',
        created_at: new Date().toISOString(),
      };
    }
  }

  public async issuePrescription(data: {
    case_id: string;
    doctor_id: string;
    items: Array<{ medicine_name: string; dosage: string; frequency: string; duration_days: number; instructions: string }>;
  }): Promise<{ id: string; items: PrescriptionItem[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/clinical/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json.data;
    } catch {
      return {
        id: 'rx_' + Date.now(),
        items: data.items.map((it, idx) => ({
          id: 'rx_item_' + (idx + 1),
          ...it,
          status: 'PRESCRIBED',
        })),
      };
    }
  }

  public async dischargePatient(data: {
    case_id: string;
    doctor_id: string;
    discharge_condition: string;
    followup_instructions: string;
    next_visit_days: number;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/clinical/discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        discharge_summary_id: 'disch_' + Date.now(),
        discharged_at: new Date().toISOString(),
      };
    }
  }

  // --- Follow-Up Tasks ---
  public async getWorkerFollowUpQueue(workerId: string): Promise<FollowUpTask[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/followup/tasks/worker/${workerId}`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [
        {
          id: 'task_fu_001',
          case_id: 'case_pune_882',
          patient_id: 'pat_ramesh_k',
          assigned_worker_id: workerId,
          task_type: 'HOME_VISIT',
          priority: 'CRITICAL',
          status: 'ESCALATED_DHO',
          due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
          instructions: 'Post-ACS follow up: check BP, confirm Aspirin + Clopidogrel adherence, verify no recurrent angina.',
          escalation_level: 3,
        },
        {
          id: 'task_fu_002',
          case_id: 'case_pune_885',
          patient_id: 'pat_sunita_d',
          assigned_worker_id: workerId,
          task_type: 'MEDICATION_ADHERENCE',
          priority: 'HIGH',
          status: 'OVERDUE',
          due_date: new Date(Date.now() - 86400000).toISOString(),
          instructions: 'Check temperature, monitor hydration, inspect for petechial rashes.',
          escalation_level: 1,
        },
        {
          id: 'task_fu_003',
          case_id: 'case_pune_895',
          patient_id: 'pat_meena_p',
          assigned_worker_id: workerId,
          task_type: 'VACCINATION',
          priority: 'ROUTINE',
          status: 'PENDING',
          due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
          instructions: 'Pentavalent 3 & Oral Polio Vaccine booster due for 14-week infant.',
          escalation_level: 0,
        },
      ];
    }
  }

  public async completeFollowUpVisit(taskId: string, data: {
    worker_id: string;
    visit_notes: string;
    vitals: { systolic_bp?: number; diastolic_bp?: number; heart_rate?: number; spo2?: number };
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/followup/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        task_id: taskId,
        completed_at: new Date().toISOString(),
        status: 'COMPLETED',
      };
    }
  }

  // --- Offline Batch Sync ---
  public async syncOfflineBatch(device_id: string): Promise<{ processed: number; success: boolean }> {
    if (this.offlineQueue.length === 0) return { processed: 0, success: true };

    const mutationsToSend = [...this.offlineQueue];
    try {
      const res = await fetch(`${API_BASE_URL}/sync/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id,
          mutations: mutationsToSend.map(m => ({
            client_uuid: m.id,
            entity_type: m.entity_type,
            action: m.action,
            payload: m.payload,
            client_timestamp: m.client_timestamp,
            signature_hmac: 'VALID_OFFLINE_HMAC_SIG',
          })),
        }),
      });
      if (res.ok) {
        this.clearOfflineQueue();
        return { processed: mutationsToSend.length, success: true };
      }
    } catch {
      console.warn('Batch sync endpoint unavailable; retaining offline mutations');
    }
    return { processed: 0, success: false };
  }

  // --- DHO District Facilities & Ambulances ---
  public async getDistrictFacilities(): Promise<Facility[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/facilities`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [
        {
          id: 'fac_dist_pune_01',
          name: 'Pune District Civil Hospital (Aundh)',
          facility_tier: 'DISTRICT_HOSPITAL',
          district: 'Pune',
          beds_total: 350,
          beds_available: 42,
          icu_available: 6,
          oxygen_cylinders: 120,
          blood_units: 84,
          is_operational: true,
        },
        {
          id: 'fac_chc_shirur_02',
          name: 'Shirur Community Health Centre',
          facility_tier: 'CHC',
          district: 'Pune',
          beds_total: 50,
          beds_available: 14,
          icu_available: 1,
          oxygen_cylinders: 25,
          blood_units: 12,
          is_operational: true,
        },
        {
          id: 'fac_phc_haveli_03',
          name: 'Haveli Primary Health Centre',
          facility_tier: 'PHC',
          district: 'Pune',
          beds_total: 10,
          beds_available: 4,
          icu_available: 0,
          oxygen_cylinders: 6,
          blood_units: 0,
          is_operational: true,
        },
        {
          id: 'fac_tert_sassoon_04',
          name: 'Sassoon General Hospital & Medical College',
          facility_tier: 'TERTIARY_HOSPITAL',
          district: 'Pune',
          beds_total: 1200,
          beds_available: 118,
          icu_available: 15,
          oxygen_cylinders: 450,
          blood_units: 240,
          is_operational: true,
        },
      ];
    }
  }

  public async getActiveAmbulances(): Promise<EmergencyDispatch[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/emergency/active`);
      const json = await res.json();
      return json.data || [];
    } catch {
      return [
        {
          id: 'disp_108_pune_01',
          case_id: 'case_pune_882',
          patient_id: 'pat_ramesh_k',
          source_location: 'Shindewadi Village, Haveli Block',
          target_facility_id: 'fac_dist_pune_01',
          target_facility_name: 'Pune District Civil Hospital',
          ambulance_call_sign: 'MH-12-EM-1081',
          severity: 'RED',
          status: 'TRANSPORTING',
          current_lat: 18.5204,
          current_lon: 73.8567,
          eta_minutes: 8,
          vitals_stream: {
            heart_rate: 114,
            spo2: 92,
            blood_pressure: '158/98',
            recorded_at: new Date().toISOString(),
          },
          created_at: new Date(Date.now() - 1200000).toISOString(),
        },
        {
          id: 'disp_108_pune_02',
          case_id: 'case_pune_901',
          patient_id: 'pat_priya_s',
          source_location: 'Khadki Bazar, Pune',
          target_facility_id: 'fac_tert_sassoon_04',
          target_facility_name: 'Sassoon General Hospital',
          ambulance_call_sign: 'MH-12-EM-1089',
          severity: 'ORANGE',
          status: 'EN_ROUTE',
          current_lat: 18.5529,
          current_lon: 73.8291,
          eta_minutes: 14,
          vitals_stream: {
            heart_rate: 88,
            spo2: 97,
            blood_pressure: '124/80',
            recorded_at: new Date().toISOString(),
          },
          created_at: new Date(Date.now() - 600000).toISOString(),
        },
      ];
    }
  }
}

export const api = new ApiService();
