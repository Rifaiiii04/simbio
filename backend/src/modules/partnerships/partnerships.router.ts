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
import {
  startAudioSessionHandler,
  getActiveAudioSessionHandler,
  acceptAudioSessionHandler,
  skipPrepAudioSessionHandler,
  rejectAudioSessionHandler,
  leaveAudioSessionHandler,
} from './audio-session.controller.js';

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

// Audio Call & AI Topic Exchange Routes
router.post('/:id/audio-sessions', startAudioSessionHandler);
router.get('/:id/audio-sessions/current', getActiveAudioSessionHandler);
router.post('/audio-sessions/:sessionId/accept', acceptAudioSessionHandler);
router.post('/audio-sessions/:sessionId/skip-prep', skipPrepAudioSessionHandler);
router.post('/audio-sessions/:sessionId/reject', rejectAudioSessionHandler);
router.post('/audio-sessions/:sessionId/leave', leaveAudioSessionHandler);

export { router as partnershipsRouter };
