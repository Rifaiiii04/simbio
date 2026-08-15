import { type Request, type Response, type NextFunction } from 'express';
import * as service from './milestones.service.js';
import { createMilestoneSchema, updateMilestoneSchema } from './milestones.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roadmapId } = req.query as { roadmapId?: string };
    if (!roadmapId) throw new AppError(ErrorCode.VALIDATION_ERROR, 'roadmapId required', 400);
    sendSuccess(res, { milestones: await service.getMilestones(uid(req), roadmapId) });
  } catch (err) { next(err); }
}

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { milestone: await service.getMilestone(uid(req), id) });
  } catch (err) { next(err); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createMilestoneSchema.parse(req.body);
    sendSuccess(res, { milestone: await service.createMilestone(uid(req), data) }, 201);
  } catch (err) { next(err); }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = updateMilestoneSchema.parse(req.body);
    sendSuccess(res, { milestone: await service.updateMilestone(uid(req), id, data) });
  } catch (err) { next(err); }
}

export async function completeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { milestone: await service.completeMilestone(uid(req), id) });
  } catch (err) { next(err); }
}

export async function uncompleteHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { milestone: await service.uncompleteMilestone(uid(req), id) });
  } catch (err) { next(err); }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await service.deleteMilestone(uid(req), id);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}

export async function progressHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roadmapId } = req.query as { roadmapId?: string };
    if (!roadmapId) throw new AppError(ErrorCode.VALIDATION_ERROR, 'roadmapId required', 400);
    sendSuccess(res, { progress: await service.getProgress(uid(req), roadmapId) });
  } catch (err) { next(err); }
}
