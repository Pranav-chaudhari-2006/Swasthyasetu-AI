import { ReferralState, ReferralPathway } from '../types';

export interface StateTransitionValidationResult {
  isValid: boolean;
  reason?: string;
}

export class ReferralStateMachine {
  private static readonly VALID_TRANSITIONS: Record<ReferralState, ReferralState[]> = {
    ISSUED: ['ACCEPTED', 'DECLINED', 'CANCELLED', 'EN_ROUTE', 'ARRIVED'],
    ACCEPTED: ['EN_ROUTE', 'ARRIVED', 'CANCELLED'],
    DECLINED: ['ISSUED', 'CLOSED'],
    CANCELLED: [],
    EN_ROUTE: ['ARRIVED', 'CANCELLED'],
    ARRIVED: ['TREATED', 'ADMITTED', 'CLOSED'],
    TREATED: ['DISCHARGED', 'ADMITTED', 'CLOSED'],
    ADMITTED: ['DISCHARGED'],
    DISCHARGED: ['CLOSED'],
    CLOSED: []
  };

  /**
   * Validate if a transition from currentState to targetState is legally allowed
   */
  public static validateTransition(
    currentState: ReferralState,
    targetState: ReferralState,
    options: {
      pathway: ReferralPathway;
      emergencyBypass?: boolean;
      declineReason?: string;
      outcome?: string;
    }
  ): StateTransitionValidationResult {
    if (currentState === targetState) {
      return { isValid: false, reason: `Referral is already in ${currentState} state.` };
    }

    const allowedNext = this.VALID_TRANSITIONS[currentState] || [];
    if (!allowedNext.includes(targetState)) {
      return {
        isValid: false,
        reason: `Illegal state transition from ${currentState} to ${targetState}. Allowed transitions: [${allowedNext.join(', ')}].`
      };
    }

    // Direct jump from ISSUED to EN_ROUTE or ARRIVED requires EMERGENCY or emergencyBypass
    if (currentState === 'ISSUED' && (targetState === 'EN_ROUTE' || targetState === 'ARRIVED')) {
      if (options.pathway !== 'EMERGENCY' && !options.emergencyBypass) {
        return {
          isValid: false,
          reason: `Direct transition from ISSUED to ${targetState} is only allowed for EMERGENCY pathway or emergency bypass.`
        };
      }
    }

    // DECLINED requires a mandatory decline reason
    if (targetState === 'DECLINED' && (!options.declineReason || options.declineReason.trim().length < 5)) {
      return {
        isValid: false,
        reason: 'Declining a referral requires a mandatory explanatory reason of at least 5 characters.'
      };
    }

    return { isValid: true };
  }
}
