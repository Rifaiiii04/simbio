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

export async function checkUsername(username: string, currentUserId?: string): Promise<{ available: boolean; message: string }> {
  const trimmed = username.trim().toLowerCase();
  if (!trimmed || trimmed.length < 3) {
    return { available: false, message: 'Username must be at least 3 characters' };
  }
  if (trimmed.length > 30) {
    return { available: false, message: 'Username must be at most 30 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { available: false, message: 'Username may only contain letters, numbers, and underscores' };
  }

  const existing = await usersRepo.findByUsername(trimmed);
  if (existing && existing.id !== currentUserId) {
    return { available: false, message: 'Username is already taken by another user' };
  }

  return { available: true, message: 'Username is available' };
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  if (data.username !== undefined && data.username !== null) {
    const check = await checkUsername(data.username, userId);
    if (!check.available) {
      throw new AppError(ErrorCode.CONFLICT, check.message, 409);
    }
    data.username = data.username.trim().toLowerCase();
  }
  return usersRepo.updateProfile(userId, data);
}
