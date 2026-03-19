import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../infrastructure/middleware/auth';
import { TriggerDisruptionShield } from '../../use-cases/TriggerDisruptionShield';
import { PrismaTripRepository } from '../repositories/PrismaTripRepository';
import { MockFlightService } from '../services/MockFlightService';
import { OllamaItineraryService } from '../services/OllamaItineraryService';
import { QRCodeService } from '../services/QRCodeService';
import { disruptionLimiter } from '../../infrastructure/middleware/rateLimiter';

const router = Router();
const tripRepo = new PrismaTripRepository();
const flightService = new MockFlightService();
const itineraryService = new OllamaItineraryService();
const qrService = new QRCodeService();
const disruptionShield = new TriggerDisruptionShield(tripRepo, flightService, itineraryService, qrService);

const triggerSchema = z.object({
  tripId: z.string().min(1),
  flightId: z.string().min(1),
  disruptionType: z.enum(['cancelled', 'delayed', 'missed']),
});

router.post('/trigger', authMiddleware, disruptionLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = triggerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' });
    }

    const resolution = await disruptionShield.execute({
      ...parsed.data,
      lang: req.lang,
    });

    res.json(resolution);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('not found')) {
      return res.status(404).json({ error: msg, code: 'NOT_FOUND' });
    }
    res.status(500).json({ error: msg, code: 'SERVER_ERROR' });
  }
});

export default router;
