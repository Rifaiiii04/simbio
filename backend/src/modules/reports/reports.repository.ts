import { prisma } from '../../infrastructure/database/prisma.js';
import { type ReportReason, type ReportStatus, type ReportActionTaken } from '../../../generated/prisma/index.js';

export async function createReport(data: {
  reporterId: string;
  reportedId: string;
  partnershipId?: string;
  reason: ReportReason;
  description?: string;
}) {
  return prisma.userReport.create({
    data: {
      reporterId: data.reporterId,
      reportedId: data.reportedId,
      partnershipId: data.partnershipId,
      reason: data.reason,
      description: data.description,
    },
    include: {
      reporter: { select: { id: true, name: true, email: true, username: true } },
      reported: { select: { id: true, name: true, email: true, username: true, isBanned: true } },
    },
  });
}

export async function findReports(statusFilter?: ReportStatus) {
  return prisma.userReport.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { id: true, name: true, email: true, username: true } },
      reported: { select: { id: true, name: true, email: true, username: true, isBanned: true } },
      partnership: { select: { id: true, status: true } },
    },
  });
}

export async function findReportById(id: string) {
  return prisma.userReport.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, name: true, email: true, username: true } },
      reported: { select: { id: true, name: true, email: true, username: true, isBanned: true } },
      partnership: { select: { id: true, status: true } },
    },
  });
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  actionTaken: ReportActionTaken
) {
  return prisma.userReport.update({
    where: { id },
    data: {
      status,
      actionTaken,
      resolvedAt: new Date(),
    },
  });
}

export async function setUserBannedStatus(userId: string, isBanned: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isBanned,
      bannedAt: isBanned ? new Date() : null,
    },
  });
}

export async function deleteUserAccount(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}
