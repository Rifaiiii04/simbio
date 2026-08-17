import { z } from 'zod';

export const createPartnershipSchema = z.object({
  recipientId: z.string().uuid(),
  messageText: z.string().optional(),
  offeredSkillName: z.string().optional(),
  requestedSkillName: z.string().optional(),
});

export const updatePartnershipSchema = z.object({
  // Only system actions (accept/reject/end) — no direct status updates via PATCH
});
