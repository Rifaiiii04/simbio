import { Router } from 'express';
import { sendSuccess } from '../../shared/response/success.js';

const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
});

export { router as healthRouter };
