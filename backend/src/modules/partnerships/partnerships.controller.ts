import { type Request, type Response, type NextFunction } from 'express';
import * as service from './partnerships.service.js';
import { createPartnershipSchema } from './partnerships.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, { partnerships: await service.getPartnerships(uid(req)) }); } catch (err) { next(err); }
}

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { partnership: await service.getPartnership(uid(req), id) });
  } catch (err) { next(err); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { recipientId, messageText } = createPartnershipSchema.parse(req.body);
    sendSuccess(res, { partnership: await service.requestPartnership(uid(req), recipientId, messageText) }, 201);
  } catch (err) { next(err); }
}

export async function acceptHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { partnership: await service.acceptPartnership(uid(req), id) });
  } catch (err) { next(err); }
}

export async function rejectHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { partnership: await service.rejectPartnership(uid(req), id) });
  } catch (err) { next(err); }
}

export async function leaveHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { messageText } = (req.body || {}) as { messageText?: string };
    sendSuccess(res, { partnership: await service.endPartnership(uid(req), id, messageText) });
  } catch (err) { next(err); }
}

export async function getMessagesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { messages: await service.getPartnershipMessages(uid(req), id) });
  } catch (err) { next(err); }
}

export async function sendMessageHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { content, replyToId } = req.body as { content: string; replyToId?: string };
    sendSuccess(res, { message: await service.sendPartnershipMessage(uid(req), id, content, replyToId) }, 201);
  } catch (err) { next(err); }
}

export async function markReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, await service.markAsRead(uid(req), id));
  } catch (err) { next(err); }
}

export async function notificationSummaryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, await service.getNotificationSummary(uid(req)));
  } catch (err) { next(err); }
}
