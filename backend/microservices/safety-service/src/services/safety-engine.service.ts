import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { config } from '../config';
import { safetyRulesCatalog } from '../rules/rule-definitions';
import { InputFactsSnapshot, SafetyAssessment, TriagePathway } from '../types';

export class SafetyEngineService {
  /**
   * Deterministic Safety Evaluation: Zero Hallucination, Zero LLM dependency
   */
  async evaluateTriage(facts: InputFactsSnapshot): Promise<SafetyAssessment> {
    const triggeredEmergencyRules = safetyRulesCatalog
      .filter((r) => r.targetPathway === 'EMERGENCY')
      .filter((r) => r.evaluate(facts));

    const triggeredSameDayRules = safetyRulesCatalog
      .filter((r) => r.targetPathway === 'SAME_DAY')
      .filter((r) => r.evaluate(facts));

    const triggeredRoutineRules = safetyRulesCatalog
      .filter((r) => r.targetPathway === 'ROUTINE')
      .filter((r) => r.evaluate(facts));

    let finalPathway: TriagePathway = 'ROUTINE';
    let triggeredRuleIds: string[] = [];
    let rationales: string[] = [];
    let capabilitiesSet = new Set<string>();
    let isEmergencyBypass = false;

    if (triggeredEmergencyRules.length > 0) {
      finalPathway = 'EMERGENCY';
      isEmergencyBypass = true;
      for (const rule of triggeredEmergencyRules) {
        triggeredRuleIds.push(rule.ruleId);
        rationales.push(rule.clinicalRationale);
        rule.recommendedCapabilities.forEach((c) => capabilitiesSet.add(c));
      }
    } else if (triggeredSameDayRules.length > 0) {
      finalPathway = 'SAME_DAY';
      isEmergencyBypass = false;
      for (const rule of triggeredSameDayRules) {
        triggeredRuleIds.push(rule.ruleId);
        rationales.push(rule.clinicalRationale);
        rule.recommendedCapabilities.forEach((c) => capabilitiesSet.add(c));
      }
    } else {
      finalPathway = 'ROUTINE';
      isEmergencyBypass = false;
      const matched = triggeredRoutineRules.length > 0 ? triggeredRoutineRules[0] : safetyRulesCatalog[safetyRulesCatalog.length - 1];
      triggeredRuleIds.push(matched.ruleId);
      rationales.push(matched.clinicalRationale);
      matched.recommendedCapabilities.forEach((c) => capabilitiesSet.add(c));
    }

    const assessment: SafetyAssessment = {
      id: uuidv4(),
      caseId: facts.caseId,
      ruleSetVersion: config.RULE_SET_VERSION,
      triagedPathway: finalPathway,
      triggeredRuleIds,
      clinicalRationale: rationales.join(' | '),
      recommendedCapabilities: Array.from(capabilitiesSet),
      isEmergencyBypass,
      inputFactsSnapshot: facts,
      evaluatedAt: new Date(),
    };

    // Save immutable assessment record
    await db.saveAssessment(assessment);
    return assessment;
  }

  async getAssessmentByCaseId(caseId: string): Promise<SafetyAssessment | null> {
    return db.findAssessmentByCaseId(caseId);
  }

  getActiveRuleSetInfo(): {
    versionTag: string;
    totalRules: number;
    governanceStatus: string;
  } {
    return {
      versionTag: config.RULE_SET_VERSION,
      totalRules: safetyRulesCatalog.length,
      governanceStatus: config.CLINICAL_GOVERNANCE_STATUS,
    };
  }
}

export const safetyEngineService = new SafetyEngineService();
