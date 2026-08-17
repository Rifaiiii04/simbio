import { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import * as service from './partnership-topics.service.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

const addTopicSchema = z.object({
  targetUserId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function getTopicsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: partnershipId } = req.params as { id: string };
    const topics = await service.getTopicsForPartnership(uid(req), partnershipId);
    sendSuccess(res, { topics });
  } catch (err) { next(err); }
}

export async function generateAiTopicsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: partnershipId } = req.params as { id: string };
    const topics = await service.generateAiTopicsForPartnership(uid(req), partnershipId);
    sendSuccess(res, { topics }, 201);
  } catch (err) { next(err); }
}

export async function addTopicHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: partnershipId } = req.params as { id: string };
    const { targetUserId, title, description } = addTopicSchema.parse(req.body);
    const topic = await service.addManualTopic(uid(req), partnershipId, targetUserId, title, description);
    sendSuccess(res, { topic }, 201);
  } catch (err) { next(err); }
}

export async function toggleTopicHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId } = req.params as { topicId: string };
    const topic = await service.toggleTopic(uid(req), topicId);
    sendSuccess(res, { topic });
  } catch (err) { next(err); }
}

export async function deleteTopicHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId } = req.params as { topicId: string };
    await service.deleteTopic(uid(req), topicId);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}
