import { safetyEngineService } from '../services/safety-engine.service';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

describe('MS-5: Deterministic Safety Engine Unit Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('Emergency Chest Pain fixture should trigger EMERGENCY pathway with bypass', async () => {
    const assessment = await safetyEngineService.evaluateTriage({
      caseId: uuidv4(),
      patientId: uuidv4(),
      chiefSymptoms: [
        { symptomName: 'CHEST_PAIN', onsetDuration: 'ACUTE_HOURS', severityScore: 9 },
      ],
      reportedRedFlags: ['CHEST_PAIN_ACUTE'],
    });

    expect(assessment.triagedPathway).toBe('EMERGENCY');
    expect(assessment.isEmergencyBypass).toBe(true);
    expect(assessment.triggeredRuleIds).toContain('RULE_EMG_001_CHEST_PAIN_ACUTE');
    expect(assessment.recommendedCapabilities).toContain('CARDIOLOGY_ECG');
  });

  it('Snake Bite fixture should trigger EMERGENCY pathway with antivenom recommendation', async () => {
    const assessment = await safetyEngineService.evaluateTriage({
      caseId: uuidv4(),
      patientId: uuidv4(),
      chiefSymptoms: [
        { symptomName: 'SNAKE_BITE_BITE_MARK', onsetDuration: '1_HOUR', severityScore: 10 },
      ],
      reportedRedFlags: ['SNAKE_BITE'],
    });

    expect(assessment.triagedPathway).toBe('EMERGENCY');
    expect(assessment.isEmergencyBypass).toBe(true);
    expect(assessment.triggeredRuleIds).toContain('RULE_EMG_002_SNAKE_BITE');
    expect(assessment.recommendedCapabilities).toContain('SNAKE_BITE_ANTIVENOM');
  });

  it('Pediatric Fever in 2-year old should trigger SAME_DAY pathway', async () => {
    const assessment = await safetyEngineService.evaluateTriage({
      caseId: uuidv4(),
      patientId: uuidv4(),
      patientAge: 2,
      chiefSymptoms: [
        { symptomName: 'FEVER', onsetDuration: '1_DAY', severityScore: 7 },
      ],
      reportedRedFlags: [],
    });

    expect(assessment.triagedPathway).toBe('SAME_DAY');
    expect(assessment.isEmergencyBypass).toBe(false);
    expect(assessment.triggeredRuleIds).toContain('RULE_SAMEDAY_001_PEDIATRIC_HIGH_FEVER');
  });

  it('Prolonged Fever (> 3 days) in adult should trigger SAME_DAY pathway', async () => {
    const assessment = await safetyEngineService.evaluateTriage({
      caseId: uuidv4(),
      patientId: uuidv4(),
      patientAge: 35,
      chiefSymptoms: [
        { symptomName: 'FEVER', onsetDuration: '4_DAYS', severityScore: 6 },
      ],
      reportedRedFlags: [],
    });

    expect(assessment.triagedPathway).toBe('SAME_DAY');
    expect(assessment.triggeredRuleIds).toContain('RULE_SAMEDAY_002_PROLONGED_HIGH_FEVER');
  });

  it('Mild Cold / Cough should trigger ROUTINE pathway', async () => {
    const assessment = await safetyEngineService.evaluateTriage({
      caseId: uuidv4(),
      patientId: uuidv4(),
      patientAge: 25,
      chiefSymptoms: [
        { symptomName: 'COUGH', onsetDuration: '2_DAYS', severityScore: 3 },
      ],
      reportedRedFlags: [],
    });

    expect(assessment.triagedPathway).toBe('ROUTINE');
    expect(assessment.isEmergencyBypass).toBe(false);
  });
});
