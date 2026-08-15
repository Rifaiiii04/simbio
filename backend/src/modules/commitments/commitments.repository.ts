import { prisma } from '../../infrastructure/database/prisma.js';
import { type CommitmentStatus } from '../../../generated/prisma/index.js';

const SELECT = { id: true, userId: true, milestoneId: true, title: true, weekStart: true, weekEnd: true, status: true, createdAt: true, updatedAt: true } as const;

export async function findByUser(userId: string) {
  return prisma.weeklyCommitment.findMany({ where: { userId }, select: SELECT, orderBy: { weekStart: 'desc' } });
}

export async function findCurrent(userId: string) {
  const now = new Date();
  return prisma.weeklyCommitment.findMany({
    where: { userId, weekStart: { lte: now }, weekEnd: { gte: now } },
    select: SELECT,
  });
}

export async function findById(id: string, userId: string) {
  return prisma.weeklyCommitment.findFirst({ where: { id, userId }, select: SELECT });
}

export async function create(data: { userId: string; milestoneId: string; title: string; weekStart: Date; weekEnd: Date }) {
  return prisma.weeklyCommitment.create({ data, select: SELECT });
}

export async function update(id: string, userId: string, data: { title?: string; status?: CommitmentStatus }) {
  return prisma.weeklyCommitment.update({ where: { id, userId }, data, select: SELECT });
}
