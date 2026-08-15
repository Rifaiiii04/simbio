import { prisma } from '../../infrastructure/database/prisma.js';
import { type CheckInStatus } from '../../../generated/prisma/index.js';

const SELECT = { id: true, userId: true, milestoneId: true, commitmentId: true, status: true, note: true, createdAt: true } as const;

export async function findByUser(userId: string) {
  return prisma.checkIn.findMany({ where: { userId }, select: SELECT, orderBy: { createdAt: 'desc' } });
}

export async function create(data: { userId: string; milestoneId: string; commitmentId?: string; status: CheckInStatus; note?: string }) {
  return prisma.checkIn.create({ data, select: SELECT });
}
