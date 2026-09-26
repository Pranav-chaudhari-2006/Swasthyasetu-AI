import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '4005', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/swasthyasetu_safety',
  RULE_SET_VERSION: 'v1.2.0-deterministic-pilot',
  CLINICAL_GOVERNANCE_STATUS: 'CLINICAL_BOARD_APPROVED',
};
