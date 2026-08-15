import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as repo from './projects.repository.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { type ProjectStatus } from '../../../generated/prisma/index.js';

async function verifyPartnerAccess(userId: string, partnershipId: string) {
  const p = await prisma.partnership.findFirst({ where: { id: partnershipId, OR: [{ requesterId: userId }, { recipientId: userId }], status: 'ACCEPTED' } });
  if (!p) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied or partnership not accepted', 403);
  return p;
}

async function verifyProjectAccess(userId: string, projectId: string) {
  const project = await repo.findById(projectId);
  if (!project) throw new AppError(ErrorCode.NOT_FOUND, 'Project not found', 404);
  await verifyPartnerAccess(userId, project.partnershipId);
  return project;
}

export async function getProjects(userId: string, partnershipId?: string) {
  if (partnershipId) {
    await verifyPartnerAccess(userId, partnershipId);
    return repo.findByPartnership(partnershipId);
  }
  return repo.findByUser(userId);
}

export async function getProject(userId: string, id: string) {
  return verifyProjectAccess(userId, id);
}

export async function createProject(userId: string, data: { partnershipId: string; title: string; description?: string }) {
  await verifyPartnerAccess(userId, data.partnershipId);
  return repo.create(data);
}

export async function updateProject(userId: string, id: string, data: { title?: string; description?: string | null; status?: ProjectStatus }) {
  await verifyProjectAccess(userId, id);
  return repo.update(id, data);
}

export async function addContributor(userId: string, projectId: string, contributorId: string, role: string) {
  await verifyProjectAccess(userId, projectId);
  try { return await repo.addContributor(projectId, contributorId, role); }
  catch { throw new AppError(ErrorCode.CONFLICT, 'Contributor already added', 409); }
}
