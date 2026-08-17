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

  return repo.deleteById(topicId);
}
