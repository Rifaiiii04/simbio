import { type Request, type Response, type NextFunction } from 'express';
import * as repo from './reviews.repository.js';
import { createReviewSchema } from './reviews.validation.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = uid(req);
    const data = createReviewSchema.parse(req.body);
    // Verify partnership access and status
    const partnership = await prisma.partnership.findFirst({ where: { id: data.partnershipId, status: 'ACCEPTED', OR: [{ requesterId: userId }, { recipientId: userId }] } });
    if (!partnership) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied or partnership not accepted', 403);
    if (data.revieweeId === userId) throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot review yourself', 400);

    // Enforce 30-Day Monthly Rate Limit Rule
    const lastReview = await repo.findLastReview(data.partnershipId, userId, data.revieweeId);
    if (lastReview) {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const timeSinceLastReview = Date.now() - new Date(lastReview.createdAt).getTime();
      if (timeSinceLastReview < thirtyDaysMs) {
        const daysRemaining = Math.ceil((thirtyDaysMs - timeSinceLastReview) / (24 * 60 * 60 * 1000));
        throw new AppError(
          ErrorCode.RATE_LIMITED,
          `You can only review this partner once every 30 days. Please try again in ${daysRemaining} day(s).`,
          429
        );
      }
    }

    const review = await repo.create({ ...data, reviewerId: userId });
    sendSuccess(res, { review }, 201);
  } catch (err) { next(err); }
}

export async function getReputationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params as { userId: string };
    const reputation = await repo.getReputation(userId);
    sendSuccess(res, { reputation });
  } catch (err) { next(err); }
}

export async function getMyReputationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reputation = await repo.getReputation(uid(req));
    sendSuccess(res, { reputation });
  } catch (err) { next(err); }
}
