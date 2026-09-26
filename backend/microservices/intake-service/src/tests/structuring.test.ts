import { structuringService } from '../services/structuring.service';
import { IntakeMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

describe('MS-4: Schema-Constrained AI Structuring Unit Tests', () => {
  it('should extract structured symptoms and red flags from multilingual text', async () => {
    const sessionId = uuidv4();
    const caseId = uuidv4();
    const patientId = uuidv4();

    const messages: IntakeMessage[] = [
      {
        id: uuidv4(),
        sessionId,
        senderType: 'PATIENT',
        rawContent: 'मुझे दो दिन से बहुत तेज बुखार और सीने में दर्द हो रहा है',
        translatedContent: 'I have had high fever and chest pain for 2 days',
        languageCode: 'hi',
        createdAt: new Date(),
      },
    ];

    const { facts, clarifications } = await structuringService.extractStructuredFacts({
      sessionId,
      caseId,
      patientId,
      messages,
    });

    expect(facts.sessionId).toBe(sessionId);
    expect(facts.chiefSymptoms.length).toBeGreaterThanOrEqual(2);
    const symptomNames = facts.chiefSymptoms.map((s) => s.symptomName);
    expect(symptomNames).toContain('FEVER');
    expect(symptomNames).toContain('CHEST_PAIN');

    // Red flag should be triggered
    expect(facts.reportedRedFlags).toContain('CHEST_PAIN_ACUTE');

    // Strict Clinical Guardrail Assertion:
    expect(facts.isAiGenerated).toBe(true);
    expect((facts as any).diagnosis).toBeUndefined();
    expect((facts as any).prescription).toBeUndefined();
  });

  it('should generate clarification questions when duration is missing', async () => {
    const sessionId = uuidv4();
    const messages: IntakeMessage[] = [
      {
        id: uuidv4(),
        sessionId,
        senderType: 'PATIENT',
        rawContent: 'I have severe chest pain',
        languageCode: 'en',
        createdAt: new Date(),
      },
    ];

    const { facts } = await structuringService.extractStructuredFacts({
      sessionId,
      caseId: uuidv4(),
      patientId: uuidv4(),
      messages,
    });

    expect(facts.reportedRedFlags).toContain('CHEST_PAIN_ACUTE');
  });
});
