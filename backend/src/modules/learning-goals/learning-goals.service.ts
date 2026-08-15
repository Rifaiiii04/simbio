import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as repo from './learning-goals.repository.js';
import { type GoalStatus } from '../../../generated/prisma/index.js';

export async function getGoals(userId: string) { return repo.findGoalsByUser(userId); }

export async function getGoal(userId: string, id: string) {
  const goal = await repo.findGoalById(id, userId);
  if (!goal) throw new AppError(ErrorCode.NOT_FOUND, 'Goal not found', 404);
  return goal;
}

export async function createGoal(userId: string, data: { skillId: string; title: string; description?: string; targetOutcome?: string }) {
  return repo.createGoal({ userId, ...data });
}

export async function updateGoal(userId: string, id: string, data: { title?: string; description?: string | null; targetOutcome?: string | null; status?: GoalStatus }) {
  const goal = await repo.findGoalById(id, userId);
  if (!goal) throw new AppError(ErrorCode.NOT_FOUND, 'Goal not found', 404);
  return repo.updateGoal(id, userId, data);
}

export async function deleteGoal(userId: string, id: string) {
  const goal = await repo.findGoalById(id, userId);
  if (!goal) throw new AppError(ErrorCode.NOT_FOUND, 'Goal not found', 404);
  await repo.deleteGoal(id, userId);
}
