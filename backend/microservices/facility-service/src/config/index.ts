import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '4002', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/swasthyasetu_facilities',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'swasthya_setu_super_secret_access_jwt_key_2026',
  FRESHNESS_THRESHOLD_HOURS: parseInt(process.env.FRESHNESS_THRESHOLD_HOURS || '48', 10),
  DEFAULT_MAX_DISTANCE_KM: parseInt(process.env.DEFAULT_MAX_DISTANCE_KM || '100', 10),
};
