import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as usersRepo from './users.repository.js';
import { type UpdateProfileInput } from './users.types.js';

export async function getOwnProfile(userId: string) {
  const user = await usersRepo.findOwnProfile(userId);
  if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
  return user;
}

export async function getPublicProfile(userId: string) {
  const user = await usersRepo.findPublicProfile(userId);
  if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
  return user;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  return usersRepo.updateProfile(userId, data);
}
