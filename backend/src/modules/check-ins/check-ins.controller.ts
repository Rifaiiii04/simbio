import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { createCheckInSchema } from './check-ins.validation.js';
import * as repo from './check-ins.repository.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, { checkIns: await repo.findByUser(uid(req)) }); } catch (err) { next(err); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const data = createCheckInSchema.parse(req.body);
    // Verify milestone belongs to user
    const milestone = await prisma.milestone.findFirst({ where: { id: data.milestoneId, roadmap: { goal: { userId } } } });
    if (!milestone) throw new AppError(ErrorCode.NOT_FOUND, 'Milestone not found', 404);
    const checkIn = await repo.create({ userId, ...data });
    sendSuccess(res, { checkIn }, 201);
  } catch (err) { next(err); }
}
