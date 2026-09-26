import { createApp } from './app';
import { config } from './config';
import { db } from './db';
import { SyncService } from './services/syncService';

async function bootstrap() {
  await db.init();

  // Initialize seed offline rule package if not present
  const existingPkg = await SyncService.getLatestRulesPackage();
  if (!existingPkg) {
    await SyncService.publishOfflineRules('v1.2.0-deterministic-pilot', {
      version: 'v1.2.0-deterministic-pilot',
      rules: [
        { id: 'RULE-CHEST-PAIN', condition: 'chest_pain_severe', pathway: 'EMERGENCY' },
        { id: 'RULE-RESPIRATORY-DISTRESS', condition: 'spo2_under_90', pathway: 'EMERGENCY' },
        { id: 'RULE-INFANT-HIGH-FEVER', condition: 'age_under_3m_fever', pathway: 'SAME_DAY' }
      ]
    });
  }

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[Sync Service] Microservice running on port ${config.port} in ${config.nodeEnv} mode`);
  });
}

bootstrap().catch(err => {
  console.error('[Sync Service] Bootstrap failed:', err);
  process.exit(1);
});
