import { type Request, type Response, type NextFunction } from 'express';
import * as repo from './focus-sessions.repository.js';
import { startSessionSchema, completeSessionSchema } from './focus-sessions.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, { sessions: await repo.findByUser(uid(req)) }); } catch (err) { next(err); }
}

export async function startHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = startSessionSchema.parse(req.body);
    const session = await repo.create({ userId: uid(req), milestoneId: data.milestoneId, startedAt: data.startedAt ? new Date(data.startedAt) : new Date() });
    sendSuccess(res, { session }, 201);
  } catch (err) { next(err); }
}

export async function completeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = completeSessionSchema.parse(req.body);
    const session = await repo.complete(id, uid(req), { completedAt: data.completedAt ? new Date(data.completedAt) : new Date(), duration: data.duration });
    sendSuccess(res, { session });
  } catch (err) { next(err); }
}

export async function abortHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const session = await repo.abort(id, uid(req));
    sendSuccess(res, { session });
  } catch (err) { next(err); }
}
