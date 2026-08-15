import { z } from 'zod';

export const startSessionSchema = z.object({
  milestoneId: z.string().uuid().optional(),
  startedAt: z.string().datetime().optional(),
});

export const completeSessionSchema = z.object({
  completedAt: z.string().datetime().optional(),
  duration: z.number().int().min(1),
});
