import { prisma } from '../../infrastructure/database/prisma.js';
import { type GoalStatus } from '../../../generated/prisma/index.js';

const GOAL_SELECT = {
  id: true,
  userId: true,
  skillId: true,
  title: true,
  description: true,
  targetOutcome: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  skill: { select: { id: true, name: true, slug: true } },
} as const;

export async function findGoalsByUser(userId: string) {
  return prisma.learningGoal.findMany({ where: { userId }, select: GOAL_SELECT, orderBy: { createdAt: 'desc' } });
}

export async function findGoalById(id: string, userId: string) {
  return prisma.learningGoal.findFirst({ where: { id, userId }, select: GOAL_SELECT });
}

export async function createGoal(data: {
  userId: string; skillId: string; title: string;
  description?: string; targetOutcome?: string;
}) {
  return prisma.learningGoal.create({ data, select: GOAL_SELECT });
}

export async function updateGoal(id: string, userId: string, data: {
  title?: string; description?: string | null; targetOutcome?: string | null; status?: GoalStatus;
}) {
  return prisma.learningGoal.update({ where: { id, userId }, data, select: GOAL_SELECT });
}

export async function deleteGoal(id: string, userId: string) {
  return prisma.learningGoal.delete({ where: { id, userId } });
}
