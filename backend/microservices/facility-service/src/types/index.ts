export type FacilityTier =
  | 'PHC'
  | 'CHC'
  | 'SUB_DISTRICT_HOSPITAL'
  | 'DISTRICT_HOSPITAL'
  | 'TERTIARY_MEDICAL_COLLEGE'
  | 'PRIVATE_EMPANELLED';

export type CapabilityCode =
  | 'OPD_GENERAL'
  | 'EMERGENCY_TRIAGE'
  | 'EMERGENCY_OT'
  | 'ICU_GENERAL'
  | 'ICU_PEDIATRIC'
  | 'NICU'
  | 'LAB_BLOOD_TESTS'
  | 'LAB_X_RAY'
  | 'LAB_CT_SCAN'
  | 'LAB_ULTRASOUND'
  | 'BLOOD_BANK'
  | 'SNAKE_BITE_ANTIVENOM'
  | 'RABIES_IMMUNOGLOBULIN'
  | 'DIALYSIS'
  | 'OBSTETRICS_DELIVERY'
  | 'PHARMACY_24X7'
  | 'CARDIOLOGY_ECG';

export type CapabilityCategory =
  | 'EMERGENCY'
  | 'CRITICAL_CARE'
  | 'DIAGNOSTICS'
  | 'SPECIALTY'
  | 'MATERNAL_CHILD'
  | 'MEDICINE_SUPPLY';

export type CapabilityStatus =
  | 'VERIFIED_AVAILABLE'
  | 'LOW_CAPACITY'
  | 'OUT_OF_STOCK'
  | 'NOT_FUNCTIONAL'
  | 'NOT_AVAILABLE'
  | 'UNVERIFIED';

export interface Facility {
  id: string;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacilityCapability {
  id: string;
  facilityId: string;
  capabilityCode: CapabilityCode | string;
  category: CapabilityCategory | string;
  status: CapabilityStatus;
  availableUnits?: number;
  lastVerifiedAt: Date;
  verifiedBy?: string;
  verificationSource?: string;
  metadata?: Record<string, unknown>;
}

export interface FacilityWithCapabilities extends Facility {
  capabilities: FacilityCapability[];
}

export interface RouteMatchQuery {
  requiredCapabilities: (CapabilityCode | string)[];
  userLatitude: number;
  userLongitude: number;
  maxDistanceKm?: number;
  emergencyMode?: boolean;
  tierPreference?: FacilityTier[];
}

export interface RankedFacilityResult {
  facility: Facility;
  distanceKm: number;
  matchScore: number;
  isAllCapabilitiesMet: boolean;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  capabilityFreshness: 'FRESH' | 'STALE' | 'UNVERIFIED';
  matchReasons: string[];
  operatingStatus: 'OPEN' | 'CLOSED' | 'UNKNOWN';
}
