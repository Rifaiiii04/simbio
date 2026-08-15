import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { ErrorCode } from '../shared/errors/codes.js';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(ErrorCode.NOT_FOUND, 'Route not found', 404));
}
