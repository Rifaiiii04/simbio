import { z } from 'zod';
import { ProjectStatus } from '../../../generated/prisma/index.js';

export const createProjectSchema = z.object({
  partnershipId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const addContributorSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().min(1).max(100),
});
