import request from 'supertest';
import { app } from '../app';
import { db } from '../db/database';

describe('MS-2: Facility Service HTTP API E2E Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('facility-service');
    expect(res.body.status).toBe('HEALTHY');
  });

  it('Complete Lifecycle: Register Facility -> Batch Update Capabilities -> Route Match Query', async () => {
    // 1. Register Facility
    const createRes = await request(app)
      .post('/api/v1/facilities')
      .send({
        facilityCode: 'CHC-SULTANPUR',
        name: 'Community Health Centre Sultanpur',
        facilityTier: 'CHC',
        district: 'Sultanpur',
        state: 'Uttar Pradesh',
        latitude: 26.2648,
        longitude: 82.0727,
        address: 'Civil Lines, Sultanpur',
        phone: '+915362240100',
        operatingHours: { status: '24X7' },
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.facility.facilityCode).toBe('CHC-SULTANPUR');
    const facilityId = createRes.body.facility.id;

    // 2. Batch Update Capabilities
    const capRes = await request(app)
      .put(`/api/v1/facilities/${facilityId}/capabilities/batch`)
      .send({
        capabilities: [
          {
            capabilityCode: 'BLOOD_BANK',
            category: 'CRITICAL_CARE',
            status: 'VERIFIED_AVAILABLE',
            availableUnits: 25,
          },
          {
            capabilityCode: 'DIALYSIS',
            category: 'SPECIALTY',
            status: 'VERIFIED_AVAILABLE',
            availableUnits: 4,
          },
        ],
      });

    expect(capRes.status).toBe(200);
    expect(capRes.body.count).toBe(2);

    // 3. Query Facility by ID
    const getRes = await request(app).get(`/api/v1/facilities/${facilityId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.facility.capabilities.length).toBe(2);

    // 4. Match and Route query
    const routeRes = await request(app)
      .post('/api/v1/facilities/route-match')
      .send({
        requiredCapabilities: ['BLOOD_BANK', 'DIALYSIS'],
        userLatitude: 26.2700,
        userLongitude: 82.0700,
        maxDistanceKm: 20,
      });

    expect(routeRes.status).toBe(200);
    expect(routeRes.body.totalMatched).toBe(1);
    expect(routeRes.body.facilities[0].facility.facilityCode).toBe('CHC-SULTANPUR');
    expect(routeRes.body.facilities[0].isAllCapabilitiesMet).toBe(true);
    expect(routeRes.body.facilities[0].distanceKm).toBeLessThan(2);
  });

  it('should validate invalid GPS coordinates', async () => {
    const res = await request(app)
      .post('/api/v1/facilities')
      .send({
        facilityCode: 'BAD-GPS',
        name: 'Invalid Facility',
        facilityTier: 'PHC',
        district: 'Test',
        state: 'Test',
        latitude: 195.0, // Invalid latitude (> 90)
        longitude: 80.0,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});
