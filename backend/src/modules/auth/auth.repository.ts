import { prisma } from '../../infrastructure/database/prisma.js';
import { type AuthUser } from './auth.types.js';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  username: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
} as const;

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
}): Promise<AuthUser> {
  return prisma.user.create({
    data,
    select: USER_SELECT,
  });
}

export async function findUserByEmail(
  email: string,
): Promise<(AuthUser & { passwordHash: string }) | null> {
  return prisma.user.findUnique({
    where: { email },
    select: { ...USER_SELECT, passwordHash: true },
  });
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });
}
