import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError.js';
import { ErrorCode } from '../shared/errors/codes.js';
import { logger } from '../infrastructure/logger/index.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // Unknown errors — log internally, never expose details to client
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: { code: ErrorCode.INTERNAL_ERROR, message: 'An unexpected error occurred' },
  });
}
