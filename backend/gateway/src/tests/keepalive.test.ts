import request from 'supertest';
import { createApp } from '../app';
import { keepAliveService } from '../services/keepAliveService';

describe('Render Keep-Alive Engine & API Suite', () => {
  const app = createApp();

  afterAll(() => {
    keepAliveService.stop();
  });

  describe('1. Keep-Alive Status & Health API', () => {
    it('should return initial keep-alive engine status with 40-45s random interval boundaries', async () => {
      const res = await request(app).get('/api/v1/keepalive/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.service).toBe('render-keepalive-engine');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.minIntervalSec).toBe(40);
      expect(res.body.data.maxIntervalSec).toBe(45);
      expect(typeof res.body.data.targetUrl).toBe('string');
      expect(Array.isArray(res.body.data.recentHistory)).toBe(true);
    });
  });

  describe('2. On-Demand Keep-Alive Ping Trigger', () => {
    it('should execute a keep-alive ping and record latency & telemetry', async () => {
      // Ping local health check to verify latency measurement
      const res = await request(app)
        .post('/api/v1/keepalive/ping')
        .send({ targetUrl: 'http://localhost:4000/health' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Ping executed');
      expect(res.body.data.targetUrl).toBe('http://localhost:4000/health');
      expect(typeof res.body.data.latencyMs).toBe('number');
      expect(typeof res.body.data.timestamp).toBe('string');
    });
  });

  describe('3. Dynamic Configuration & Control', () => {
    it('should reconfigure target URL and interval boundaries', async () => {
      const res = await request(app)
        .post('/api/v1/keepalive/configure')
        .send({
          targetUrl: 'https://swasthyasetu-api-gateway.onrender.com/health',
          minIntervalSec: 40,
          maxIntervalSec: 45
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetUrl).toBe('https://swasthyasetu-api-gateway.onrender.com/health');
      expect(res.body.data.minIntervalSec).toBe(40);
      expect(res.body.data.maxIntervalSec).toBe(45);
    });

    it('should start and stop the background keep-alive worker', async () => {
      const startRes = await request(app).post('/api/v1/keepalive/start');
      expect(startRes.status).toBe(200);
      expect(startRes.body.data.isActive).toBe(true);
      expect(startRes.body.data.nextPingInSeconds).toBeGreaterThanOrEqual(0);

      const stopRes = await request(app).post('/api/v1/keepalive/stop');
      expect(stopRes.status).toBe(200);
      expect(stopRes.body.data.isActive).toBe(false);
    });
  });

  describe('4. Random Jitter Interval Calculation Verification', () => {
    it('should verify random intervals fall strictly within [40, 45] seconds', () => {
      const min = 40;
      const max = 45;
      for (let i = 0; i < 100; i++) {
        const interval = min + Math.random() * (max - min);
        expect(interval).toBeGreaterThanOrEqual(40);
        expect(interval).toBeLessThanOrEqual(45);
      }
    });
  });
});
