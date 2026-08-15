import { z } from 'zod';
import { CommitmentStatus } from '../../../generated/prisma/index.js';

export const createCommitmentSchema = z.object({
  milestoneId: z.string().uuid(),
  title: z.string().min(1).max(200),
  weekStart: z.string().datetime(),
  weekEnd: z.string().datetime(),
});

export const updateCommitmentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.nativeEnum(CommitmentStatus).optional(),
});
