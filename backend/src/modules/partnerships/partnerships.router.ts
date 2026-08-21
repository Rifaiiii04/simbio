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
  markReadHandler,
  notificationSummaryHandler,
} from './partnerships.controller.js';
import {
  startAudioSessionHandler,
  getActiveAudioSessionHandler,
  acceptAudioSessionHandler,
  skipPrepAudioSessionHandler,
  rejectAudioSessionHandler,
  leaveAudioSessionHandler,
} from './audio-session.controller.js';
import {
  getTopicsHandler,
  generateAiTopicsHandler,
  generateProposalHandler,
  updateProposalDraftHandler,
  approveProposalHandler,
  addTopicHandler,
  toggleTopicHandler,
  deleteTopicHandler,
} from './partnership-topics.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', listHandler);
router.post('/', createHandler);
router.get('/notifications/summary', notificationSummaryHandler);
router.get('/:id', getHandler);
router.post('/:id/accept', acceptHandler);
router.post('/:id/reject', rejectHandler);
router.post('/:id/leave', leaveHandler);
router.post('/:id/read', markReadHandler);
router.get('/:id/messages', getMessagesHandler);
router.post('/:id/messages', sendMessageHandler);

// Audio Call & AI Topic Exchange Routes
router.post('/:id/audio-sessions', startAudioSessionHandler);
router.get('/:id/audio-sessions/current', getActiveAudioSessionHandler);
router.post('/audio-sessions/:sessionId/accept', acceptAudioSessionHandler);
router.post('/audio-sessions/:sessionId/skip-prep', skipPrepAudioSessionHandler);
router.post('/audio-sessions/:sessionId/reject', rejectAudioSessionHandler);
router.post('/audio-sessions/:sessionId/leave', leaveAudioSessionHandler);

// Partnership Reciprocal Learning Topics & Proposal Routes
router.get('/:id/topics', getTopicsHandler);
router.post('/:id/topics/generate-ai', generateAiTopicsHandler);
router.post('/:id/topics/generate-proposal', generateProposalHandler);
router.put('/:id/topics/proposals/:messageId', updateProposalDraftHandler);
router.post('/:id/topics/proposals/:messageId/approve', approveProposalHandler);
router.post('/:id/topics', addTopicHandler);
router.patch('/topics/:topicId/toggle', toggleTopicHandler);
router.delete('/topics/:topicId', deleteTopicHandler);

export { router as partnershipsRouter };
