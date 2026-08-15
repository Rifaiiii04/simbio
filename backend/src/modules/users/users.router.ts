import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  getMeHandler,
  updateMeHandler,
  getUserHandler,
  getAdminAnalyticsHandler,
  getAdminAiAnalyticsHandler,
  getAdminUsersHandler,
} from './users.controller.js';

const router = Router();

router.get('/admin/analytics', getAdminAnalyticsHandler);
router.get('/admin/ai-analytics', getAdminAiAnalyticsHandler);
router.get('/admin/list', getAdminUsersHandler);

router.get('/me', authenticate, getMeHandler);
router.patch('/me', authenticate, updateMeHandler);
router.get('/:id', authenticate, getUserHandler);

export { router as usersRouter };
