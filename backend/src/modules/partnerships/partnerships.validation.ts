import { z } from 'zod';

export const createPartnershipSchema = z.object({
  recipientId: z.string().uuid(),
});

export const updatePartnershipSchema = z.object({
  // Only system actions (accept/reject/end) — no direct status updates via PATCH
});
