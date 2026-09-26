import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { QRService } from './qrService';
import { ReferralStateMachine } from './stateMachine';
import {
  Referral,
  ReferralStateTransition,
  CreateReferralInput,
  ReferralState,
  ReferralPathway
} from '../types';

export class ReferralService {
  /**
   * Generates durable referral code formatted as SS-REF-YYYY-XXXXX
   */
  private static generateReferralCode(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(10000 + Math.random() * 90000).toString();
    return `SS-REF-${year}-${randomHex}`;
  }

  /**
   * Create a new clinical referral with initial ISSUED state & QR code
   */
  public static async createReferral(input: CreateReferralInput): Promise<{ referral: Referral; qrDataUrl: string; qrToken: string }> {
    const id = uuidv4();
    const referralCode = this.generateReferralCode();
    const now = new Date().toISOString();

    const { token, tokenHash, qrDataUrl } = await QRService.generateQR({
      referralId: id,
      referralCode,
      patientId: input.patientId,
      caseId: input.caseId,
      destinationFacilityId: input.destinationFacilityId,
      pathway: input.pathway
    });

    const referral: Referral = {
      id,
      referralCode,
      caseId: input.caseId,
      patientId: input.patientId,
      sourceFacilityId: input.sourceFacilityId || null,
      originatingActorId: input.originatingActorId,
      originatingActorRole: input.originatingActorRole,
      destinationFacilityId: input.destinationFacilityId,
      pathway: input.pathway,
      requiredCapabilities: input.requiredCapabilities || [],
      clinicalSummary: input.clinicalSummary,
      currentState: 'ISSUED',
      qrTokenHash: tokenHash,
      transportDetails: null,
      declineReason: null,
      emergencyBypass: input.emergencyBypass || input.pathway === 'EMERGENCY',
      createdAt: now,
      updatedAt: now
    };

    const initialTransition: ReferralStateTransition = {
      id: uuidv4(),
      referralId: id,
      fromState: 'ISSUED',
      toState: 'ISSUED',
      actorId: input.originatingActorId,
      actorRole: input.originatingActorRole,
      facilityId: input.sourceFacilityId || null,
      reason: 'Initial referral creation',
      metadata: { pathway: input.pathway, emergencyBypass: referral.emergencyBypass },
      transitionedAt: now
    };

    const saved = await db.createReferral(referral, initialTransition);
    return { referral: saved, qrDataUrl, qrToken: token };
  }

  /**
   * Destination facility coordinator accepts incoming referral
   */
  public static async acceptReferral(
    referralId: string,
    staffId: string,
    staffRole: string,
    facilityId: string,
    notes?: string
  ): Promise<Referral> {
    const referral = await db.getReferralById(referralId);
    if (!referral) throw new Error(`Referral ${referralId} not found`);

    if (referral.destinationFacilityId !== facilityId) {
      throw new Error(`Unauthorized: Referral destination does not match facility ${facilityId}`);
    }

    const validation = ReferralStateMachine.validateTransition(referral.currentState, 'ACCEPTED', {
      pathway: referral.pathway,
      emergencyBypass: referral.emergencyBypass
    });
    if (!validation.isValid) throw new Error(validation.reason);

    const now = new Date().toISOString();
    const transition: ReferralStateTransition = {
      id: uuidv4(),
      referralId,
      fromState: referral.currentState,
      toState: 'ACCEPTED',
      actorId: staffId,
      actorRole: staffRole,
      facilityId,
      reason: notes || 'Facility accepted referral',
      metadata: { notes },
      transitionedAt: now
    };

    return await db.updateReferralState(referralId, 'ACCEPTED', transition);
  }

