import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { listHandler, getHandler, createHandler, updateHandler, addContributorHandler } from './projects.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.post('/', createHandler);
router.get('/:id', getHandler);
router.patch('/:id', updateHandler);
router.post('/:id/contributors', addContributorHandler);
export { router as projectsRouter };
