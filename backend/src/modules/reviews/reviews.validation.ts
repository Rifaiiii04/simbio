import { z } from 'zod';

const rating = z.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  partnershipId: z.string().uuid(),
  revieweeId: z.string().uuid(),
  consistency: rating,
  communication: rating,
  knowledgeSharing: rating,
  collaboration: rating,
  comment: z.string().max(1000).optional(),
});
