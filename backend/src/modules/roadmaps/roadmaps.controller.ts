import { type Request, type Response, type NextFunction } from 'express';
import * as service from './roadmaps.service.js';
import { createRoadmapSchema, updateRoadmapSchema } from './roadmaps.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { goalId } = req.query as { goalId?: string };
    if (!goalId) throw new AppError(ErrorCode.VALIDATION_ERROR, 'goalId query param required', 400);
    sendSuccess(res, { roadmaps: await service.getRoadmaps(uid(req), goalId) });
  } catch (err) { next(err); }
}

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { roadmap: await service.getRoadmap(uid(req), id) });
  } catch (err) { next(err); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createRoadmapSchema.parse(req.body);
    sendSuccess(res, { roadmap: await service.createRoadmap(uid(req), data) }, 201);
  } catch (err) { next(err); }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = updateRoadmapSchema.parse(req.body);
    sendSuccess(res, { roadmap: await service.updateRoadmap(uid(req), id, data) });
  } catch (err) { next(err); }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await service.deleteRoadmap(uid(req), id);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}
