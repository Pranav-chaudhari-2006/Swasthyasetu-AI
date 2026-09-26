import { Pool } from 'pg';
import { config } from '../config';
import { Facility, FacilityCapability, FacilityTier, CapabilityStatus, FacilityWithCapabilities } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory backing store for robust fallback & fast standalone test execution
  private facilities: Map<string, Facility> = new Map();
  private capabilities: Map<string, FacilityCapability[]> = new Map(); // facilityId -> capabilities[]

  constructor() {
    try {
      this.pool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        console.warn('[Facility DB] PostgreSQL pool error (fallback active):', err.message);
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isConnected = true;
      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  // --- Facility Master Operations ---
  async createFacility(data: {
    facilityCode: string;
    name: string;
    facilityTier: FacilityTier;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    address?: string;
    phone?: string;
    operatingHours?: Record<string, string>;
  }): Promise<Facility> {
    const facility: Facility = {
      id: uuidv4(),
      facilityCode: data.facilityCode,
      name: data.name,
      facilityTier: data.facilityTier,
      district: data.district,
      state: data.state,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      phone: data.phone,
      operatingHours: data.operatingHours || { status: '24X7' },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO facilities (id, facility_code, name, facility_tier, district, state, latitude, longitude, address, phone, operating_hours, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
          [
            facility.id,
            facility.facilityCode,
            facility.name,
            facility.facilityTier,
            facility.district,
            facility.state,
            facility.latitude,
            facility.longitude,
            facility.address,
            facility.phone,
            JSON.stringify(facility.operatingHours),
            facility.isActive,
            facility.createdAt,
            facility.updatedAt,
          ]
        );
        return this.mapFacilityRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.facilities.set(facility.id, facility);
    return facility;
  }

  async findFacilityById(id: string): Promise<Facility | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM facilities WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapFacilityRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.facilities.get(id) || null;
  }

  async findFacilityByCode(code: string): Promise<Facility | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM facilities WHERE facility_code = $1', [code]);
        if (res.rows.length === 0) return null;
        return this.mapFacilityRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    for (const fac of this.facilities.values()) {
      if (fac.facilityCode === code) return fac;
    }
    return null;
  }

  async listFacilities(filter?: { district?: string; tier?: FacilityTier }): Promise<Facility[]> {
    if (this.isConnected && this.pool) {
      try {
        let query = 'SELECT * FROM facilities WHERE is_active = TRUE';
        const params: unknown[] = [];
        if (filter?.district) {
          params.push(filter.district);
          query += ` AND district = $${params.length}`;
        }
        if (filter?.tier) {
          params.push(filter.tier);
          query += ` AND facility_tier = $${params.length}`;
        }
        const res = await this.pool.query(query, params);
        return res.rows.map((row) => this.mapFacilityRow(row));
      } catch {
        // fallback
      }
    }

    let list = Array.from(this.facilities.values()).filter((f) => f.isActive);
    if (filter?.district) list = list.filter((f) => f.district.toLowerCase() === filter.district?.toLowerCase());
    if (filter?.tier) list = list.filter((f) => f.facilityTier === filter.tier);
    return list;
  }

  // --- Capability Operations ---
  async upsertCapability(data: {
    facilityId: string;
    capabilityCode: string;
    category: string;
    status: CapabilityStatus;
    availableUnits?: number;
    verifiedBy?: string;
    verificationSource?: string;
    metadata?: Record<string, unknown>;
  }): Promise<FacilityCapability> {
    const cap: FacilityCapability = {
      id: uuidv4(),
      facilityId: data.facilityId,
      capabilityCode: data.capabilityCode,
      category: data.category,
      status: data.status,
      availableUnits: data.availableUnits,
      lastVerifiedAt: new Date(),
      verifiedBy: data.verifiedBy,
      verificationSource: data.verificationSource || 'PORTAL_UPDATE',
      metadata: data.metadata,
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO facility_capabilities (id, facility_id, capability_code, category, status, available_units, last_verified_at, verified_by, verification_source, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (facility_id, capability_code)
           DO UPDATE SET status = EXCLUDED.status, available_units = EXCLUDED.available_units, last_verified_at = EXCLUDED.last_verified_at, verified_by = EXCLUDED.verified_by, metadata = EXCLUDED.metadata
           RETURNING *`,
          [
            cap.id,
            cap.facilityId,
            cap.capabilityCode,
            cap.category,
            cap.status,
            cap.availableUnits,
            cap.lastVerifiedAt,
            cap.verifiedBy,
            cap.verificationSource,
            JSON.stringify(cap.metadata || {}),
          ]
        );
        return this.mapCapabilityRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    const currentList = this.capabilities.get(data.facilityId) || [];
    const existingIndex = currentList.findIndex((c) => c.capabilityCode === data.capabilityCode);
    if (existingIndex >= 0) {
      currentList[existingIndex] = { ...currentList[existingIndex], ...cap, id: currentList[existingIndex].id };
    } else {
      currentList.push(cap);
    }
    this.capabilities.set(data.facilityId, currentList);
    return cap;
  }

  async getCapabilitiesForFacility(facilityId: string): Promise<FacilityCapability[]> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM facility_capabilities WHERE facility_id = $1', [facilityId]);
        return res.rows.map((row) => this.mapCapabilityRow(row));
      } catch {
        // fallback
      }
    }
    return this.capabilities.get(facilityId) || [];
  }

  async getFacilityWithCapabilities(facilityId: string): Promise<FacilityWithCapabilities | null> {
    const facility = await this.findFacilityById(facilityId);
    if (!facility) return null;
    const caps = await this.getCapabilitiesForFacility(facilityId);
    return { ...facility, capabilities: caps };
  }

  async listAllFacilitiesWithCapabilities(): Promise<FacilityWithCapabilities[]> {
    const facilities = await this.listFacilities();
    const results: FacilityWithCapabilities[] = [];
    for (const fac of facilities) {
      const caps = await this.getCapabilitiesForFacility(fac.id);
      results.push({ ...fac, capabilities: caps });
    }
    return results;
  }

  // Row Mappers
  private mapFacilityRow(row: any): Facility {
    return {
      id: row.id,
      facilityCode: row.facility_code,
      name: row.name,
      facilityTier: row.facility_tier as FacilityTier,
      district: row.district,
      state: row.state,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      address: row.address || undefined,
      phone: row.phone || undefined,
      operatingHours: typeof row.operating_hours === 'string' ? JSON.parse(row.operating_hours) : row.operating_hours,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapCapabilityRow(row: any): FacilityCapability {
    return {
      id: row.id,
      facilityId: row.facility_id,
      capabilityCode: row.capability_code,
      category: row.category,
      status: row.status as CapabilityStatus,
      availableUnits: row.available_units != null ? parseInt(row.available_units, 10) : undefined,
      lastVerifiedAt: new Date(row.last_verified_at),
      verifiedBy: row.verified_by || undefined,
      verificationSource: row.verification_source || undefined,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    };
  }

  clearMemory(): void {
    this.facilities.clear();
    this.capabilities.clear();
  }
}

export const db = new Database();
