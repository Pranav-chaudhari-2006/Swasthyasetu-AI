import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'swasthyasetu_jwt_dev_secret_key_2026',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    facility: process.env.FACILITY_SERVICE_URL || 'http://localhost:4002',
    patientCase: process.env.PATIENT_CASE_SERVICE_URL || 'http://localhost:4003',
    intake: process.env.INTAKE_SERVICE_URL || 'http://localhost:4004',
    safety: process.env.SAFETY_SERVICE_URL || 'http://localhost:4005',
    referral: process.env.REFERRAL_SERVICE_URL || 'http://localhost:4006',
    emergency: process.env.EMERGENCY_SERVICE_URL || 'http://localhost:4007',
    clinical: process.env.CLINICAL_SERVICE_URL || 'http://localhost:4008',
    followup: process.env.FOLLOWUP_SERVICE_URL || 'http://localhost:4009',
    sync: process.env.SYNC_SERVICE_URL || 'http://localhost:4010',
  },
  renderKeepAlive: {
    targetUrl: process.env.RENDER_SERVICE_URL || 'https://swasthyasetu-api-gateway.onrender.com/health',
    autoStart: process.env.RENDER_KEEPALIVE_AUTOSTART === 'true',
    minIntervalSec: parseInt(process.env.RENDER_PING_MIN_SEC || '40', 10),
    maxIntervalSec: parseInt(process.env.RENDER_PING_MAX_SEC || '45', 10),
  }
};
