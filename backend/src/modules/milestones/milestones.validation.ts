import { z } from 'zod';
import { MilestoneStatus } from '../../../generated/prisma/index.js';

export const createMilestoneSchema = z.object({
  roadmapId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  order: z.number().int().min(0).optional(),
  status: z.nativeEnum(MilestoneStatus).optional(),
});
