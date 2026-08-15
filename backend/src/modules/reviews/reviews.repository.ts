import { prisma } from '../../infrastructure/database/prisma.js';

export async function create(data: {
  partnershipId: string; reviewerId: string; revieweeId: string;
  consistency: number; communication: number; knowledgeSharing: number; collaboration: number; comment?: string;
}) {
  return prisma.partnershipReview.create({ data });
}

export async function findLastReview(partnershipId: string, reviewerId: string, revieweeId: string) {
  return prisma.partnershipReview.findFirst({
    where: { partnershipId, reviewerId, revieweeId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findByUser(revieweeId: string) {
  return prisma.partnershipReview.findMany({ where: { revieweeId }, orderBy: { createdAt: 'desc' } });
}

// Deterministic reputation aggregation — no LLM involvement
export async function getReputation(revieweeId: string) {
  const reviews = await prisma.partnershipReview.findMany({ where: { revieweeId }, select: { consistency: true, communication: true, knowledgeSharing: true, collaboration: true } });
  const count = reviews.length;
  if (count === 0) return { count: 0, averages: null, overall: null };

  const sum = reviews.reduce((acc, r) => ({
    consistency: acc.consistency + r.consistency,
    communication: acc.communication + r.communication,
    knowledgeSharing: acc.knowledgeSharing + r.knowledgeSharing,
    collaboration: acc.collaboration + r.collaboration,
  }), { consistency: 0, communication: 0, knowledgeSharing: 0, collaboration: 0 });

  const averages = {
    consistency: Math.round((sum.consistency / count) * 10) / 10,
    communication: Math.round((sum.communication / count) * 10) / 10,
    knowledgeSharing: Math.round((sum.knowledgeSharing / count) * 10) / 10,
    collaboration: Math.round((sum.collaboration / count) * 10) / 10,
  };

  const overall = Math.round(
    ((averages.consistency + averages.communication + averages.knowledgeSharing + averages.collaboration) / 4) * 10,
  ) / 10;

  return { count, averages, overall };
}
