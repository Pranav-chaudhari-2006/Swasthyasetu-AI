export type TriagePathway = 'ROUTINE' | 'SAME_DAY' | 'EMERGENCY';

export interface StructuredInputFactItem {
  symptomName: string;
  onsetDuration: string;
  severityScore: number;
  bodySite?: string;
}

export interface InputFactsSnapshot {
  caseId: string;
  patientId: string;
  chiefSymptoms: StructuredInputFactItem[];
  reportedRedFlags: string[];
  existingMedicalConditions?: string[];
  vitalSigns?: {
    systolicBP?: number;
    diastolicBP?: number;
    pulseRate?: number;
    temperatureF?: number;
    spo2Percentage?: number;
  };
  patientAge?: number;
  patientGender?: string;
}

export interface SafetyRule {
  ruleId: string;
  ruleName: string;
  targetPathway: TriagePathway;
  recommendedCapabilities: string[];
  isEmergencyBypass: boolean;
  clinicalRationale: string;
  evaluate: (facts: InputFactsSnapshot) => boolean;
}

export interface SafetyAssessment {
  id: string;
  caseId: string;
  ruleSetVersion: string;
  triagedPathway: TriagePathway;
  triggeredRuleIds: string[];
  clinicalRationale: string;
  recommendedCapabilities: string[];
  isEmergencyBypass: boolean;
  inputFactsSnapshot: InputFactsSnapshot;
  evaluatedAt: Date;
}
