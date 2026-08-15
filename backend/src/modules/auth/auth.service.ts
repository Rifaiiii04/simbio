import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as authRepo from './auth.repository.js';
import { type AuthUser, type RegisterInput, type LoginInput, type TokenPayload } from './auth.types.js';

const BCRYPT_ROUNDS = 12;
const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export async function register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
  const existing = await authRepo.findUserByEmail(input.email);
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, 'Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await authRepo.createUser({
    email: input.email,
    passwordHash,
    name: input.name,
  });

  const token = await signToken(user.id);
  return { user, token };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  const userWithHash = await authRepo.findUserByEmail(input.email);
  if (!userWithHash) {
    // Use the same error for missing user and wrong password to prevent enumeration
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(input.password, userWithHash.passwordHash);
  if (!valid) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid email or password', 401);
  }

  const { passwordHash: _omit, ...user } = userWithHash;
  const token = await signToken(user.id);
  return { user, token };
}

export async function getMe(userId: string): Promise<AuthUser> {
  const user = await authRepo.findUserById(userId);
  if (!user) {
    throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
  }
  return user;
}

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId } satisfies TokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(jwtSecret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return payload as TokenPayload;
  } catch {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token', 401);
  }
}
