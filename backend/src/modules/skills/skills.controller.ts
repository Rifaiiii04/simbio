import { type Request, type Response, type NextFunction } from 'express';
import * as skillsService from './skills.service.js';
import {
  createCategorySchema,
  updateCategorySchema,
  createSkillSchema,
  updateSkillSchema,
  addUserSkillSchema,
  updateUserSkillSchema,
} from './skills.validation.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

export async function getCategoriesHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await skillsService.getCategories();
    sendSuccess(res, { categories });
  } catch (err) { next(err); }
}

export async function createCategoryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await skillsService.addCategory(data);
    sendSuccess(res, { category }, 201);
  } catch (err) { next(err); }
}

export async function updateCategoryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = updateCategorySchema.parse(req.body);
    const category = await skillsService.updateCategory(id, data);
    sendSuccess(res, { category });
  } catch (err) { next(err); }
}

export async function deleteCategoryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await skillsService.deleteCategory(id);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}

export async function getSkillsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q, categoryId } = req.query as { q?: string; categoryId?: string };
    const skills = await skillsService.getSkills(q, categoryId);
    sendSuccess(res, { skills });
  } catch (err) { next(err); }
}

export async function getSkillHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const skill = await skillsService.getSkillById(id);
    sendSuccess(res, { skill });
  } catch (err) { next(err); }
}

export async function createSkillHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSkillSchema.parse(req.body);
    const skill = await skillsService.addSkill(data);
    sendSuccess(res, { skill }, 201);
  } catch (err) { next(err); }
}

export async function updateSkillHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = updateSkillSchema.parse(req.body);
    const skill = await skillsService.updateSkill(id, data);
    sendSuccess(res, { skill });
  } catch (err) { next(err); }
}

export async function deleteSkillHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await skillsService.deleteSkill(id);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}

export async function getUserSkillsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    const skills = await skillsService.getUserSkills(req.user.id);
    sendSuccess(res, { skills });
  } catch (err) { next(err); }
}

export async function addUserSkillHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    const data = addUserSkillSchema.parse(req.body);
    const skill = await skillsService.addUserSkill(req.user.id, data);
    sendSuccess(res, { skill }, 201);
  } catch (err) { next(err); }
}

export async function updateUserSkillHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    const { id } = req.params as { id: string };
    const data = updateUserSkillSchema.parse(req.body);
    const skill = await skillsService.updateUserSkill(req.user.id, id, data);
    sendSuccess(res, { skill });
  } catch (err) { next(err); }
}

export async function deleteUserSkillHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    const { id } = req.params as { id: string };
    await skillsService.removeUserSkill(req.user.id, id);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}
