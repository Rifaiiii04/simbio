import { type Request, type Response, type NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.validation.js';
import * as authService from './auth.service.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    sendSuccess(res, { user: result.user, token: result.token }, 201);
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    sendSuccess(res, { user: result.user, token: result.token });
  } catch (err) {
    next(err);
  }
}

export async function getMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}

export function logoutHandler(_req: Request, res: Response): void {
  // JWT is stateless — client discards the token.
  // If token blacklisting is needed in the future, implement it here.
  sendSuccess(res, { message: 'Logged out successfully' });
}
