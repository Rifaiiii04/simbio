import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  listHandler,
  getHandler,
  createHandler,
  acceptHandler,
  rejectHandler,
  leaveHandler,
  getMessagesHandler,
  sendMessageHandler,
} from './partnerships.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.post('/', createHandler);
router.get('/:id', getHandler);
router.post('/:id/accept', acceptHandler);
router.post('/:id/reject', rejectHandler);
router.post('/:id/leave', leaveHandler);
router.get('/:id/messages', getMessagesHandler);
router.post('/:id/messages', sendMessageHandler);

export { router as partnershipsRouter };
