import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import { OpenRouterProvider } from '../../infrastructure/ai/openrouter.provider.js';
import * as repo from './partnership-topics.repository.js';

const aiProvider = new OpenRouterProvider();

async function getPrimarySkillToLearn(userId: string, partnerId: string): Promise<string> {
  // Check skills User A wants to learn that Partner teaches
  const [myLearnSkills, myGoals, partnerTeachSkills] = await Promise.all([
    prisma.userSkill.findMany({ where: { userId, type: 'LEARN' }, include: { skill: true } }),
    prisma.learningGoal.findMany({ where: { userId }, include: { skill: true } }),
    prisma.userSkill.findMany({ where: { userId: partnerId, type: 'TEACH' }, include: { skill: true } }),
  ]);

  const partnerTeachNames = partnerTeachSkills.map((s) => s.skill.name);

  // 1. Direct Intersection: My LEARN ∩ Partner TEACH
  const matchUserSkill = myLearnSkills.find((s) => partnerTeachNames.includes(s.skill.name));
  if (matchUserSkill) return matchUserSkill.skill.name;

  const matchGoal = myGoals.find((g) => g.skill && partnerTeachNames.includes(g.skill.name));
  if (matchGoal && matchGoal.skill) return matchGoal.skill.name;

  // 2. Partner's TEACH skill
  if (partnerTeachSkills.length > 0) return partnerTeachSkills[0].skill.name;

  // 3. My LEARN skill
  if (myLearnSkills.length > 0) return myLearnSkills[0].skill.name;
  if (myGoals.length > 0 && myGoals[0].skill) return myGoals[0].skill.name;

  return 'General Reciprocal Skill Exchange';
}