  /**
   * Destination facility coordinator declines incoming referral with mandatory reason
   */
  public static async declineReferral(
    referralId: string,
    staffId: string,
    staffRole: string,
    facilityId: string,
    reason: string,
    alternativeFacilitySuggestions?: string[]
  ): Promise<Referral> {
    const referral = await db.getReferralById(referralId);
    if (!referral) throw new Error(`Referral ${referralId} not found`);

    if (referral.destinationFacilityId !== facilityId) {
      throw new Error(`Unauthorized: Referral destination does not match facility ${facilityId}`);
    }

    const validation = ReferralStateMachine.validateTransition(referral.currentState, 'DECLINED', {
      pathway: referral.pathway,
      emergencyBypass: referral.emergencyBypass,
      declineReason: reason
    });
    if (!validation.isValid) throw new Error(validation.reason);

    const now = new Date().toISOString();
    const transition: ReferralStateTransition = {
      id: uuidv4(),
      referralId,
      fromState: referral.currentState,
      toState: 'DECLINED',
      actorId: staffId,
      actorRole: staffRole,
      facilityId,
      reason,
      metadata: { alternativeFacilitySuggestions: alternativeFacilitySuggestions || [] },
      transitionedAt: now
    };

    return await db.updateReferralState(referralId, 'DECLINED', transition, {
      declineReason: reason
    });
  }

  /**
   * Patient or frontline worker marks referral en route
   */
  public static async markEnRoute(
    referralId: string,
    actorId: string,
    actorRole: string,
    transportDetails: {
      transportMode: string;
      estimatedArrivalMinutes?: number;
      driverContact?: string;
      vehicleNumber?: string;
    }
  ): Promise<Referral> {
    const referral = await db.getReferralById(referralId);
    if (!referral) throw new Error(`Referral ${referralId} not found`);

    const validation = ReferralStateMachine.validateTransition(referral.currentState, 'EN_ROUTE', {
      pathway: referral.pathway,
      emergencyBypass: referral.emergencyBypass
    });
    if (!validation.isValid) throw new Error(validation.reason);

    const now = new Date().toISOString();
    const transition: ReferralStateTransition = {
      id: uuidv4(),
      referralId,
      fromState: referral.currentState,
      toState: 'EN_ROUTE',
      actorId,
      actorRole,
      reason: `Patient en route via ${transportDetails.transportMode}`,
      metadata: transportDetails,
      transitionedAt: now
    };

    return await db.updateReferralState(referralId, 'EN_ROUTE', transition, {
      transportDetails
    });
  }

  /**
   * Verify QR token and record physical arrival at destination facility
   */
  public static async verifyArrival(
    qrToken: string,
    scannerFacilityId: string,
    scannerStaffId: string,
    scannerStaffRole: string,
    triageNotes?: string
  ): Promise<{ referral: Referral; arrivalConfirmed: boolean }> {
    const qrResult = QRService.verifyQRToken(qrToken);
    if (!qrResult.isValid || !qrResult.payload) {
      throw new Error(qrResult.error || 'Invalid QR code token');
    }

    const { referralId, destinationFacilityId, pathway } = qrResult.payload;
    const referral = await db.getReferralById(referralId);
    if (!referral) throw new Error(`Referral ${referralId} not found in registry`);

    // Destination facility match check (allow emergency redirect if emergency bypass is active)
    if (destinationFacilityId !== scannerFacilityId && !referral.emergencyBypass && pathway !== 'EMERGENCY') {
      throw new Error(`Arrival scan facility mismatch: Referral destined for ${destinationFacilityId}, scanned at ${scannerFacilityId}`);
    }

    // If already arrived, return idempotently
    if (referral.currentState === 'ARRIVED') {
      return { referral, arrivalConfirmed: true };
    }

    const validation = ReferralStateMachine.validateTransition(referral.currentState, 'ARRIVED', {
      pathway: referral.pathway,
      emergencyBypass: referral.emergencyBypass
    });
    if (!validation.isValid) throw new Error(validation.reason);

    const now = new Date().toISOString();
    const transition: ReferralStateTransition = {
      id: uuidv4(),
      referralId,
      fromState: referral.currentState,
      toState: 'ARRIVED',
      actorId: scannerStaffId,
      actorRole: scannerStaffRole,
      facilityId: scannerFacilityId,
      reason: triageNotes || 'Physical arrival confirmed via cryptographic QR scan',
      metadata: {
        scannerFacilityId,
        scannedAt: now,
        isEmergencyRedirect: destinationFacilityId !== scannerFacilityId
      },
      transitionedAt: now
    };

    const updates: Partial<Referral> = {};
    if (destinationFacilityId !== scannerFacilityId) {
      updates.destinationFacilityId = scannerFacilityId;
    }

    const updated = await db.updateReferralState(referralId, 'ARRIVED', transition, updates);
    return { referral: updated, arrivalConfirmed: true };
  }

