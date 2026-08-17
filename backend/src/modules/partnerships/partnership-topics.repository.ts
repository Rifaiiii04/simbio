import { prisma } from '../../infrastructure/database/prisma.js';

export async function findByPartnership(partnershipId: string) {
  return prisma.partnershipTopic.findMany({
    where: { partnershipId },
    orderBy: [
      { targetUserId: 'asc' },
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
    include: {
      targetUser: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });
}

export async function findById(id: string) {
  return prisma.partnershipTopic.findUnique({
    where: { id },
  });
}

export async function create(data: {
  partnershipId: string;
  targetUserId: string;
  title: string;
  description?: string;
  category?: string;
  isAiGenerated?: boolean;
  order?: number;
}) {
  return prisma.partnershipTopic.create({
    data: {
      partnershipId: data.partnershipId,
      targetUserId: data.targetUserId,
      title: data.title,
      description: data.description,
      category: data.category,
      isAiGenerated: data.isAiGenerated ?? false,
      order: data.order ?? 0,
    },
    include: {
      targetUser: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });
}

export async function bulkCreate(
  topics: Array<{
    partnershipId: string;
    targetUserId: string;
    title: string;
    description?: string;
    category?: string;
    isAiGenerated?: boolean;
    order?: number;
  }>
) {
  await prisma.partnershipTopic.createMany({
    data: topics.map((t) => ({
      partnershipId: t.partnershipId,
      targetUserId: t.targetUserId,
      title: t.title,
      description: t.description,
      category: t.category,
      isAiGenerated: t.isAiGenerated ?? true,
      order: t.order ?? 0,
    })),
  });

  return findByPartnership(topics[0].partnershipId);
}

export async function toggleCompletion(id: string, isCompleted: boolean) {
  return prisma.partnershipTopic.update({
    where: { id },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    include: {
      targetUser: { select: { id: true, name: true, username: true, avatarUrl: true } },
    },
  });
}

export async function deleteById(id: string) {
  return prisma.partnershipTopic.delete({
    where: { id },
  });
}
