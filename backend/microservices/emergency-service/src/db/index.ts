import { Pool } from 'pg';
import { config } from '../config';
import { EmergencyEvent, EmergencyTelemetryLog, EmergencyStatus } from '../types';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory fallback stores
  private inMemoryEvents: Map<string, EmergencyEvent> = new Map();
  private inMemoryTelemetry: EmergencyTelemetryLog[] = [];

  constructor() {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_HOST) {
      try {
        this.pool = new Pool({
          host: config.database.host,
          port: config.database.port,
          user: config.database.user,
          password: config.database.password,
          database: config.database.database,
          connectionTimeoutMillis: 2000,
        });
      } catch (err) {
        this.pool = null;
      }
    }
  }

  async init(): Promise<void> {
    if (!this.pool) {
      this.isConnected = false;
      return;
    }
    try {
      const client = await this.pool.connect();
      this.isConnected = true;
      client.release();
    } catch (err) {
      this.isConnected = false;
    }
  }

  async createEmergencyEvent(event: EmergencyEvent): Promise<EmergencyEvent> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO emergency_events (
          id, case_id, patient_id, triggered_by_actor_id, triggered_by_actor_role,
          emergency_classification, emergency_reason, patient_location_lat, patient_location_lng,
          allocated_facility_id, transport_mode, mems_108_reference, driver_name,
          driver_contact, vehicle_number, status, estimated_arrival_minutes,
          live_location, redirect_history, handoff_notes, receiving_physician_id,
          created_at, updated_at, arrived_at, handoff_completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        event.id,
        event.caseId,
        event.patientId,
        event.triggeredByActorId,
        event.triggeredByActorRole,
        event.emergencyClassification,
        event.emergencyReason,
        event.patientLocationLat,
        event.patientLocationLng,
        event.allocatedFacilityId,
        event.transportMode,
        event.mems108Reference,
        event.driverName || null,
        event.driverContact || null,
        event.vehicleNumber || null,
        event.status,
        event.estimatedArrivalMinutes || null,
        event.liveLocation ? JSON.stringify(event.liveLocation) : null,
        JSON.stringify(event.redirectHistory || []),
        event.handoffNotes || null,
        event.receivingPhysicianId || null,
        event.createdAt,
        event.updatedAt,
        event.arrivedAt || null,
        event.handoffCompletedAt || null
      ]);
      return this.mapRowToEmergencyEvent(res.rows[0]);
    }

    this.inMemoryEvents.set(event.id, { ...event });
    return event;
  }

  async getEmergencyEventById(id: string): Promise<EmergencyEvent | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM emergency_events WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToEmergencyEvent(res.rows[0]);
    }
    const found = this.inMemoryEvents.get(id);
    return found ? { ...found } : null;
  }

  async getEmergencyEventByCaseId(caseId: string): Promise<EmergencyEvent | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM emergency_events WHERE case_id = $1 ORDER BY created_at DESC LIMIT 1',
        [caseId]
      );
      if (res.rows.length === 0) return null;
      return this.mapRowToEmergencyEvent(res.rows[0]);
    }
    const matches = Array.from(this.inMemoryEvents.values())
      .filter(e => e.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return matches.length > 0 ? { ...matches[0] } : null;
  }

  async getActiveEmergencyEventsForFacility(facilityId: string): Promise<EmergencyEvent[]> {
    const activeStatuses: EmergencyStatus[] = [
      'DISPATCHED',
      'EN_ROUTE_SCENE',
      'PATIENT_ONBOARD',
      'EN_ROUTE_ER',
      'ARRIVED_ER'
    ];

    if (this.isConnected && this.pool) {
      const query = `
        SELECT * FROM emergency_events
        WHERE allocated_facility_id = $1 AND status = ANY($2)
        ORDER BY created_at DESC;
      `;
      const res = await this.pool.query(query, [facilityId, activeStatuses]);
      return res.rows.map(r => this.mapRowToEmergencyEvent(r));
    }

    return Array.from(this.inMemoryEvents.values())
      .filter(e => e.allocatedFacilityId === facilityId && activeStatuses.includes(e.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateEmergencyEvent(id: string, updates: Partial<EmergencyEvent>): Promise<EmergencyEvent> {
    const now = new Date().toISOString();

    if (this.isConnected && this.pool) {
      const existing = await this.getEmergencyEventById(id);
      if (!existing) throw new Error(`Emergency event ${id} not found`);

      const updated = { ...existing, ...updates, updatedAt: now };
      const query = `
        UPDATE emergency_events
        SET allocated_facility_id = $2,
            status = $3,
            estimated_arrival_minutes = $4,
            live_location = $5,
            redirect_history = $6,
            handoff_notes = $7,
            receiving_physician_id = $8,
            updated_at = $9,
            arrived_at = $10,
            handoff_completed_at = $11
        WHERE id = $1
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        id,
        updated.allocatedFacilityId,
        updated.status,
        updated.estimatedArrivalMinutes || null,
        updated.liveLocation ? JSON.stringify(updated.liveLocation) : null,
        JSON.stringify(updated.redirectHistory || []),
        updated.handoffNotes || null,
        updated.receivingPhysicianId || null,
        updated.updatedAt,
        updated.arrivedAt || null,
        updated.handoffCompletedAt || null
      ]);
      return this.mapRowToEmergencyEvent(res.rows[0]);
    }

    const existing = this.inMemoryEvents.get(id);
    if (!existing) throw new Error(`Emergency event ${id} not found`);

    const updated: EmergencyEvent = {
      ...existing,
      ...updates,
      updatedAt: now
    };
    this.inMemoryEvents.set(id, updated);
    return updated;
  }

  async addTelemetryLog(log: EmergencyTelemetryLog): Promise<EmergencyTelemetryLog> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO emergency_telemetry_logs (
          id, emergency_event_id, latitude, longitude, speed_kmh, heading_deg, recorded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      await this.pool.query(query, [
        log.id,
        log.emergencyEventId,
        log.latitude,
        log.longitude,
        log.speedKmh || null,
        log.headingDeg || null,
        log.recordedAt
      ]);
      return log;
    }

    this.inMemoryTelemetry.push(log);
    return log;
  }

  async getTelemetryLogs(eventId: string): Promise<EmergencyTelemetryLog[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM emergency_telemetry_logs WHERE emergency_event_id = $1 ORDER BY recorded_at ASC',
        [eventId]
      );
      return res.rows.map(r => ({
        id: r.id,
        emergencyEventId: r.emergency_event_id,
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
        speedKmh: r.speed_kmh ? parseFloat(r.speed_kmh) : null,
        headingDeg: r.heading_deg ? parseFloat(r.heading_deg) : null,
        recordedAt: r.recorded_at
      }));
    }

    return this.inMemoryTelemetry
      .filter(t => t.emergencyEventId === eventId)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  }

  async clear(): Promise<void> {
    this.inMemoryEvents.clear();
    this.inMemoryTelemetry = [];
  }

  private mapRowToEmergencyEvent(row: any): EmergencyEvent {
    return {
      id: row.id,
      caseId: row.case_id,
      patientId: row.patient_id,
      triggeredByActorId: row.triggered_by_actor_id,
      triggeredByActorRole: row.triggered_by_actor_role,
      emergencyClassification: row.emergency_classification,
      emergencyReason: row.emergency_reason,
      patientLocationLat: parseFloat(row.patient_location_lat),
      patientLocationLng: parseFloat(row.patient_location_lng),
      allocatedFacilityId: row.allocated_facility_id,
      transportMode: row.transport_mode,
      mems108Reference: row.mems_108_reference,
      driverName: row.driver_name,
      driverContact: row.driver_contact,
      vehicleNumber: row.vehicle_number,
      status: row.status,
      estimatedArrivalMinutes: row.estimated_arrival_minutes,
      liveLocation: row.live_location ? (typeof row.live_location === 'string' ? JSON.parse(row.live_location) : row.live_location) : null,
      redirectHistory: row.redirect_history ? (typeof row.redirect_history === 'string' ? JSON.parse(row.redirect_history) : row.redirect_history) : [],
      handoffNotes: row.handoff_notes,
      receivingPhysicianId: row.receiving_physician_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      arrivedAt: row.arrived_at,
      handoffCompletedAt: row.handoff_completed_at
    };
  }
}

export const db = new Database();
