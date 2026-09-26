import { app } from './app';
import { config } from './config';
import { db } from './db/database';

async function bootstrap() {
  const isDbConnected = await db.testConnection();
  if (isDbConnected) {
    console.log('✅ [Safety Service] PostgreSQL Database Connected.');
  } else {
    console.log('ℹ️ [Safety Service] PostgreSQL not reachable, using in-memory store for standalone execution.');
  }

  app.listen(config.PORT, () => {
    console.log(`🚀 [Safety Service] Running on port ${config.PORT} in ${config.NODE_ENV} mode.`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ [Safety Service] Failed to start server:', err);
  process.exit(1);
});
