import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '4003', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/swasthyasetu_patient_cases',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'swasthya_setu_super_secret_access_jwt_key_2026',
};
