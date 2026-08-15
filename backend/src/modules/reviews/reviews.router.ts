import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { createHandler, getReputationHandler } from './reviews.controller.js';

const router = Router();
router.use(authenticate);
router.post('/', createHandler);
router.get('/reputation/:userId', getReputationHandler);
export { router as reviewsRouter };
