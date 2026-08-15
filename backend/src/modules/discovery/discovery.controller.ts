import { type Request, type Response, type NextFunction } from 'express';
import * as repo from './discovery.repository.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function peopleHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { skillId, level, radius, country } = req.query as { skillId?: string; level?: string; radius?: string; country?: string };
    const candidates = await repo.findCandidates(uid(req), {
      skillId, level, radius: radius ? parseInt(radius, 10) : undefined, country,
    });
    sendSuccess(res, { candidates });
  } catch (err) { next(err); }
}

export async function matchesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const candidates = await repo.findCandidates(uid(req), {});
    // Matches = candidates with matchScore > 0
    sendSuccess(res, { matches: candidates.filter((c) => c.matchScore > 0) });
  } catch (err) { next(err); }
}

export async function mapHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { radius } = req.query as { radius?: string };
    const data = await repo.getMapData(uid(req), radius ? parseInt(radius, 10) : undefined);
    sendSuccess(res, { users: data });
  } catch (err) { next(err); }
}
