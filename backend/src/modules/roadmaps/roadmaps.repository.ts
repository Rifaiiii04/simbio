import { prisma } from '../../infrastructure/database/prisma.js';
import { type RoadmapStatus } from '../../../generated/prisma/index.js';

const ROADMAP_SELECT = {
  id: true, goalId: true, title: true, description: true,
  status: true, createdAt: true, updatedAt: true,
  milestones: { select: { id: true, title: true, order: true, status: true }, orderBy: { order: 'asc' as const } },
} as const;

export async function findRoadmapsByGoal(goalId: string, userId: string) {
  return prisma.roadmap.findMany({
    where: { goalId, goal: { userId } },
    select: ROADMAP_SELECT, orderBy: { createdAt: 'desc' },
  });
}

export async function findRoadmapById(id: string, userId: string) {
  return prisma.roadmap.findFirst({
    where: { id, goal: { userId } }, select: ROADMAP_SELECT,
  });
}

export async function createRoadmap(data: { goalId: string; title: string; description?: string }) {
  return prisma.roadmap.create({ data, select: ROADMAP_SELECT });
}

export async function updateRoadmap(id: string, data: { title?: string; description?: string | null; status?: RoadmapStatus }) {
  return prisma.roadmap.update({ where: { id }, data, select: ROADMAP_SELECT });
}

export async function deleteRoadmap(id: string) {
  return prisma.roadmap.delete({ where: { id } });
}
