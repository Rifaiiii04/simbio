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

  return partnership;
}

export async function acceptPartnership(userId: string, id: string) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(ErrorCode.NOT_FOUND, 'Partnership not found', 404);
  if (p.recipientId !== userId) throw new AppError(ErrorCode.FORBIDDEN, 'Only recipient can accept', 403);
  if (p.status !== 'PENDING') throw new AppError(ErrorCode.VALIDATION_ERROR, 'Partnership is not pending', 400);
  return repo.updateStatus(id, 'ACCEPTED', new Date());
}

export async function rejectPartnership(userId: string, id: string) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(ErrorCode.NOT_FOUND, 'Partnership not found', 404);
  if (p.recipientId !== userId) throw new AppError(ErrorCode.FORBIDDEN, 'Only recipient can reject', 403);
  return repo.updateStatus(id, 'REJECTED');
}

export async function endPartnership(userId: string, id: string) {
  const p = await repo.findById(id);
  if (!p) throw new AppError(ErrorCode.NOT_FOUND, 'Partnership not found', 404);
  if (p.requesterId !== userId && p.recipientId !== userId) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);
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
