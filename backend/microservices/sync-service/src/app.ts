import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { syncRoutes } from './routes/syncRoutes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '20mb' }));

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      service: 'sync-service',
      status: 'UP',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Mount API routes
  app.use('/api/v1', syncRoutes);

  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Sync Service Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}
