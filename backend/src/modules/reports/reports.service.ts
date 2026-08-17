import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import { type ReportReason, type ReportStatus, type ReportActionTaken } from '../../../generated/prisma/index.js';
import * as repo from './reports.repository.js';

export async function submitReport(data: {
  reporterId: string;
  reportedId: string;
  partnershipId?: string;
  reason: ReportReason;
  description?: string;
}) {
  if (data.reporterId === data.reportedId) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Cannot report yourself', 400);
  }

  return repo.createReport(data);
}

export async function listReportsForAdmin(statusFilter?: ReportStatus) {
  return repo.findReports(statusFilter);
}

export async function resolveReport(
  reportId: string,
  status: ReportStatus,
  actionTaken: ReportActionTaken
) {
  const report = await repo.findReportById(reportId);
  if (!report) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Report not found', 404);
  }

  if (actionTaken === 'BANNED') {
    await repo.setUserBannedStatus(report.reportedId, true);
  }

  return repo.updateReportStatus(reportId, status, actionTaken);
}

export async function banUserAccount(userId: string) {
  return repo.setUserBannedStatus(userId, true);
}

export async function deleteUserAccount(userId: string) {
  return repo.deleteUserAccount(userId);
}
