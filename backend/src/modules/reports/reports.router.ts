import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  createReportHandler,
  adminListReportsHandler,
  adminResolveReportHandler,
  adminBanUserHandler,
  adminDeleteUserHandler,
} from './reports.controller.js';

const router = Router();
router.use(authenticate);

// User endpoints (Simbio)
router.post('/', createReportHandler);

// Admin moderation endpoints (Dashboard)
router.get('/admin/list', adminListReportsHandler);
router.post('/admin/:id/resolve', adminResolveReportHandler);
router.post('/admin/users/:userId/ban', adminBanUserHandler);
router.delete('/admin/users/:userId', adminDeleteUserHandler);

export { router as reportsRouter };
