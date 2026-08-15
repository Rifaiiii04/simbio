import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { listHandler, getHandler, createHandler, updateHandler, deleteHandler } from './learning-goals.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.post('/', createHandler);
router.get('/:id', getHandler);
router.patch('/:id', updateHandler);
router.delete('/:id', deleteHandler);
export { router as learningGoalsRouter };
