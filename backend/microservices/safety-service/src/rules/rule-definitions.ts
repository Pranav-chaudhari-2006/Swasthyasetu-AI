import { SafetyRule, InputFactsSnapshot } from '../types';

export const safetyRulesCatalog: SafetyRule[] = [
  // --- EMERGENCY RULES (Bypass = true) ---
  {
    ruleId: 'RULE_EMG_001_CHEST_PAIN_ACUTE',
    ruleName: 'Acute Coronary / Severe Chest Pain Red-Flag',
    targetPathway: 'EMERGENCY',
    recommendedCapabilities: ['EMERGENCY_TRIAGE', 'CARDIOLOGY_ECG', 'ICU_GENERAL'],
    isEmergencyBypass: true,
    clinicalRationale:
      'Acute severe chest pain carries immediate risk of myocardial infarction; requires urgent ECG and resuscitation capability.',
    evaluate: (facts: InputFactsSnapshot) => {
      if (facts.reportedRedFlags.includes('CHEST_PAIN_ACUTE')) return true;
      return facts.chiefSymptoms.some(
        (s) => s.symptomName === 'CHEST_PAIN' && s.severityScore >= 7
      );
    },
  },
  {
    ruleId: 'RULE_EMG_002_SNAKE_BITE',
    ruleName: 'Envenomation / Snake Bite Critical Emergency',
    targetPathway: 'EMERGENCY',
    recommendedCapabilities: ['SNAKE_BITE_ANTIVENOM', 'EMERGENCY_TRIAGE', 'ICU_GENERAL'],
    isEmergencyBypass: true,
    clinicalRationale:
      'Suspected or confirmed snake bite requires immediate administration of polyvalent anti-snake venom and airway monitoring.',
    evaluate: (facts: InputFactsSnapshot) => {
      return (
        facts.reportedRedFlags.includes('SNAKE_BITE') ||
        facts.chiefSymptoms.some((s) => s.symptomName.includes('SNAKE_BITE'))
      );
    },
  },
  {
    ruleId: 'RULE_EMG_003_SEVERE_BREATHLESSNESS',
    ruleName: 'Severe Respiratory Distress / Hypoxia',
    targetPathway: 'EMERGENCY',
    recommendedCapabilities: ['EMERGENCY_TRIAGE', 'ICU_GENERAL', 'ICU_PEDIATRIC'],
    isEmergencyBypass: true,
    clinicalRationale:
      'Severe respiratory compromise requires immediate oxygenation, nebulization, or ventilatory support.',
    evaluate: (facts: InputFactsSnapshot) => {
      if (facts.reportedRedFlags.includes('BREATHLESSNESS_SEVERE')) return true;
      if (facts.vitalSigns?.spo2Percentage && facts.vitalSigns.spo2Percentage < 90) return true;
      return facts.chiefSymptoms.some(
        (s) => s.symptomName === 'BREATHLESSNESS' && s.severityScore >= 8
      );
    },
  },
  {
    ruleId: 'RULE_EMG_004_UNCONSCIOUS_OR_SEIZURE',
    ruleName: 'Altered Mental Status / Active Seizure',
    targetPathway: 'EMERGENCY',
    recommendedCapabilities: ['EMERGENCY_TRIAGE', 'ICU_GENERAL'],
    isEmergencyBypass: true,
    clinicalRationale:
      'Unresponsiveness or convulsions carry risk of severe neurological insult or airway obstruction.',
    evaluate: (facts: InputFactsSnapshot) => {
      return (
        facts.reportedRedFlags.includes('UNCONSCIOUSNESS') ||
        facts.reportedRedFlags.includes('SEIZURE_CONVULSION')
      );
    },
  },

  // --- SAME_DAY RULES ---
  {
    ruleId: 'RULE_SAMEDAY_001_PEDIATRIC_HIGH_FEVER',
    ruleName: 'Pediatric High Fever / Infant Alert',
    targetPathway: 'SAME_DAY',
    recommendedCapabilities: ['OPD_GENERAL', 'LAB_BLOOD_TESTS', 'PHARMACY_24X7'],
    isEmergencyBypass: false,
    clinicalRationale:
      'Fever in infants or young children requires same-day clinical assessment to exclude acute bacterial infections.',
    evaluate: (facts: InputFactsSnapshot) => {
      const isPediatric = (facts.patientAge && facts.patientAge < 5) || false;
      const hasFever = facts.chiefSymptoms.some((s) => s.symptomName === 'FEVER');
      return isPediatric && hasFever;
    },
  },
  {
    ruleId: 'RULE_SAMEDAY_002_PROLONGED_HIGH_FEVER',
    ruleName: 'Prolonged High Grade Fever (> 3 Days)',
    targetPathway: 'SAME_DAY',
    recommendedCapabilities: ['OPD_GENERAL', 'LAB_BLOOD_TESTS', 'PHARMACY_24X7'],
    isEmergencyBypass: false,
    clinicalRationale:
      'Fever persisting > 3 days requires same-day diagnostic testing for malaria, dengue, typhoid, or secondary infections.',
    evaluate: (facts: InputFactsSnapshot) => {
      return facts.chiefSymptoms.some(
        (s) => s.symptomName === 'FEVER' && (s.severityScore >= 7 || s.onsetDuration.includes('3_DAYS') || s.onsetDuration.includes('4_DAYS'))
      );
    },
  },

  // --- ROUTINE RULES ---
  {
    ruleId: 'RULE_ROUTINE_001_MILD_RESPIRATORY',
    ruleName: 'Mild Upper Respiratory Symptoms / Common Cold',
    targetPathway: 'ROUTINE',
    recommendedCapabilities: ['OPD_GENERAL', 'PHARMACY_24X7'],
    isEmergencyBypass: false,
    clinicalRationale:
      'Uncomplicated mild cough/cold with low severity can be safely evaluated during routine OPD hours.',
    evaluate: (facts: InputFactsSnapshot) => {
      return facts.chiefSymptoms.every(
        (s) => (s.symptomName === 'COUGH' || s.symptomName === 'COLD') && s.severityScore <= 5
      );
    },
  },
  {
    ruleId: 'RULE_ROUTINE_002_GENERAL_BASELINE',
    ruleName: 'General Primary Care Baseline Triage',
    targetPathway: 'ROUTINE',
    recommendedCapabilities: ['OPD_GENERAL'],
    isEmergencyBypass: false,
    clinicalRationale:
      'Standard non-urgent presentation suitable for standard primary health centre appointment.',
    evaluate: (_facts: InputFactsSnapshot) => {
      return true; // Catch-all default routine rule
    },
  },
];