  /**
   * Update clinical outcome at facility: TREATED, ADMITTED, DISCHARGED, CLOSED
   */
  public static async updateOutcome(
    referralId: string,
    targetState: ReferralState,
    staffId: string,
    staffRole: string,
    facilityId: string,
    details: { outcome?: string; dischargeSummary?: string; notes?: string }
  ): Promise<Referral> {
    const referral = await db.getReferralById(referralId);
    if (!referral) throw new Error(`Referral ${referralId} not found`);

    const validation = ReferralStateMachine.validateTransition(referral.currentState, targetState, {
      pathway: referral.pathway,
      emergencyBypass: referral.emergencyBypass,
      outcome: details.outcome
    });
    if (!validation.isValid) throw new Error(validation.reason);

    const now = new Date().toISOString();
    const transition: ReferralStateTransition = {
      id: uuidv4(),
      referralId,
      fromState: referral.currentState,
      toState: targetState,
      actorId: staffId,
      actorRole: staffRole,
      facilityId,
      reason: details.dischargeSummary || details.notes || `Referral progressed to ${targetState}`,
      metadata: details,
      transitionedAt: now
    };

    return await db.updateReferralState(referralId, targetState, transition);
  }

  /**
   * Re-route declined referral to new destination facility
   */
  public static async rerouteReferral(
    referralId: string,
    newDestinationFacilityId: string,
    actorId: string,
    actorRole: string,
    reason: string
  ): Promise<{ referral: Referral; qrDataUrl: string; qrToken: string }> {
    const referral = await db.getReferralById(referralId);
    if (!referral) throw new Error(`Referral ${referralId} not found`);

    if (referral.currentState !== 'DECLINED') {
      throw new Error(`Only DECLINED referrals can be re-routed. Current state is ${referral.currentState}`);
    }

    const now = new Date().toISOString();
    const { token, tokenHash, qrDataUrl } = await QRService.generateQR({
      referralId: referral.id,
      referralCode: referral.referralCode,
      patientId: referral.patientId,
      caseId: referral.caseId,
      destinationFacilityId: newDestinationFacilityId,
      pathway: referral.pathway
    });

    const transition: ReferralStateTransition = {
      id: uuidv4(),
      referralId,
      fromState: 'DECLINED',
      toState: 'ISSUED',
      actorId,
      actorRole,
      facilityId: newDestinationFacilityId,
      reason: `Re-routed to new facility ${newDestinationFacilityId}: ${reason}`,
      metadata: { previousDestination: referral.destinationFacilityId, newDestination: newDestinationFacilityId },
      transitionedAt: now
    };

    const updated = await db.updateReferralState(referralId, 'ISSUED', transition, {
      destinationFacilityId: newDestinationFacilityId,
      declineReason: null,
      qrTokenHash: tokenHash
    });

    return { referral: updated, qrDataUrl, qrToken: token };
  }

  public static async getReferralDetails(id: string): Promise<{ referral: Referral; transitions: ReferralStateTransition[] } | null> {
    const referral = await db.getReferralById(id);
    if (!referral) return null;
    const transitions = await db.getTransitionsByReferralId(id);
    return { referral, transitions };
  }

  public static async getFacilityInbox(
    facilityId: string,
    filters?: { state?: ReferralState; pathway?: ReferralPathway }
  ): Promise<Referral[]> {
    return await db.getFacilityInbox(facilityId, filters);
  }

  public static async getPatientReferrals(patientId: string): Promise<Referral[]> {
    return await db.getReferralsByPatientId(patientId);
  }

  public static async getCaseReferrals(caseId: string): Promise<Referral[]> {
    return await db.getReferralsByCaseId(caseId);
  }
}
