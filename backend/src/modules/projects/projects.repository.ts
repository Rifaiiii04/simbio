import { prisma } from '../../infrastructure/database/prisma.js';
import { type ProjectStatus } from '../../../generated/prisma/index.js';

const PROJECT_SELECT = {
  id: true, partnershipId: true, title: true, description: true,
  status: true, createdAt: true, updatedAt: true,
  contributors: { select: { id: true, userId: true, role: true, createdAt: true, user: { select: { id: true, name: true, avatarUrl: true } } } },
} as const;

export async function findByPartnership(partnershipId: string) {
  return prisma.project.findMany({ where: { partnershipId }, select: PROJECT_SELECT });
}

export async function findByUser(userId: string) {
  return prisma.project.findMany({
    where: {
      partnership: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
    },
    select: PROJECT_SELECT,
  });
}

export async function findById(id: string) {
  return prisma.project.findUnique({ where: { id }, select: PROJECT_SELECT });
}

export async function create(data: { partnershipId: string; title: string; description?: string }) {
  return prisma.project.create({ data, select: PROJECT_SELECT });
}

export async function update(id: string, data: { title?: string; description?: string | null; status?: ProjectStatus }) {
  return prisma.project.update({ where: { id }, data, select: PROJECT_SELECT });
}

export async function addContributor(projectId: string, userId: string, role: string) {
  return prisma.projectContributor.create({ data: { projectId, userId, role } });
}
