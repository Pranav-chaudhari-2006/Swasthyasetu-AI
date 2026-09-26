import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import {
  EmergencyEvent,
  EmergencyStatus,
  EmergencyTelemetryLog,
  EmergencyRedirectRecord,
  LiveLocationTelemetry
} from '../types';

export class EmergencyService {
  private static generateMEMSReference(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(10000 + Math.random() * 90000).toString();
    return `MEMS-108-${year}-${randomHex}`;
  }

  /**
   * Dispatch emergency transport with immediate facility reservation & bypass
   */
  public static async dispatchEmergency(input: {
    caseId: string;
    patientId: string;
    triggeredByActorId: string;
    triggeredByActorRole: string;
    emergencyClassification: string;
    emergencyReason: string;
    patientLocationLat: number;
    patientLocationLng: number;
    allocatedFacilityId: string;
    transportMode?: string;
    mems108Reference?: string;
    driverName?: string;
    driverContact?: string;
    vehicleNumber?: string;
    estimatedArrivalMinutes?: number;
  }): Promise<EmergencyEvent> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const memsRef = input.mems108Reference || this.generateMEMSReference();

    const initialTelemetry: LiveLocationTelemetry = {
      latitude: input.patientLocationLat,
      longitude: input.patientLocationLng,
      lastUpdated: now
    };

    const event: EmergencyEvent = {
      id,
      caseId: input.caseId,
      patientId: input.patientId,
      triggeredByActorId: input.triggeredByActorId,
      triggeredByActorRole: input.triggeredByActorRole,
      emergencyClassification: input.emergencyClassification,
      emergencyReason: input.emergencyReason,
      patientLocationLat: input.patientLocationLat,
      patientLocationLng: input.patientLocationLng,
      allocatedFacilityId: input.allocatedFacilityId,
      transportMode: input.transportMode || 'AMBULANCE_108',
      mems108Reference: memsRef,
      driverName: input.driverName || null,
      driverContact: input.driverContact || null,
      vehicleNumber: input.vehicleNumber || null,
      status: 'DISPATCHED',
      estimatedArrivalMinutes: input.estimatedArrivalMinutes || 20,
      liveLocation: initialTelemetry,
      redirectHistory: [],
      handoffNotes: null,
      receivingPhysicianId: null,
      createdAt: now,
      updatedAt: now,
      arrivedAt: null,
      handoffCompletedAt: null
    };

    return await db.createEmergencyEvent(event);
  }

  /**
   * Update emergency transport lifecycle status
   */
  public static async updateStatus(
    eventId: string,
    status: EmergencyStatus,
    actorId: string,
    actorRole: string,
    options?: { estimatedArrivalMinutes?: number; notes?: string }
  ): Promise<EmergencyEvent> {
    const event = await db.getEmergencyEventById(eventId);
    if (!event) throw new Error(`Emergency event ${eventId} not found`);

    const now = new Date().toISOString();
    const updates: Partial<EmergencyEvent> = {
      status,
      updatedAt: now
    };

    if (options?.estimatedArrivalMinutes !== undefined) {
      updates.estimatedArrivalMinutes = options.estimatedArrivalMinutes;
    }

    if (status === 'ARRIVED_ER' && !event.arrivedAt) {
      updates.arrivedAt = now;
    }

    return await db.updateEmergencyEvent(eventId, updates);
  }

  /**
   * Record live GPS telemetry breadcrumb and update live location
   */
  public static async recordTelemetry(
    eventId: string,
    telemetry: { latitude: number; longitude: number; speedKmh?: number; headingDeg?: number }
  ): Promise<EmergencyEvent> {
    const event = await db.getEmergencyEventById(eventId);
    if (!event) throw new Error(`Emergency event ${eventId} not found`);

    const now = new Date().toISOString();
    const log: EmergencyTelemetryLog = {
      id: uuidv4(),
      emergencyEventId: eventId,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      speedKmh: telemetry.speedKmh || null,
      headingDeg: telemetry.headingDeg || null,
      recordedAt: now
    };

    await db.addTelemetryLog(log);

    const liveLocation: LiveLocationTelemetry = {
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      speedKmh: telemetry.speedKmh,
      headingDeg: telemetry.headingDeg,
      lastUpdated: now
    };

    return await db.updateEmergencyEvent(eventId, { liveLocation });
  }

  /**
   * Dynamic Redirection of en-route emergency vehicle to a different ER facility
   */
  public static async redirectEmergency(
    eventId: string,
    newFacilityId: string,
    actorId: string,
    actorRole: string,
    reason: string
  ): Promise<EmergencyEvent> {
    const event = await db.getEmergencyEventById(eventId);
    if (!event) throw new Error(`Emergency event ${eventId} not found`);

    if (event.status === 'HANDOFF_COMPLETED' || event.status === 'CANCELLED') {
      throw new Error(`Cannot redirect emergency event in terminal state: ${event.status}`);
    }

    const now = new Date().toISOString();
    const redirectEntry: EmergencyRedirectRecord = {
      previousFacilityId: event.allocatedFacilityId,
      newFacilityId,
      redirectedByActorId: actorId,
      redirectedByRole: actorRole,
      reason,
      redirectedAt: now
    };

    const redirectHistory = [...event.redirectHistory, redirectEntry];

    return await db.updateEmergencyEvent(eventId, {
      allocatedFacilityId: newFacilityId,
      redirectHistory
    });
  }

  /**
   * Complete physical ER clinical handoff
   */
  public static async completeHandoff(
    eventId: string,
    receivingPhysicianId: string,
    handoffNotes: string,
    vitalsOnArrival?: Record<string, any>
  ): Promise<EmergencyEvent> {
    const event = await db.getEmergencyEventById(eventId);
    if (!event) throw new Error(`Emergency event ${eventId} not found`);

    const now = new Date().toISOString();
    return await db.updateEmergencyEvent(eventId, {
      status: 'HANDOFF_COMPLETED',
      receivingPhysicianId,
      handoffNotes: vitalsOnArrival 
        ? `${handoffNotes} | Vitals on Arrival: ${JSON.stringify(vitalsOnArrival)}` 
        : handoffNotes,
      handoffCompletedAt: now,
      arrivedAt: event.arrivedAt || now
    });
  }

  public static async getEventDetails(eventId: string): Promise<{ event: EmergencyEvent; telemetry: EmergencyTelemetryLog[] } | null> {
    const event = await db.getEmergencyEventById(eventId);
    if (!event) return null;
    const telemetry = await db.getTelemetryLogs(eventId);
    return { event, telemetry };
  }

  public static async getCaseEmergency(caseId: string): Promise<EmergencyEvent | null> {
    return await db.getEmergencyEventByCaseId(caseId);
  }

  public static async getFacilityActiveEmergencies(facilityId: string): Promise<EmergencyEvent[]> {
    return await db.getActiveEmergencyEventsForFacility(facilityId);
  }
}
