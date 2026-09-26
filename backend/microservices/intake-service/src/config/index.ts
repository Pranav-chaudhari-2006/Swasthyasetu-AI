import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '4004', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/swasthyasetu_intake',
  BHASHINI_API_KEY: process.env.BHASHINI_API_KEY || 'sandbox_bhashini_key_2026',
  BHASHINI_INFERENCE_ENDPOINT: process.env.BHASHINI_INFERENCE_ENDPOINT || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
  AI_MODEL_VERSION: 'SwasthyaSetu-Structuring-v1.2',
};
