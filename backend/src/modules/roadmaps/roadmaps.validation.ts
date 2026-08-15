import { z } from 'zod';
import { RoadmapStatus } from '../../../generated/prisma/index.js';

export const createRoadmapSchema = z.object({
  goalId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const updateRoadmapSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.nativeEnum(RoadmapStatus).optional(),
});

export const generateRoadmapSchema = z.object({
  goalId: z.string().uuid(),
});
