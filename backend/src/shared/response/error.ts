import { type Response } from 'express';
import { type ErrorCodeType } from '../errors/codes.js';

export function sendError(
  res: Response,
  code: ErrorCodeType,
  message: string,
  statusCode = 500,
): void {
  res.status(statusCode).json({ success: false, error: { code, message } });
}
