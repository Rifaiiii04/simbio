import { type Request, type Response, type NextFunction } from 'express';
import { generateRoadmapDraft, recommendAiPartners } from './ai.service.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function generateRoadmapHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { goalId } = req.body as { goalId: string };
    if (!goalId) throw new AppError(ErrorCode.VALIDATION_ERROR, 'goalId is required', 400);

    const roadmap = await generateRoadmapDraft(uid(req), goalId);
    sendSuccess(res, { roadmap }, 201);
  } catch (err) {
    next(err);
  }
}

export async function recommendationsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const recommendations = await recommendAiPartners(uid(req));
    sendSuccess(res, { recommendations });
  } catch (err) {
    next(err);
  }
}
