export type MessageSenderType = 'PATIENT' | 'ASHA' | 'SYSTEM_AI' | 'CLINICIAN';

export type IntakeStatus = 'IN_PROGRESS' | 'NEEDS_CLARIFICATION' | 'STRUCTURED' | 'TRIAGED';

export interface IntakeMessage {
  id: string;
  sessionId: string;
  senderType: MessageSenderType;
  rawContent: string;
  translatedContent?: string;
  audioUrl?: string;
  languageCode: string;
  createdAt: Date;
}

export interface StructuredIntakeFacts {
  id: string;
  sessionId: string;
  caseId: string;
  patientId: string;
  chiefSymptoms: Array<{
    symptomName: string;
    onsetDuration: string;
    severityScore: number; // 1 to 10
    bodySite?: string;
  }>;
  reportedRedFlags: string[];
  existingMedicalConditions?: string[];
  currentMedications?: string[];
  extractedVitalSigns?: {
    systolicBP?: number;
    diastolicBP?: number;
    pulseRate?: number;
    temperatureF?: number;
    spo2Percentage?: number;
  };
  clarificationStatus: 'COMPLETE' | 'PENDING';
  modelVersion: string;
  confidenceScore: number;
  isAiGenerated: true; // Strict guardrail marker
  createdAt: Date;
}

export interface IntakeSession {
  id: string;
  caseId: string;
  patientId: string;
  operatedBy?: string;
  languageCode: string;
  status: IntakeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClarificationQuestion {
  questionId: string;
  targetField: string;
  questionText: string;
  questionTextLocalized: string;
  suggestedAnswers?: string[];
}
