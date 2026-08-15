import { prisma } from '../../infrastructure/database/prisma.js';
import { type MilestoneStatus } from '../../../generated/prisma/index.js';

const SELECT = {
  id: true, roadmapId: true, title: true, description: true,
  order: true, status: true, createdAt: true, updatedAt: true,
} as const;

export async function findByRoadmap(roadmapId: string, userId: string) {
  return prisma.milestone.findMany({
    where: { roadmapId, roadmap: { goal: { userId } } },
    select: SELECT, orderBy: { order: 'asc' },
  });
}

export async function findById(id: string, userId: string) {
  return prisma.milestone.findFirst({ where: { id, roadmap: { goal: { userId } } }, select: SELECT });
}

export async function create(data: { roadmapId: string; title: string; description?: string; order: number }) {
  return prisma.milestone.create({ data, select: SELECT });
}

export async function update(id: string, data: { title?: string; description?: string | null; order?: number; status?: MilestoneStatus }) {
  return prisma.milestone.update({ where: { id }, data, select: SELECT });
}

export async function remove(id: string) {
  return prisma.milestone.delete({ where: { id } });
}

// Deterministic progress calculation: completed / total
export async function getProgress(roadmapId: string): Promise<{ completed: number; total: number; percentage: number }> {
  const milestones = await prisma.milestone.findMany({ where: { roadmapId }, select: { status: true } });
  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'COMPLETED').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}
