import { routingService } from '../services/routing.service';
import { db } from '../db/database';

describe('MS-2: Capability-Based Routing Engine Unit Tests', () => {
  beforeEach(async () => {
    db.clearMemory();

    // Seed 3 test facilities:
    // 1. Nearby CHC (5km away) with Snake Bite Antivenom verified today
    const chc = await db.createFacility({
      facilityCode: 'CHC-GAURIGANJ',
      name: 'Community Health Centre Gauriganj',
      facilityTier: 'CHC',
      district: 'Amethi',
      state: 'Uttar Pradesh',
      latitude: 26.2167,
      longitude: 81.6833,
    });
    await db.upsertCapability({
      facilityId: chc.id,
      capabilityCode: 'SNAKE_BITE_ANTIVENOM',
      category: 'MEDICINE_SUPPLY',
      status: 'VERIFIED_AVAILABLE',
      availableUnits: 15,
      verificationSource: 'PHARMACY_STOCK_AUDIT',
    });
    await db.upsertCapability({
      facilityId: chc.id,
      capabilityCode: 'EMERGENCY_TRIAGE',
      category: 'EMERGENCY',
      status: 'VERIFIED_AVAILABLE',
    });

    // 2. District Hospital (35km away) with Snake Bite Antivenom, ICU, and Emergency OT
    const dh = await db.createFacility({
      facilityCode: 'DH-AMETHI',
      name: 'District Hospital Amethi',
      facilityTier: 'DISTRICT_HOSPITAL',
      district: 'Amethi',
      state: 'Uttar Pradesh',
      latitude: 26.1555,
      longitude: 81.8153,
    });
    await db.upsertCapability({
      facilityId: dh.id,
      capabilityCode: 'SNAKE_BITE_ANTIVENOM',
      category: 'MEDICINE_SUPPLY',
      status: 'VERIFIED_AVAILABLE',
      availableUnits: 40,
    });
    await db.upsertCapability({
      facilityId: dh.id,
      capabilityCode: 'ICU_GENERAL',
      category: 'CRITICAL_CARE',
      status: 'VERIFIED_AVAILABLE',
      availableUnits: 12,
    });
    await db.upsertCapability({
      facilityId: dh.id,
      capabilityCode: 'EMERGENCY_OT',
      category: 'EMERGENCY',
      status: 'VERIFIED_AVAILABLE',
    });

    // 3. Nearby PHC (2km away) WITHOUT Snake Bite Antivenom
    const phc = await db.createFacility({
      facilityCode: 'PHC-TIKERMAFI',
      name: 'Primary Health Centre Tikermafi',
      facilityTier: 'PHC',
      district: 'Amethi',
      state: 'Uttar Pradesh',
      latitude: 26.2300,
      longitude: 81.6900,
    });
    await db.upsertCapability({
      facilityId: phc.id,
      capabilityCode: 'OPD_GENERAL',
      category: 'SPECIALTY',
      status: 'VERIFIED_AVAILABLE',
    });
  });

  it('Haversine distance calculation should be mathematically accurate', () => {
    // Distance between New Delhi (28.6139, 77.2090) and Mumbai (19.0760, 72.8777) ~ 1148 km
    const distance = routingService.calculateDistanceKm(28.6139, 77.2090, 19.0760, 72.8777);
    expect(distance).toBeGreaterThan(1140);
    expect(distance).toBeLessThan(1160);
  });

  it('Non-Hierarchical Routing: Nearby CHC with verified antivenom ranks above distant DH and capability-lacking PHC', async () => {
    const userLat = 26.2200;
    const userLng = 81.6800;

    const results = await routingService.matchAndRankFacilities({
      requiredCapabilities: ['SNAKE_BITE_ANTIVENOM'],
      userLatitude: userLat,
      userLongitude: userLng,
      maxDistanceKm: 50,
    });

    expect(results.length).toBe(3);

    // Top ranked facility MUST be the nearby CHC because it possesses the required capability and is closest
    expect(results[0].facility.facilityCode).toBe('CHC-GAURIGANJ');
    expect(results[0].isAllCapabilitiesMet).toBe(true);
    expect(results[0].matchedCapabilities).toContain('SNAKE_BITE_ANTIVENOM');
    expect(results[0].distanceKm).toBeLessThan(5);

    // Second ranked should be District Hospital (has capability but further away)
    expect(results[1].facility.facilityCode).toBe('DH-AMETHI');
    expect(results[1].isAllCapabilitiesMet).toBe(true);

    // Last ranked should be PHC (closest, but lacks required antivenom!)
    expect(results[2].facility.facilityCode).toBe('PHC-TIKERMAFI');
    expect(results[2].isAllCapabilitiesMet).toBe(false);
    expect(results[2].missingCapabilities).toContain('SNAKE_BITE_ANTIVENOM');
  });

  it('Emergency Mode should prioritize facilities with active Emergency OT and ICU', async () => {
    const userLat = 26.2200;
    const userLng = 81.6800;

    const results = await routingService.matchAndRankFacilities({
      requiredCapabilities: ['EMERGENCY_OT', 'ICU_GENERAL'],
      userLatitude: userLat,
      userLongitude: userLng,
      maxDistanceKm: 60,
      emergencyMode: true,
    });

    // Only District Hospital meets both Emergency OT and ICU
    expect(results[0].facility.facilityCode).toBe('DH-AMETHI');
    expect(results[0].isAllCapabilitiesMet).toBe(true);
    expect(results[0].matchReasons).toContain('Critical emergency OT and ICU verified active');
  });
});
