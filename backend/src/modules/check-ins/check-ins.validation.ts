import { z } from 'zod';
import { CheckInStatus } from '../../../generated/prisma/index.js';

export const createCheckInSchema = z.object({
  milestoneId: z.string().uuid(),
  commitmentId: z.string().uuid().optional(),
  status: z.nativeEnum(CheckInStatus),
  note: z.string().max(1000).optional(),
});
