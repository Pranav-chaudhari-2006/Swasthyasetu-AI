import { db } from '../db/database';
import { Facility, FacilityCapability, FacilityTier, CapabilityStatus, FacilityWithCapabilities } from '../types';

export class FacilityService {
  async registerFacility(data: {
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
    return db.createFacility(data);
  }

  async getFacilityById(id: string): Promise<FacilityWithCapabilities | null> {
    return db.getFacilityWithCapabilities(id);
  }

  async getFacilityByCode(code: string): Promise<Facility | null> {
    return db.findFacilityByCode(code);
  }

  async listFacilities(filter?: { district?: string; tier?: FacilityTier }): Promise<Facility[]> {
    return db.listFacilities(filter);
  }

  async updateCapability(data: {
    facilityId: string;
    capabilityCode: string;
    category: string;
    status: CapabilityStatus;
    availableUnits?: number;
    verifiedBy?: string;
    verificationSource?: string;
    metadata?: Record<string, unknown>;
  }): Promise<FacilityCapability> {
    return db.upsertCapability(data);
  }

  async batchUpdateCapabilities(
    facilityId: string,
    capabilities: Array<{
      capabilityCode: string;
      category: string;
      status: CapabilityStatus;
      availableUnits?: number;
      metadata?: Record<string, unknown>;
    }>,
    verifiedBy?: string
  ): Promise<FacilityCapability[]> {
    const results: FacilityCapability[] = [];
    for (const cap of capabilities) {
      const updated = await db.upsertCapability({
        facilityId,
        capabilityCode: cap.capabilityCode,
        category: cap.category,
        status: cap.status,
        availableUnits: cap.availableUnits,
        verifiedBy,
        verificationSource: 'ADMIN_PORTAL_BATCH',
        metadata: cap.metadata,
      });
      results.push(updated);
    }
    return results;
  }
}

export const facilityService = new FacilityService();
