import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { listHandler, currentHandler, createHandler, updateHandler } from './commitments.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.get('/current', currentHandler);
router.post('/', createHandler);
router.patch('/:id', updateHandler);
export { router as commitmentsRouter };
