import { createApp } from './app';
import { config } from './config';
import { db } from './db';

async function bootstrap() {
  await db.init();
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[Referral Service] Microservice running on port ${config.port} in ${config.nodeEnv} mode`);
  });
}

bootstrap().catch(err => {
  console.error('[Referral Service] Bootstrap failed:', err);
  process.exit(1);
});
