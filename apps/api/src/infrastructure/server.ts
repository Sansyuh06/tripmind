import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { generalLimiter } from './middleware/rateLimiter';
import { i18nMiddleware } from './middleware/i18n';
import authController from '../adapters/controllers/auth.controller';
import tripController from '../adapters/controllers/trip.controller';
import itineraryController from '../adapters/controllers/itinerary.controller';
import disruptionController from '../adapters/controllers/disruption.controller';
import expenseController from '../adapters/controllers/expense.controller';

export function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use('/api/', generalLimiter);
  app.use(i18nMiddleware);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authController);
  app.use('/api/trips', tripController);
  app.use('/api/itinerary', itineraryController);
  app.use('/api/disruption', disruptionController);
  app.use('/api/expense', expenseController);

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
  });

  return app;
}
