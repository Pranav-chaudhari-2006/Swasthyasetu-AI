import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4006', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'swasthyasetu_jwt_dev_secret_key_2026',
  qrHmacSecret: process.env.QR_HMAC_SECRET || 'swasthyasetu_referral_qr_hmac_secret_key_2026',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'swasthyasetu_referral',
  },
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
