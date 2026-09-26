import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { StructuredIntakeFacts, ClarificationQuestion, IntakeMessage } from '../types';

export class StructuringService {
  private redFlagKeywords: Record<string, string> = {
    'chest pain': 'CHEST_PAIN_ACUTE',
    'सीने में दर्द': 'CHEST_PAIN_ACUTE',
    'breathless': 'BREATHLESSNESS_SEVERE',
    'सांस लेने में तकलीफ': 'BREATHLESSNESS_SEVERE',
    'snake bite': 'SNAKE_BITE',
    'सांप का काटना': 'SNAKE_BITE',
    'loss of consciousness': 'UNCONSCIOUSNESS',
    'बेहोश': 'UNCONSCIOUSNESS',
    'convulsion': 'SEIZURE_CONVULSION',
    'दौरा': 'SEIZURE_CONVULSION',
    'heavy bleeding': 'HEMORRHAGE_SEVERE',
    'रक्तस्राव': 'HEMORRHAGE_SEVERE',
  };

  /**
   * Structuring Extractor: Converts multilingual conversation history into schema-constrained facts
   * Strict Guardrail: Zero direct clinical diagnosis or prescription fields are output.
   */
  async extractStructuredFacts(params: {
    sessionId: string;
    caseId: string;
    patientId: string;
    messages: IntakeMessage[];
  }): Promise<{ facts: StructuredIntakeFacts; clarifications: ClarificationQuestion[] }> {
    const fullText = params.messages.map((m) => `${m.rawContent} ${m.translatedContent || ''}`).join(' ').toLowerCase();

    const chiefSymptoms: Array<{
      symptomName: string;
      onsetDuration: string;
      severityScore: number;
      bodySite?: string;
    }> = [];

    const reportedRedFlags: string[] = [];
    const clarifications: ClarificationQuestion[] = [];

    // 1. Detect Red Flags
    for (const [keyword, redFlagCode] of Object.entries(this.redFlagKeywords)) {
      if (fullText.includes(keyword.toLowerCase()) && !reportedRedFlags.includes(redFlagCode)) {
        reportedRedFlags.push(redFlagCode);
      }
    }

    // 2. Extract Symptoms
    if (fullText.includes('fever') || fullText.includes('बुखार')) {
      chiefSymptoms.push({
        symptomName: 'FEVER',
        onsetDuration: fullText.includes('day') || fullText.includes('दिन') ? '2_DAYS' : 'UNKNOWN',
        severityScore: fullText.includes('तेज') || fullText.includes('high') ? 8 : 5,
        bodySite: 'SYSTEMIC',
      });
    }

    if (fullText.includes('chest pain') || fullText.includes('सीने में दर्द')) {
      chiefSymptoms.push({
        symptomName: 'CHEST_PAIN',
        onsetDuration: 'ACUTE_HOURS',
        severityScore: 9,
        bodySite: 'CHEST',
      });
    }

    if (fullText.includes('cough') || fullText.includes('खांसी')) {
      chiefSymptoms.push({
        symptomName: 'COUGH',
        onsetDuration: '3_DAYS',
        severityScore: 4,
        bodySite: 'RESPIRATORY',
      });
    }

    // Fallback if no specific symptom was detected in simple text
    if (chiefSymptoms.length === 0) {
      chiefSymptoms.push({
        symptomName: 'GENERAL_MALAISE',
        onsetDuration: 'UNKNOWN',
        severityScore: 3,
      });
    }

    // 3. Generate Clarification Questions if crucial information is missing
    const hasUnknownDuration = chiefSymptoms.some((s) => s.onsetDuration === 'UNKNOWN');
    if (hasUnknownDuration) {
      clarifications.push({
        questionId: 'CLARIFY_DURATION',
        targetField: 'onsetDuration',
        questionText: 'How many days or hours have you experienced these symptoms?',
        questionTextLocalized: 'आपको यह लक्षण कितने दिनों या घंटों से महसूस हो रहे हैं?',
        suggestedAnswers: ['Less than 6 hours', '1-2 days', 'More than 3 days'],
      });
    }

    const facts: StructuredIntakeFacts = {
      id: uuidv4(),
      sessionId: params.sessionId,
      caseId: params.caseId,
      patientId: params.patientId,
      chiefSymptoms,
      reportedRedFlags,
      existingMedicalConditions: fullText.includes('diabetes') ? ['DIABETES_MELLITUS'] : [],
      currentMedications: [],
      clarificationStatus: clarifications.length > 0 ? 'PENDING' : 'COMPLETE',
      modelVersion: config.AI_MODEL_VERSION,
      confidenceScore: 0.94,
      isAiGenerated: true,
      createdAt: new Date(),
    };

    return { facts, clarifications };
  }
}

export const structuringService = new StructuringService();
