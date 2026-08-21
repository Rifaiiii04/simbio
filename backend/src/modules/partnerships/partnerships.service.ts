import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as repo from './partnerships.repository.js';

export async function getPartnerships(userId: string) { return repo.findByUser(userId); }

export async function getPartnership(userId: string, id: string) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(ErrorCode.NOT_FOUND, 'Partnership not found', 404);
  if (p.requesterId !== userId && p.recipientId !== userId) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);
  return p;
}

export async function requestPartnership(requesterId: string, recipientId: string, messageText?: string) {
  if (requesterId === recipientId) throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot partner with yourself', 400);
  const existing = await repo.findExisting(requesterId, recipientId);
  if (existing && existing.status === 'PENDING') throw new AppError(ErrorCode.CONFLICT, 'Partnership request already exists', 409);
  if (existing && existing.status === 'ACCEPTED') throw new AppError(ErrorCode.CONFLICT, 'Already partners', 409);

  const partnership = await repo.create(requesterId, recipientId);

  if (messageText && messageText.trim()) {
    await repo.createMessage({
      partnershipId: partnership.id,
      senderId: requesterId,
      content: messageText.trim(),
    });
  }

  // Real-time notify recipient
  try {
    const { getIO } = await import('../../infrastructure/websocket/socket.js');
    getIO()?.to(`user_${recipientId}`).emit('notification_badge_update');
  } catch {
    // ignore
  }

  return partnership;
}

export async function acceptPartnership(userId: string, id: string) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(ErrorCode.NOT_FOUND, 'Partnership not found', 404);
  if (p.recipientId !== userId) throw new AppError(ErrorCode.FORBIDDEN, 'Only recipient can accept', 403);
  if (p.status !== 'PENDING') throw new AppError(ErrorCode.VALIDATION_ERROR, 'Partnership is not pending', 400);
  
  const updated = await repo.updateStatus(id, 'ACCEPTED', new Date());

  // Post system announcement message into partnership chat
  try {
    const systemMsg = await repo.createMessage({
      partnershipId: id,
      senderId: null,
      senderType: 'SYSTEM',
      senderName: 'System',
      content: '🤝 Partnership connected! You can now share resources, build AI learning roadmaps, and launch collaborative focus sessions.',
      isRead: false,
    });

    const { getIO } = await import('../../infrastructure/websocket/socket.js');
    const io = getIO();
    io?.to(id).emit('receive_message', systemMsg);
    io?.to(`user_${p.requesterId}`).emit('notification_badge_update');
    io?.to(`user_${p.recipientId}`).emit('notification_badge_update');
  } catch {
    // ignore
  }

  return updated;
}

export async function rejectPartnership(userId: string, id: string) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(ErrorCode.NOT_FOUND, 'Partnership not found', 404);
  if (p.recipientId !== userId) throw new AppError(ErrorCode.FORBIDDEN, 'Only recipient can reject', 403);
  const updated = await repo.updateStatus(id, 'REJECTED');

  try {
    const { getIO } = await import('../../infrastructure/websocket/socket.js');
    getIO()?.to(`user_${p.requesterId}`).emit('notification_badge_update');
  } catch {
    // ignore
  }

  return updated;
}

export async function endPartnership(userId: string, id: string, messageText?: string) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(ErrorCode.NOT_FOUND, 'Partnership not found', 404);
  if (p.requesterId !== userId && p.recipientId !== userId) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);

  if (messageText && messageText.trim()) {
    const farewellMsg = await repo.createMessage({
      partnershipId: id,
      senderId: userId,
      content: messageText.trim(),
    });

    try {
      const { getIO } = await import('../../infrastructure/websocket/socket.js');
      getIO()?.to(id).emit('receive_message', farewellMsg);
    } catch {
      // ignore
    }
  }

  return repo.updateStatus(id, 'ENDED');
}

export async function getPartnershipMessages(userId: string, partnershipId: string) {
  await getPartnership(userId, partnershipId);
  return repo.getMessages(partnershipId);
}

export async function sendPartnershipMessage(userId: string, partnershipId: string, content: string, replyToId?: string) {
  const p = await getPartnership(userId, partnershipId);
  if (p.status !== 'ACCEPTED') throw new AppError(ErrorCode.VALIDATION_ERROR, 'Partnership must be active to send messages', 400);
  if (!content.trim()) throw new AppError(ErrorCode.VALIDATION_ERROR, 'Message content cannot be empty', 400);
  return repo.createMessage({
    partnershipId,
    senderId: userId,
    content: content.trim(),
    replyToId: replyToId || null,
  });
}

export async function markAsRead(userId: string, partnershipId: string) {
  await getPartnership(userId, partnershipId);
  const result = await repo.markMessagesAsRead(partnershipId, userId);

  if (result.count > 0) {
    try {
      const { getIO } = await import('../../infrastructure/websocket/socket.js');
      const io = getIO();
      io?.to(partnershipId).emit('messages_read', { partnershipId, readerId: userId, readAt: result.readAt });
      io?.to(`user_${userId}`).emit('notification_badge_update');
    } catch {
      // ignore
    }
  }

  return result;
}

export async function getNotificationSummary(userId: string) {
  return repo.getNotificationSummaryData(userId);
}
