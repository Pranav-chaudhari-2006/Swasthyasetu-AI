import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { config } from './config';
import { correlationMiddleware } from './middleware/correlation';
import { authRateLimiter, generalApiRateLimiter } from './middleware/rateLimiter';
import { BFFController } from './controllers/bffController';
import { KeepAliveController } from './controllers/keepAliveController';

export function createApp(): Application {
  const app = express();

  // 1. Security Headers & CORS
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(correlationMiddleware);

  // 2. Health & Telemetry Aggregator
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      service: 'api-gateway',
      status: 'UP',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      downstreamServices: {
        ms1_auth: { url: config.services.auth, routes: ['/api/v1/auth', '/api/v1/users', '/api/v1/audit'] },
        ms2_facility: { url: config.services.facility, routes: ['/api/v1/facilities'] },
        ms3_patientCase: { url: config.services.patientCase, routes: ['/api/v1/patients', '/api/v1/cases'] },
        ms4_intake: { url: config.services.intake, routes: ['/api/v1/intake'] },
        ms5_safety: { url: config.services.safety, routes: ['/api/v1/safety'] },
        ms6_referral: { url: config.services.referral, routes: ['/api/v1/referrals'] },
        ms7_emergency: { url: config.services.emergency, routes: ['/api/v1/emergency'] },
        ms8_clinical: { url: config.services.clinical, routes: ['/api/v1/clinical'] },
        ms9_followup: { url: config.services.followup, routes: ['/api/v1/followup'] },
        ms10_sync: { url: config.services.sync, routes: ['/api/v1/sync'] }
      }
    });
  });

  // 3. JSON Body Parser (Needed for non-proxied routes, BFF and KeepAlive)
  app.use(express.json({ limit: '20mb' }));

  // 4. BFF Aggregation Endpoints (Bypass proxy, handled locally)
  app.get('/api/v1/bff/patient/dashboard/:patientId', BFFController.getPatientDashboard);
  app.get('/api/v1/bff/frontline/dashboard/:workerId', BFFController.getFrontlineDashboard);
  app.get('/api/v1/bff/facility/dashboard/:facilityId', BFFController.getFacilityDashboard);

  // 5. Render Keep-Alive Engine API (Hits target at 40-45s random intervals to prevent spin-down)
  app.get('/api/v1/keepalive/status', KeepAliveController.getStatus);
  app.all('/api/v1/keepalive/ping', KeepAliveController.triggerPing);
  app.post('/api/v1/keepalive/start', KeepAliveController.startService);
  app.post('/api/v1/keepalive/stop', KeepAliveController.stopService);
  app.post('/api/v1/keepalive/configure', KeepAliveController.configure);

  // 4. Rate Limiting
  app.use('/api/v1/auth', authRateLimiter);
  app.use('/api/v1', generalApiRateLimiter);

  // 6. Reverse Proxy Helper
  const createServiceProxy = (target: string) => {
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req: any, res) => {
          // Forward correlation ID and client credentials
          const correlationId = req.headers['x-correlation-id'];
          if (correlationId) {
            proxyReq.setHeader('x-correlation-id', correlationId);
          }
          fixRequestBody(proxyReq, req);
        },
        error: (err, req, res: any) => {
          console.error(`[Gateway Proxy Error] Target: ${target}, Path: ${req.url}:`, err.message);
          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              error: 'Bad Gateway: Downstream microservice unavailable or timed out',
              target
            });
          }
        }
      }
    });
  };

  // 7. Microservice Routing
  app.use(['/api/v1/auth', '/api/v1/users', '/api/v1/audit'], createServiceProxy(config.services.auth));
  app.use('/api/v1/facilities', createServiceProxy(config.services.facility));
  app.use(['/api/v1/patients', '/api/v1/cases'], createServiceProxy(config.services.patientCase));
  app.use('/api/v1/intake', createServiceProxy(config.services.intake));
  app.use('/api/v1/safety', createServiceProxy(config.services.safety));
  app.use('/api/v1/referrals', createServiceProxy(config.services.referral));
  app.use('/api/v1/emergency', createServiceProxy(config.services.emergency));
  app.use('/api/v1/clinical', createServiceProxy(config.services.clinical));
  app.use('/api/v1/followup', createServiceProxy(config.services.followup));
  app.use('/api/v1/sync', createServiceProxy(config.services.sync));

  // 8. 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API route ${req.method} ${req.originalUrl} not found on SwasthyaSetu Gateway`
    });
  });

  // 9. Global Error Handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Gateway Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Gateway Error'
    });
  });

  return app;
}
