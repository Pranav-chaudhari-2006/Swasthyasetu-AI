import { Request, Response } from 'express';
import { z } from 'zod';
import { facilityService } from '../services/facility.service';
import { routingService } from '../services/routing.service';
import { FacilityTier, CapabilityStatus } from '../types';

const facilityTiers = [
  'PHC',
  'CHC',
  'SUB_DISTRICT_HOSPITAL',
  'DISTRICT_HOSPITAL',
  'TERTIARY_MEDICAL_COLLEGE',
  'PRIVATE_EMPANELLED',
] as const;

const capabilityStatuses = [
  'VERIFIED_AVAILABLE',
  'LOW_CAPACITY',
  'OUT_OF_STOCK',
  'NOT_FUNCTIONAL',
  'NOT_AVAILABLE',
  'UNVERIFIED',
] as const;

const createFacilitySchema = z.object({
  facilityCode: z.string().min(2),
  name: z.string().min(2),
  facilityTier: z.enum(facilityTiers),
  district: z.string().min(2),
  state: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  phone: z.string().optional(),
  operatingHours: z.record(z.string()).optional(),
});

const updateCapabilitySchema = z.object({
  capabilityCode: z.string().min(2),
  category: z.string().min(2),
  status: z.enum(capabilityStatuses),
  availableUnits: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const batchUpdateCapabilitiesSchema = z.object({
  capabilities: z.array(updateCapabilitySchema),
});

const routeMatchSchema = z.object({
  requiredCapabilities: z.array(z.string()).default([]),
  userLatitude: z.number().min(-90).max(90),
  userLongitude: z.number().min(-180).max(180),
  maxDistanceKm: z.number().positive().optional(),
  emergencyMode: z.boolean().optional(),
  tierPreference: z.array(z.enum(facilityTiers)).optional(),
});

export class FacilityController {
  async createFacility(req: Request, res: Response): Promise<void> {
    const parse = createFacilitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const facility = await facilityService.registerFacility(parse.data);
      res.status(201).json({ success: true, facility });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getFacility(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const facility = await facilityService.getFacilityById(id);
      if (!facility) {
        res.status(404).json({ error: 'FACILITY_NOT_FOUND' });
        return;
      }
      res.status(200).json({ success: true, facility });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async listFacilities(req: Request, res: Response): Promise<void> {
    try {
      const district = req.query.district as string | undefined;
      const tier = req.query.tier as FacilityTier | undefined;
      const facilities = await facilityService.listFacilities({ district, tier });
      res.status(200).json({ success: true, count: facilities.length, facilities });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async updateCapability(req: Request, res: Response): Promise<void> {
    const { id: facilityId } = req.params;
    const parse = updateCapabilitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const capability = await facilityService.updateCapability({
        facilityId,
        ...parse.data,
      });
      res.status(200).json({ success: true, capability });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async batchUpdateCapabilities(req: Request, res: Response): Promise<void> {
    const { id: facilityId } = req.params;
    const parse = batchUpdateCapabilitiesSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const capabilities = await facilityService.batchUpdateCapabilities(
        facilityId,
        parse.data.capabilities
      );
      res.status(200).json({ success: true, count: capabilities.length, capabilities });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async matchAndRoute(req: Request, res: Response): Promise<void> {
    const parse = routeMatchSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const rankedFacilities = await routingService.matchAndRankFacilities(parse.data);
      res.status(200).json({
        success: true,
        query: parse.data,
        totalMatched: rankedFacilities.length,
        facilities: rankedFacilities,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

export const facilityController = new FacilityController();
