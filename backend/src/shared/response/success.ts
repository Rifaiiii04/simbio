import { type Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({ success: true, data });
}

export function sendSuccessList<T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number },
): void {
  res.status(200).json({ success: true, data, meta });
}
