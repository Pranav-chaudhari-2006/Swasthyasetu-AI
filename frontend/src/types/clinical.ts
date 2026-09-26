export type ClinicalModule =
  | 'triage-and-intake'
  | 'vitals-and-telemetry'
  | 'referrals-and-facilities'
  | 'care-plans-and-tasks';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'emergency' | 'info';
  title: string;
  message: string;
}

export interface PatientRecord {
  name: string;
  age: number;
  gender: string;
  uhid: string;
  abha: string;
  ashaWorker: string;
  ashaId: string;
  bedId?: string;
  subCenter: string;
  status: string;
  riskSeverity: 'critical' | 'urgent' | 'moderate' | 'stable';
  avatarUrl: string;
}
