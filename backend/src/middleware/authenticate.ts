import { type Request, type Response, type NextFunction } from 'express';
import * as authService from '../modules/auth/auth.service.js';
import { AppError } from '../shared/errors/AppError.js';
import { ErrorCode } from '../shared/errors/codes.js';

// Extend the Express Request type to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const token = header.slice(7);
    const payload = await authService.verifyToken(token);

    if (!payload.sub) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid token payload', 401);
    }

    req.user = { id: payload.sub };
    next();
  } catch (err) {
    next(err);
  }
}
