import { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import * as reportsService from './reports.service.js';
import { sendSuccess } from '../../shared/response/success.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import { type ReportReason, type ReportStatus, type ReportActionTaken } from '../../../generated/prisma/index.js';

const submitReportSchema = z.object({
  reportedId: z.string().uuid(),
  partnershipId: z.string().uuid().optional(),
  reason: z.enum(['INAPPROPRIATE_BEHAVIOR', 'SPAM', 'HARASSMENT', 'SCAM', 'OTHER']),
  description: z.string().optional(),
});

const resolveReportSchema = z.object({
  status: z.enum(['PENDING', 'RESOLVED', 'DISMISSED']),
  actionTaken: z.enum(['NONE', 'WARNED', 'BANNED', 'DELETED']),
});

function uid(req: Request): string {
  if (!req.user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
  return req.user.id;
}

export async function createReportHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reporterId = uid(req);
    const { reportedId, partnershipId, reason, description } = submitReportSchema.parse(req.body);

    const report = await reportsService.submitReport({
      reporterId,
      reportedId,
      partnershipId,
      reason: reason as ReportReason,
      description,
    });

    sendSuccess(res, { report }, 201);
  } catch (err) { next(err); }
}

export async function adminListReportsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.query as { status?: string };
    const statusFilter = status && ['PENDING', 'RESOLVED', 'DISMISSED'].includes(status) ? (status as ReportStatus) : undefined;

    const reports = await reportsService.listReportsForAdmin(statusFilter);
    sendSuccess(res, { reports });
  } catch (err) { next(err); }
}

export async function adminResolveReportHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { status, actionTaken } = resolveReportSchema.parse(req.body);

    const report = await reportsService.resolveReport(id, status as ReportStatus, actionTaken as ReportActionTaken);
    sendSuccess(res, { report });
  } catch (err) { next(err); }
}

export async function adminBanUserHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params as { userId: string };
    await reportsService.banUserAccount(userId);
    sendSuccess(res, { message: 'User account banned successfully' });
  } catch (err) { next(err); }
}

export async function adminDeleteUserHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params as { userId: string };
    await reportsService.deleteUserAccount(userId);
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}
