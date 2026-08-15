import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { listHandler, startHandler, completeHandler, abortHandler } from './focus-sessions.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.post('/', startHandler);
router.post('/:id/complete', completeHandler);
router.post('/:id/abort', abortHandler);
export { router as focusSessionsRouter };
