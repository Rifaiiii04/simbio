import { prisma } from '../../infrastructure/database/prisma.js';

const SELECT = { id: true, userId: true, milestoneId: true, startedAt: true, completedAt: true, duration: true, status: true } as const;

export async function findByUser(userId: string) {
  return prisma.focusSession.findMany({ where: { userId }, select: SELECT, orderBy: { startedAt: 'desc' } });
}

export async function findById(id: string, userId: string) {
  return prisma.focusSession.findFirst({ where: { id, userId }, select: SELECT });
}

export async function create(data: { userId: string; milestoneId?: string; startedAt: Date }) {
  return prisma.focusSession.create({ data: { ...data, status: 'IN_PROGRESS' }, select: SELECT });
}

export async function complete(id: string, userId: string, data: { completedAt: Date; duration: number }) {
  return prisma.focusSession.update({ where: { id, userId }, data: { ...data, status: 'COMPLETED' }, select: SELECT });
}

export async function abort(id: string, userId: string) {
  return prisma.focusSession.update({ where: { id, userId }, data: { status: 'ABORTED' }, select: SELECT });
}
