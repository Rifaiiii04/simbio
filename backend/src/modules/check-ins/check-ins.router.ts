import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { listHandler, createHandler } from './check-ins.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.post('/', createHandler);
export { router as checkInsRouter };
