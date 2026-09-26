import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[SwasthyaSetu Gateway] API Gateway running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log('[SwasthyaSetu Gateway] Downstream Microservices:');
  Object.entries(config.services).forEach(([svc, url]) => {
    console.log(` - ${svc.padEnd(14)}: ${url}`);
  });
});
