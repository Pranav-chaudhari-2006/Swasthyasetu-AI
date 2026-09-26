import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '4001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/swasthyasetu_auth',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'swasthya_setu_super_secret_access_jwt_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'swasthya_setu_super_secret_refresh_jwt_key_2026',
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '15m',
  REFRESH_TOKEN_TTL_DAYS: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10),
  OTP_TTL_MINUTES: parseInt(process.env.OTP_TTL_MINUTES || '5', 10),
  MAX_OTP_ATTEMPTS: parseInt(process.env.MAX_OTP_ATTEMPTS || '3', 10),
  BCRYPT_SALT_ROUNDS: 10,
};
