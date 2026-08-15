import { type Request, type Response, type NextFunction } from 'express';
import * as service from './projects.service.js';
import { createProjectSchema, updateProjectSchema, addContributorSchema } from './projects.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { partnershipId } = req.query as { partnershipId?: string };
    sendSuccess(res, { projects: await service.getProjects(uid(req), partnershipId) });
  } catch (err) { next(err); }
}

export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    sendSuccess(res, { project: await service.getProject(uid(req), id) });
  } catch (err) { next(err); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createProjectSchema.parse(req.body);
    sendSuccess(res, { project: await service.createProject(uid(req), data) }, 201);
  } catch (err) { next(err); }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = updateProjectSchema.parse(req.body);
    sendSuccess(res, { project: await service.updateProject(uid(req), id, data) });
  } catch (err) { next(err); }
}

export async function addContributorHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { userId, role } = addContributorSchema.parse(req.body);
    sendSuccess(res, { contributor: await service.addContributor(uid(req), id, userId, role) }, 201);
  } catch (err) { next(err); }
}
