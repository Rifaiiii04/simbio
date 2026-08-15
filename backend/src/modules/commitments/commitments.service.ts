import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as repo from './commitments.repository.js';
import { type CommitmentStatus } from '../../../generated/prisma/index.js';

export async function getAll(userId: string) { return repo.findByUser(userId); }
export async function getCurrent(userId: string) { return repo.findCurrent(userId); }

export async function create(userId: string, data: { milestoneId: string; title: string; weekStart: string; weekEnd: string }) {
  return repo.create({ userId, milestoneId: data.milestoneId, title: data.title, weekStart: new Date(data.weekStart), weekEnd: new Date(data.weekEnd) });
}

export async function update(userId: string, id: string, data: { title?: string; status?: CommitmentStatus }) {
  const item = await repo.findById(id, userId);
  if (!item) throw new AppError(ErrorCode.NOT_FOUND, 'Commitment not found', 404);
  return repo.update(id, userId, data);
}
