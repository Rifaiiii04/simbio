import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as repo from './roadmaps.repository.js';
import { type RoadmapStatus } from '../../../generated/prisma/index.js';

export async function getRoadmaps(userId: string, goalId: string) {
  return repo.findRoadmapsByGoal(goalId, userId);
}

export async function getRoadmap(userId: string, id: string) {
  const roadmap = await repo.findRoadmapById(id, userId);
  if (!roadmap) throw new AppError(ErrorCode.NOT_FOUND, 'Roadmap not found', 404);
  return roadmap;
}

export async function createRoadmap(userId: string, data: { goalId: string; title: string; description?: string }) {
  // Verify the goal belongs to the user (authorization)
  const { prisma } = await import('../../infrastructure/database/prisma.js');
  const goal = await prisma.learningGoal.findFirst({ where: { id: data.goalId, userId } });
  if (!goal) throw new AppError(ErrorCode.NOT_FOUND, 'Goal not found', 404);
  return repo.createRoadmap(data);
}

export async function updateRoadmap(userId: string, id: string, data: { title?: string; description?: string | null; status?: RoadmapStatus }) {
  const roadmap = await repo.findRoadmapById(id, userId);
  if (!roadmap) throw new AppError(ErrorCode.NOT_FOUND, 'Roadmap not found', 404);
  return repo.updateRoadmap(id, data);
}

export async function deleteRoadmap(userId: string, id: string) {
  const roadmap = await repo.findRoadmapById(id, userId);
  if (!roadmap) throw new AppError(ErrorCode.NOT_FOUND, 'Roadmap not found', 404);
  await repo.deleteRoadmap(id);
}
