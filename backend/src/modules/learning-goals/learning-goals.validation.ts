import { z } from 'zod';
import { GoalStatus } from '../../../generated/prisma/index.js';

export const createGoalSchema = z.object({
  skillId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  targetOutcome: z.string().max(1000).optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  targetOutcome: z.string().max(1000).nullable().optional(),
  status: z.nativeEnum(GoalStatus).optional(),
});
