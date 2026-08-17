import { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import * as audioService from './audio-session.service.js';
import * as audioRepo from './audio-session.repository.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

const startAudioSessionSchema = z.object({
  mode: z.enum(['NORMAL', 'AI_TOPIC_EXCHANGE']),
});

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function startAudioSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const { id: partnershipId } = req.params as { id: string };
    const { mode } = startAudioSessionSchema.parse(req.body);

    const session = await audioService.startAudioSession(userId, partnershipId, mode);
    sendSuccess(res, { session }, 201);
  } catch (err) { next(err); }
}

export async function getActiveAudioSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const { id: partnershipId } = req.params as { id: string };

    const partnership = await prisma.partnership.findFirst({
      where: {
        id: partnershipId,
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
    });

    if (!partnership) {
      sendSuccess(res, { session: null });
      return;
    }

    const activeSession = await audioRepo.findActiveSession(partnershipId);
    if (!activeSession) {
      sendSuccess(res, { session: null });
      return;
    }

    const session = await audioService.processSessionStateTransitions(activeSession, userId);
    sendSuccess(res, { session });
  } catch (err) { next(err); }
}

export async function acceptAudioSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const { sessionId } = req.params as { sessionId: string };

    const session = await audioService.acceptAudioSession(userId, sessionId);
    sendSuccess(res, { session });
  } catch (err) { next(err); }
}

export async function skipPrepAudioSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const { sessionId } = req.params as { sessionId: string };

    const session = await audioService.skipPrepAudioSession(userId, sessionId);
    sendSuccess(res, { session });
  } catch (err) { next(err); }
}

export async function rejectAudioSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const { sessionId } = req.params as { sessionId: string };

    const session = await audioService.rejectAudioSession(userId, sessionId);
    sendSuccess(res, { session });
  } catch (err) { next(err); }
}

export async function leaveAudioSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const { sessionId } = req.params as { sessionId: string };

    const session = await audioService.endAudioSession(userId, sessionId);
    sendSuccess(res, { session });
  } catch (err) { next(err); }
}
