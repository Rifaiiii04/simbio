import { z } from 'zod';
import { UserSkillType, SkillLevel } from '../../../generated/prisma/index.js';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
});

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  categoryId: z.string().uuid().optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
});

export const updateSkillSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).nullable().optional(),
});

export const addUserSkillSchema = z.object({
  skillId: z.string().uuid(),
  type: z.nativeEnum(UserSkillType),
  level: z.nativeEnum(SkillLevel),
});

export const updateUserSkillSchema = z.object({
  level: z.nativeEnum(SkillLevel),
});
