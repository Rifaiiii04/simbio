import { type ErrorCodeType } from './codes.js';

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;

  constructor(code: ErrorCodeType, message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    // Maintains proper prototype chain in TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
