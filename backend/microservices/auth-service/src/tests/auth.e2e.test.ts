import request from 'supertest';
import { app } from '../app';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

describe('MS-1: Auth & Audit Service HTTP API E2E Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('auth-service');
    expect(res.body.status).toBe('HEALTHY');
  });

  it('Complete Patient OTP Flow: Request -> Verify -> Authenticated Profile -> Logout', async () => {
    const phone = '+919876543210';

    // 1. Request OTP
    const reqOtpRes = await request(app)
      .post('/api/v1/auth/patient/otp/request')
      .send({ phone });

    expect(reqOtpRes.status).toBe(200);
    expect(reqOtpRes.body.challengeId).toBeDefined();
    const challengeId = reqOtpRes.body.challengeId;
    const plainOtp = reqOtpRes.body.plainOtpDevOnly; // Available in test/dev mode

    // 2. Verify OTP
    const verifyRes = await request(app)
      .post('/api/v1/auth/patient/otp/verify')
      .send({
        challengeId,
        phone,
        otp: plainOtp,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.accessToken).toBeDefined();
    expect(verifyRes.body.refreshToken).toBeDefined();
    expect(verifyRes.body.user.role).toBe('PATIENT');
    const accessToken = verifyRes.body.accessToken;
    const refreshToken = verifyRes.body.refreshToken;

    // 3. Access Protected Profile
    const profileRes = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.user.phone).toBe(phone);
    expect(profileRes.body.user.role).toBe('PATIENT');

    // 4. Refresh Token
    const refreshRes = await request(app)
      .post('/api/v1/auth/token/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();

    // 5. Logout
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });

  it('Complete Staff Flow: Provision -> Login -> Audit Log Check', async () => {
    const facilityId = uuidv4();

    // 1. Provision Medical Officer
    const regRes = await request(app)
      .post('/api/v1/auth/staff/register')
      .send({
        email: 'dr.sharma@phc-amethi.gov.in',
        phone: '+919123456780',
        password: 'SecureDoctorPass2026!',
        role: 'MEDICAL_OFFICER',
        fullName: 'Dr. Ramesh Sharma',
        designation: 'Chief Medical Officer',
        facilityId,
        district: 'Amethi',
        state: 'Uttar Pradesh',
        licenseNumber: 'MCI-UP-987654',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.user.role).toBe('MEDICAL_OFFICER');

    // 2. Login as Staff
    const loginRes = await request(app)
      .post('/api/v1/auth/staff/login')
      .send({
        emailOrPhone: 'dr.sharma@phc-amethi.gov.in',
        password: 'SecureDoctorPass2026!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();
    expect(loginRes.body.staffProfile.facilityId).toBe(facilityId);
    const doctorToken = loginRes.body.accessToken;

    // 3. Check Audit Logs with Admin Role (Staff Provisioning & Login should create logs)
    // Register District Officer to view audit logs
    const doReg = await request(app)
      .post('/api/v1/auth/staff/register')
      .send({
        email: 'dho.amethi@gov.in',
        phone: '+919988776655',
        password: 'SecureDHOPass2026!',
        role: 'DISTRICT_OFFICER',
        fullName: 'Dr. Ananya Verma',
        designation: 'District Health Officer',
        district: 'Amethi',
        state: 'Uttar Pradesh',
      });

    const dhoToken = doReg.body.accessToken;

    const auditRes = await request(app)
      .get('/api/v1/auth/audit/logs')
      .set('Authorization', `Bearer ${dhoToken}`);

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.logs.length).toBeGreaterThan(0);
    const actions = auditRes.body.logs.map((l: any) => l.action);
    expect(actions).toContain('STAFF_PROVISIONED');
    expect(actions).toContain('STAFF_LOGIN_SUCCESS');

    // 4. Verify Doctor is Forbidden from Viewing Audit Logs
    const docForbiddenAudit = await request(app)
      .get('/api/v1/auth/audit/logs')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(docForbiddenAudit.status).toBe(403);
    expect(docForbiddenAudit.body.error).toBe('FORBIDDEN');
  });

  it('should reject invalid password for staff', async () => {
    await request(app)
      .post('/api/v1/auth/staff/register')
      .send({
        email: 'asha.radha@gov.in',
        phone: '+919876000000',
        password: 'CorrectPassword123!',
        role: 'ASHA',
        fullName: 'Radha Devi',
        designation: 'ASHA Worker',
      });

    const badLogin = await request(app)
      .post('/api/v1/auth/staff/login')
      .send({
        emailOrPhone: 'asha.radha@gov.in',
        password: 'WrongPassword!',
      });

    expect(badLogin.status).toBe(401);
    expect(badLogin.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('should reject request without Authorization header', async () => {
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });
});
