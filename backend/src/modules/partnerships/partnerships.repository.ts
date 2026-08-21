import { prisma } from '../../infrastructure/database/prisma.js';
import { type PartnershipStatus } from '../../../generated/prisma/index.js';

const PARTNERSHIP_SELECT = {
  id: true, requesterId: true, recipientId: true, status: true, createdAt: true, acceptedAt: true, updatedAt: true,
  requester: { select: { id: true, name: true, username: true, avatarUrl: true } },
  recipient: { select: { id: true, name: true, username: true, avatarUrl: true } },
} as const;

export async function findByUser(userId: string) {
  const partnerships = await prisma.partnership.findMany({
    where: { OR: [{ requesterId: userId }, { recipientId: userId }] },
    select: {
      ...PARTNERSHIP_SELECT,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          senderType: true,
          senderName: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate unread messages count per partnership for this user
  const unreadCounts = await prisma.partnershipMessage.groupBy({
    by: ['partnershipId'],
    where: {
      partnership: { OR: [{ requesterId: userId }, { recipientId: userId }] },
      senderId: { not: userId },
      isRead: false,
    },
    _count: { id: true },
  });

  const unreadMap = new Map<string, number>();
  unreadCounts.forEach((u) => {
    unreadMap.set(u.partnershipId, u._count.id);
  });

  return partnerships.map((p) => ({
    id: p.id,
    requesterId: p.requesterId,
    recipientId: p.recipientId,
    status: p.status,
    createdAt: p.createdAt,
    acceptedAt: p.acceptedAt,
    updatedAt: p.updatedAt,
    requester: p.requester,
    recipient: p.recipient,
    lastMessage: p.messages[0] || null,
    unreadCount: unreadMap.get(p.id) || 0,
  }));
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
    include: {
      replyTo: {
        select: {
          id: true,
          content: true,
          senderId: true,
          senderType: true,
          senderName: true,
        },
      },
    },
  });
}

export async function createMessage(data: {
  partnershipId: string;
  senderId?: string | null;
  senderType?: string;
  senderName?: string | null;
  content: string;
  replyToId?: string | null;
  isRead?: boolean;
}) {
  return prisma.partnershipMessage.create({
    data: {
      partnershipId: data.partnershipId,
      senderId: data.senderId ?? null,
      senderType: data.senderType || 'USER',
      senderName: data.senderName ?? null,
      content: data.content,
      replyToId: data.replyToId ?? null,
      isRead: data.isRead ?? false,
    },
    include: {
      replyTo: {
        select: {
          id: true,
          content: true,
          senderId: true,
          senderType: true,
          senderName: true,
        },
      },
    },
  });
}

export async function markMessagesAsRead(partnershipId: string, readerId: string) {
  const readAt = new Date();
  const updateResult = await prisma.partnershipMessage.updateMany({
    where: {
      partnershipId,
      senderId: { not: readerId },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt,
    },
  });

  return { count: updateResult.count, readAt };
}

export async function getNotificationSummaryData(userId: string) {
  const [pendingRequestsCount, unreadMessagesGroups] = await Promise.all([
    prisma.partnership.count({
      where: {
        recipientId: userId,
        status: 'PENDING',
      },
    }),
    prisma.partnershipMessage.groupBy({
      by: ['partnershipId'],
      where: {
        partnership: { OR: [{ requesterId: userId }, { recipientId: userId }] },
        senderId: { not: userId },
        isRead: false,
      },
      _count: { id: true },
    }),
  ]);

  const unreadByPartnership: Record<string, number> = {};
  let unreadMessagesCount = 0;

  unreadMessagesGroups.forEach((g) => {
    unreadByPartnership[g.partnershipId] = g._count.id;
    unreadMessagesCount += g._count.id;
  });

  const totalCount = pendingRequestsCount + unreadMessagesCount;

  return {
    pendingRequestsCount,
    unreadMessagesCount,
    totalCount,
    unreadByPartnership,
  };
}
