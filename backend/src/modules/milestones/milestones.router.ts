import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { listHandler, getHandler, createHandler, updateHandler, completeHandler, uncompleteHandler, deleteHandler, progressHandler } from './milestones.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.get('/progress', progressHandler);
router.post('/', createHandler);
router.get('/:id', getHandler);
router.patch('/:id', updateHandler);
router.post('/:id/complete', completeHandler);
router.post('/:id/uncomplete', uncompleteHandler);
router.delete('/:id', deleteHandler);
export { router as milestonesRouter };
