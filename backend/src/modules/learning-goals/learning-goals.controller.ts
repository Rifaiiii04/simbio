import { type Request, type Response, type NextFunction } from 'express';
import * as service from './learning-goals.service.js';
import { createGoalSchema, updateGoalSchema } from './learning-goals.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, { goals: await service.getGoals(uid(req)) }); } catch (err) { next(err); }
}

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { goal: await service.getGoal(uid(req), id) });
  } catch (err) { next(err); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createGoalSchema.parse(req.body);
    sendSuccess(res, { goal: await service.createGoal(uid(req), data) }, 201);
  } catch (err) { next(err); }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = updateGoalSchema.parse(req.body);
    sendSuccess(res, { goal: await service.updateGoal(uid(req), id, data) });
  } catch (err) { next(err); }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await service.deleteGoal(uid(req), id);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}
