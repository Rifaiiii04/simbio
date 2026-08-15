import { prisma } from '../../infrastructure/database/prisma.js';
import { type PartnershipStatus } from '../../../generated/prisma/index.js';

const PARTNERSHIP_SELECT = {
  id: true, requesterId: true, recipientId: true, status: true, createdAt: true, acceptedAt: true, updatedAt: true,
  requester: { select: { id: true, name: true, username: true, avatarUrl: true } },
  recipient: { select: { id: true, name: true, username: true, avatarUrl: true } },
} as const;

export async function findByUser(userId: string) {
  return prisma.partnership.findMany({
    where: { OR: [{ requesterId: userId }, { recipientId: userId }] },
    select: PARTNERSHIP_SELECT, orderBy: { createdAt: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.partnership.findUnique({ where: { id }, select: PARTNERSHIP_SELECT });
}

export async function findExisting(requesterId: string, recipientId: string) {
  return prisma.partnership.findFirst({
    where: { OR: [{ requesterId, recipientId }, { requesterId: recipientId, recipientId: requesterId }] },
  });
}

export async function create(requesterId: string, recipientId: string) {
  return prisma.partnership.create({ data: { requesterId, recipientId }, select: PARTNERSHIP_SELECT });
}

export async function updateStatus(id: string, status: PartnershipStatus, acceptedAt?: Date) {
  return prisma.partnership.update({ where: { id }, data: { status, ...(acceptedAt ? { acceptedAt } : {}) }, select: PARTNERSHIP_SELECT });
}

export async function getMessages(partnershipId: string) {
  return prisma.partnershipMessage.findMany({
    where: { partnershipId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createMessage(partnershipId: string, senderId: string, content: string) {
  return prisma.partnershipMessage.create({
    data: { partnershipId, senderId, content },
  });
}
