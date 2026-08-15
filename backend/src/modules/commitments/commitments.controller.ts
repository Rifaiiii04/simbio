import { type Request, type Response, type NextFunction } from 'express';
import * as service from './commitments.service.js';
import { createCommitmentSchema, updateCommitmentSchema } from './commitments.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, { commitments: await service.getAll(uid(req)) }); } catch (err) { next(err); }
}

export async function currentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, { commitments: await service.getCurrent(uid(req)) }); } catch (err) { next(err); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createCommitmentSchema.parse(req.body);
    sendSuccess(res, { commitment: await service.create(uid(req), data) }, 201);
  } catch (err) { next(err); }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = updateCommitmentSchema.parse(req.body);
    sendSuccess(res, { commitment: await service.update(uid(req), id, data) });
  } catch (err) { next(err); }
}
