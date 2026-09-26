import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import patientCaseRoutes from './routes/patient-case.routes';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  })
);
app.use(express.json());

// Correlation ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || 'CID-' + Date.now();
  res.setHeader('X-Correlation-ID', correlationId);
  next();
});

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    service: 'patient-case-service',
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Domain Routes
app.use('/api/v1', patientCaseRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Patient-Case Error]', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
  });
});
