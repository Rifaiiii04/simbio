import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as repo from './milestones.repository.js';
import { type MilestoneStatus } from '../../../generated/prisma/index.js';

export async function getMilestones(userId: string, roadmapId: string) {
  return repo.findByRoadmap(roadmapId, userId);
}

export async function getMilestone(userId: string, id: string) {
  const m = await repo.findById(id, userId);
  if (!m) throw new AppError(ErrorCode.NOT_FOUND, 'Milestone not found', 404);
  return m;
}

export async function createMilestone(userId: string, data: { roadmapId: string; title: string; description?: string; order: number }) {
  const { prisma } = await import('../../infrastructure/database/prisma.js');
  const roadmap = await prisma.roadmap.findFirst({ where: { id: data.roadmapId, goal: { userId } } });
  if (!roadmap) throw new AppError(ErrorCode.NOT_FOUND, 'Roadmap not found', 404);
  return repo.create(data);
}

export async function updateMilestone(userId: string, id: string, data: { title?: string; description?: string | null; order?: number; status?: MilestoneStatus }) {
  const m = await repo.findById(id, userId);
  if (!m) throw new AppError(ErrorCode.NOT_FOUND, 'Milestone not found', 404);
  return repo.update(id, data);
}

export async function completeMilestone(userId: string, id: string) {
  return updateMilestone(userId, id, { status: 'COMPLETED' });
}

export async function uncompleteMilestone(userId: string, id: string) {
  return updateMilestone(userId, id, { status: 'TODO' });
}

export async function deleteMilestone(userId: string, id: string) {
  const m = await repo.findById(id, userId);
  if (!m) throw new AppError(ErrorCode.NOT_FOUND, 'Milestone not found', 404);
  await repo.remove(id);
}

export async function getProgress(userId: string, roadmapId: string) {
  // Verify access
  const { prisma } = await import('../../infrastructure/database/prisma.js');
  const roadmap = await prisma.roadmap.findFirst({ where: { id: roadmapId, goal: { userId } } });
  if (!roadmap) throw new AppError(ErrorCode.NOT_FOUND, 'Roadmap not found', 404);
  return repo.getProgress(roadmapId);
}