export async function getTopicsForPartnership(userId: string, partnershipId: string) {
  const p = await prisma.partnership.findFirst({
    where: {
      id: partnershipId,
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
  });

  if (!p) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied to partnership', 403);
  return repo.findByPartnership(partnershipId);
}

export async function generateAiTopicsForPartnership(userId: string, partnershipId: string) {
  const p = await prisma.partnership.findFirst({
    where: {
      id: partnershipId,
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
  });

  if (!p) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied to partnership', 403);

  const requesterId = p.requesterId;
  const recipientId = p.recipientId;

  // Resolve target skill to learn for Requester (User A) and Recipient (User B)
  const [skillForA, skillForB] = await Promise.all([
    getPrimarySkillToLearn(requesterId, recipientId),
    getPrimarySkillToLearn(recipientId, requesterId),
  ]);

  // Generate topics using AI for both users simultaneously
  let topicsA: Array<{ title: string; description: string }> = [];
  let topicsB: Array<{ title: string; description: string }> = [];

  try {
    topicsA = await aiProvider.generateLearningTopics(skillForA);
  } catch {
    topicsA = [
      { title: `Dasar & Konsep ${skillForA}`, description: `Pengenalan fundamental ${skillForA}` },
      { title: `Struktur & Architecture ${skillForA}`, description: `Pembahasan pola dan arsitektur ${skillForA}` },
      { title: `Studi Kasus & Best Practices`, description: `Diskusi penerapan langsung ${skillForA}` },
    ];
  }

  try {
    topicsB = await aiProvider.generateLearningTopics(skillForB);
  } catch {
    topicsB = [
      { title: `Dasar & Konsep ${skillForB}`, description: `Pengenalan fundamental ${skillForB}` },
      { title: `Struktur & Architecture ${skillForB}`, description: `Pembahasan pola dan arsitektur ${skillForB}` },
      { title: `Studi Kasus & Best Practices`, description: `Diskusi penerapan langsung ${skillForB}` },
    ];
  }

  const toCreate: Array<{
    partnershipId: string;
    targetUserId: string;
    title: string;
    description?: string;
    category?: string;
    isAiGenerated: boolean;
    order: number;
  }> = [];

  topicsA.forEach((item, index) => {
    toCreate.push({
      partnershipId,
      targetUserId: requesterId,
      title: item.title,
      description: item.description,
      category: skillForA,
      isAiGenerated: true,
      order: index,
    });
  });

  topicsB.forEach((item, index) => {
    toCreate.push({
      partnershipId,
      targetUserId: recipientId,
      title: item.title,
      description: item.description,
      category: skillForB,
      isAiGenerated: true,
      order: index,
    });
  });

  return repo.bulkCreate(toCreate);
}

export async function generateAiProposalForPartnership(userId: string, partnershipId: string) {
  const p = await prisma.partnership.findFirst({
    where: {
      id: partnershipId,
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
    include: {
      requester: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
    },
  });

  if (!p) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied to partnership', 403);

  // Check if there are active uncompleted topics for this partnership
  const existingTopics = await repo.findByPartnership(partnershipId);
  if (existingTopics.length > 0 && existingTopics.some((t) => !t.isCompleted)) {
    throw new AppError(
      ErrorCode.CONFLICT,
      'You cannot generate a new AI roadmap proposal while there are active uncompleted topics. Please complete all current checklist topics first, or manage them manually.',
      409
    );
  }

  const requesterId = p.requesterId;
  const recipientId = p.recipientId;

  const [skillForA, skillForB] = await Promise.all([
    getPrimarySkillToLearn(requesterId, recipientId),
    getPrimarySkillToLearn(recipientId, requesterId),
  ]);

  let topicsA: Array<{ title: string; description: string }> = [];
  let topicsB: Array<{ title: string; description: string }> = [];

  try {
    topicsA = await aiProvider.generateLearningTopics(skillForA);
  } catch {
    topicsA = [
      { title: `Dasar & Konsep ${skillForA}`, description: `Pengenalan fundamental ${skillForA}` },
      { title: `Struktur & Architecture ${skillForA}`, description: `Pembahasan pola dan arsitektur ${skillForA}` },
      { title: `Studi Kasus & Best Practices`, description: `Diskusi penerapan langsung ${skillForA}` },
    ];
  }

  try {
    topicsB = await aiProvider.generateLearningTopics(skillForB);
  } catch {
    topicsB = [
      { title: `Dasar & Konsep ${skillForB}`, description: `Pengenalan fundamental ${skillForB}` },
      { title: `Struktur & Architecture ${skillForB}`, description: `Pembahasan pola dan arsitektur ${skillForB}` },
      { title: `Studi Kasus & Best Practices`, description: `Diskusi penerapan langsung ${skillForB}` },
    ];
  }

  const draftTopics: Array<{
    id: string;
    targetUserId: string;
    targetUserName: string;
    category: string;
    title: string;
    description?: string;
  }> = [];

  topicsA.forEach((item, index) => {
    draftTopics.push({
      id: `draft-a-${index}-${Date.now()}`,
      targetUserId: requesterId,
      targetUserName: p.requester.name,
      category: skillForA,
      title: item.title,
      description: item.description,
    });
  });

  topicsB.forEach((item, index) => {
    draftTopics.push({
      id: `draft-b-${index}-${Date.now()}`,
      targetUserId: recipientId,
      targetUserName: p.recipient.name,
      category: skillForB,
      title: item.title,
      description: item.description,
    });
  });

  const proposalPayload = {
    type: 'ROADMAP_PROPOSAL',
    proposalId: `prop-${Date.now()}`,
    status: 'PENDING',
    createdByUserId: userId,
    createdByName: userId === p.requesterId ? p.requester.name : p.recipient.name,
    approvedByUsers: [] as string[],
    topics: draftTopics,
  };

  const message = await prisma.partnershipMessage.create({
    data: {
      partnershipId,
      senderId: userId,
      content: JSON.stringify(proposalPayload),
    },
  });

  return message;
}

export async function updateProposalDraft(
  userId: string,
  partnershipId: string,
  messageId: string,
  updatedTopics: Array<{
    id: string;
    targetUserId: string;
    targetUserName: string;
    category: string;
    title: string;
    description?: string;
  }>
) {
  const message = await prisma.partnershipMessage.findFirst({
    where: { id: messageId, partnershipId },
  });

  if (!message) throw new AppError(ErrorCode.NOT_FOUND, 'Proposal message not found', 404);

  let payload: any;
  try {
    payload = JSON.parse(message.content);
  } catch {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid proposal message content', 400);
  }

  if (payload.type !== 'ROADMAP_PROPOSAL') {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Message is not a roadmap proposal', 400);
  }

  if (payload.status !== 'PENDING') {
    throw new AppError(ErrorCode.CONFLICT, 'Proposal has already been approved or finalized', 400);
  }

  payload.topics = updatedTopics;
  // Reset approval array on draft edits so both partners re-confirm modified topics
  payload.approvedByUsers = [];

  const updatedMessage = await prisma.partnershipMessage.update({
    where: { id: messageId },
    data: { content: JSON.stringify(payload) },
  });

  return updatedMessage;
}

export async function approveProposal(
  userId: string,
  partnershipId: string,
  messageId: string,
  approvedTopics: Array<{
    targetUserId: string;
    title: string;
    description?: string;
    category?: string;
  }>
) {
  const message = await prisma.partnershipMessage.findFirst({
    where: { id: messageId, partnershipId },
  });

  if (!message) throw new AppError(ErrorCode.NOT_FOUND, 'Proposal message not found', 404);

  let payload: any;
  try {
    payload = JSON.parse(message.content);
  } catch {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid proposal content', 400);
  }

  if (payload.type !== 'ROADMAP_PROPOSAL') {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Message is not a roadmap proposal', 400);
  }

  if (payload.status === 'APPROVED') {
    throw new AppError(ErrorCode.CONFLICT, 'Proposal has already been fully approved', 400);
  }

  if (!Array.isArray(payload.approvedByUsers)) {
    payload.approvedByUsers = [];
  }

  if (!payload.approvedByUsers.includes(userId)) {
    payload.approvedByUsers.push(userId);
  }

  // Update topics payload with latest approved list
  if (Array.isArray(approvedTopics) && approvedTopics.length > 0) {
    payload.topics = approvedTopics;
  }

  let activeTopics: any[] = [];

  // Check if BOTH users have approved (dual approval)
  if (payload.approvedByUsers.length >= 2) {
    payload.status = 'APPROVED';
    payload.approvedAt = new Date().toISOString();

    const topicsToSave = payload.topics.map((t: any, index: number) => ({
      partnershipId,
      targetUserId: t.targetUserId,
      title: t.title,
      description: t.description,
      category: t.category,
      isAiGenerated: true,
      order: index,
    }));

    activeTopics = await repo.bulkCreate(topicsToSave);
  }

  const updatedMessage = await prisma.partnershipMessage.update({
    where: { id: messageId },
    data: { content: JSON.stringify(payload) },
  });

  return { activeTopics, message: updatedMessage, isFullyApproved: payload.status === 'APPROVED' };
}

export async function addManualTopic(
  userId: string,
  partnershipId: string,
  targetUserId: string,
  title: string,
  description?: string
) {
  const p = await prisma.partnership.findFirst({
    where: {
      id: partnershipId,
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
  });

  if (!p) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);
  if (!title.trim()) throw new AppError(ErrorCode.VALIDATION_ERROR, 'Topic title cannot be empty', 400);

  return repo.create({
    partnershipId,
    targetUserId,
    title: title.trim(),
    description: description?.trim() || undefined,
    isAiGenerated: false,
  });
}

export async function toggleTopic(userId: string, topicId: string) {
  const topic = await repo.findById(topicId);
  if (!topic) throw new AppError(ErrorCode.NOT_FOUND, 'Topic not found', 404);

  const p = await prisma.partnership.findFirst({
    where: {
      id: topic.partnershipId,
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
  });

  if (!p) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);

  // Enforce ownership rule: User can ONLY check off topics in their OWN learning list!
  if (topic.targetUserId !== userId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      'You can only check off topics in your own learning checklist',
      403
    );
  }

  return repo.toggleCompletion(topicId, !topic.isCompleted);
}

export async function deleteTopic(userId: string, topicId: string) {
  const topic = await repo.findById(topicId);
  if (!topic) throw new AppError(ErrorCode.NOT_FOUND, 'Topic not found', 404);

  const p = await prisma.partnership.findFirst({
    where: {
      id: topic.partnershipId,
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
  });

  if (!p) throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);

  // Enforce ownership rule: User can ONLY delete topics from their OWN learning list!
  if (topic.targetUserId !== userId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      'You can only delete topics from your own learning checklist',
      403
    );
  }

  return repo.deleteById(topicId);
}
