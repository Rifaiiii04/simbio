import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import { OpenRouterProvider } from '../../infrastructure/ai/openrouter.provider.js';
import { type AudioCallMode, type AudioSessionStatus } from '../../../generated/prisma/index.js';
import * as audioRepo from './audio-session.repository.js';
import { calculateSkillIntersection, type SkillItem } from './skill-intersection.js';

const aiProvider = new OpenRouterProvider();

const PREPARING_DURATION_MS = 30 * 1000; // 30s preparation warm-up
const TURN_DURATION_MS = 5 * 60 * 1000; // 5 min per speaker turn
const NORMAL_CALL_DURATION_MS = 10 * 60 * 1000; // 10 min total normal audio call limit

async function getFormattedUserSkills(userId: string) {
  const [userSkills, learningGoals] = await Promise.all([
    prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    }),
    prisma.learningGoal.findMany({
      where: { userId },
      include: { skill: true },
    }),
  ]);

  const teachSkills: SkillItem[] = userSkills
    .filter((s) => s.type === 'TEACH')
    .map((s) => ({ name: s.skill.name, slug: s.skill.slug }));

  const learnSkillMap = new Map<string, SkillItem>();

  userSkills
    .filter((s) => s.type === 'LEARN')
    .forEach((s) => learnSkillMap.set(s.skill.slug, { name: s.skill.name, slug: s.skill.slug }));

  learningGoals.forEach((g) => {
    if (g.skill) {
      learnSkillMap.set(g.skill.slug, { name: g.skill.name, slug: g.skill.slug });
    }
  });

  return { teachSkills, learnSkills: Array.from(learnSkillMap.values()) };
}

async function resolveTopicForSpeaker(speakerId: string, partnerId: string): Promise<string> {
  const speakerSkills = await getFormattedUserSkills(speakerId);
  const partnerSkills = await getFormattedUserSkills(partnerId);

  // 1. Primary: Direct Skill Intersection (Speaker TEACH ∩ Partner LEARN)
  const intersection = calculateSkillIntersection(speakerSkills.teachSkills, partnerSkills.learnSkills);

  if (intersection.length > 0) {
    try {
      return await aiProvider.generateAudioTopic(intersection[0].name);
    } catch {
      return `Discussion & Exchange on ${intersection[0].name}`;
    }
  }

  // 2. Fallback A: Speaker's primary TEACH skill
  if (speakerSkills.teachSkills.length > 0) {
    try {
      return await aiProvider.generateAudioTopic(speakerSkills.teachSkills[0].name);
    } catch {
      return `Introductory Workshop: ${speakerSkills.teachSkills[0].name}`;
    }
  }

  // 3. Fallback B: Partner's desired LEARN skill
  if (partnerSkills.learnSkills.length > 0) {
    try {
      return await aiProvider.generateAudioTopic(partnerSkills.learnSkills[0].name);
    } catch {
      return `Learning Fundamentals: ${partnerSkills.learnSkills[0].name}`;
    }
  }

  // 4. Fallback C: General reciprocal skill exchange discussion topic
  try {
    return await aiProvider.generateAudioTopic('Reciprocal Skill Growth & Collaboration');
  } catch {
    return 'Reciprocal Skill Growth & Mutual Collaboration';
  }
}

export async function startAudioSession(
  userId: string,
  partnershipId: string,
  mode: AudioCallMode
) {
  const partnership = await prisma.partnership.findFirst({
    where: {
      id: partnershipId,
      status: 'ACCEPTED',
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
  });

  if (!partnership) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Access denied or partnership not accepted', 403);
  }

  // Check if an active session already exists
  let activeSession = await audioRepo.findActiveSession(partnershipId);
  if (activeSession) {
    return processSessionStateTransitions(activeSession, userId);
  }

  const requesterId = userId;
  const recipientId = partnership.requesterId === userId ? partnership.recipientId : partnership.requesterId;

  // Create call session in WAITING status (fast response, zero AI delay while ringing)
  activeSession = await audioRepo.createSession({
    partnershipId,
    mode,
    requesterId,
    recipientId,
    status: 'WAITING',
    startedAt: null,
    turnStartedAt: null,
  });

  return processSessionStateTransitions(activeSession, userId);
}

export async function acceptAudioSession(userId: string, sessionId: string) {
  const session = await audioRepo.findSessionById(sessionId);
  if (!session) throw new AppError(ErrorCode.NOT_FOUND, 'Audio session not found', 404);

  if (session.requesterId !== userId && session.recipientId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);
  }

  if (session.status !== 'WAITING') {
    return processSessionStateTransitions(session, userId);
  }

  const now = new Date();
  const requesterId = session.requesterId;
  const recipientId = session.recipientId;

  let userATopic: string | null = null;
  let userBTopic: string | null = null;
  let firstSpeakerId: string = requesterId;
  let secondSpeakerId: string = recipientId;

  if (session.mode === 'AI_TOPIC_EXCHANGE') {
    // Generate BOTH topics simultaneously for User A (Requester) and User B (Recipient)
    const [topicA, topicB] = await Promise.all([
      resolveTopicForSpeaker(requesterId, recipientId),
      resolveTopicForSpeaker(recipientId, requesterId),
    ]);

    userATopic = topicA;
    userBTopic = topicB;

    // Randomize initial speaker turn ("di-kocok")
    const isRequesterFirst = Math.random() < 0.5;
    firstSpeakerId = isRequesterFirst ? requesterId : recipientId;
    secondSpeakerId = isRequesterFirst ? recipientId : requesterId;
  }

  const newStatus: AudioSessionStatus = session.mode === 'NORMAL' ? 'USER_A_TURN' : 'PREPARING';

  const updated = await audioRepo.updateSession(sessionId, {
    status: newStatus,
    firstSpeakerId,
    secondSpeakerId,
    currentSpeakerId: firstSpeakerId,
    userATopic,
    userBTopic,
    startedAt: now,
    turnStartedAt: now,
  });

  return processSessionStateTransitions(updated, userId);
}

export async function skipPrepAudioSession(userId: string, sessionId: string) {
  const session = await audioRepo.findSessionById(sessionId);
  if (!session) throw new AppError(ErrorCode.NOT_FOUND, 'Audio session not found', 404);

  if (session.requesterId !== userId && session.recipientId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);
  }

  if (session.status === 'PREPARING') {
    const now = new Date();
    const updated = await audioRepo.updateSession(sessionId, {
      status: 'USER_A_TURN',
      turnStartedAt: now,
    });
    return processSessionStateTransitions(updated, userId);
  }

  return processSessionStateTransitions(session, userId);
}

export async function rejectAudioSession(userId: string, sessionId: string) {
  const session = await audioRepo.findSessionById(sessionId);
  if (!session) throw new AppError(ErrorCode.NOT_FOUND, 'Audio session not found', 404);

  if (session.requesterId !== userId && session.recipientId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);
  }

  return audioRepo.updateSession(sessionId, {
    status: 'REJECTED',
    endedAt: new Date(),
  });
}

export async function processSessionStateTransitions(
  session: Awaited<ReturnType<typeof audioRepo.findSessionById>>,
  currentUserId: string
) {
  if (!session) return null;

  const now = Date.now();

  let currentStatus: AudioSessionStatus = session.status;
  let currentSpeakerId = session.currentSpeakerId;
  let updatedTurnStartedAt = session.turnStartedAt;
  let updatedEndedAt = session.endedAt;
  let needsUpdate = false;

  if (session.status !== 'WAITING' && session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && session.status !== 'REJECTED') {
    const startedAtMs = session.startedAt ? new Date(session.startedAt).getTime() : now;
    const turnStartedAtMs = session.turnStartedAt ? new Date(session.turnStartedAt).getTime() : now;

    if (session.mode === 'NORMAL') {
      if (now - startedAtMs >= NORMAL_CALL_DURATION_MS) {
        currentStatus = 'COMPLETED';
        updatedEndedAt = new Date();
        needsUpdate = true;
      }
    } else if (session.mode === 'AI_TOPIC_EXCHANGE') {
      if (session.status === 'PREPARING') {
        if (now - startedAtMs >= PREPARING_DURATION_MS) {
          currentStatus = 'USER_A_TURN';
          currentSpeakerId = session.firstSpeakerId || session.requesterId;
          updatedTurnStartedAt = new Date();
          needsUpdate = true;
        }
      } else if (session.status === 'USER_A_TURN') {
        if (now - turnStartedAtMs >= TURN_DURATION_MS) {
          currentStatus = 'USER_B_TURN';
          currentSpeakerId = session.secondSpeakerId || session.recipientId;
          updatedTurnStartedAt = new Date();
          needsUpdate = true;
        }
      } else if (session.status === 'USER_B_TURN') {
        if (now - turnStartedAtMs >= TURN_DURATION_MS) {
          currentStatus = 'COMPLETED';
          updatedEndedAt = new Date();
          needsUpdate = true;
        }
      }
    }
  }

  if (needsUpdate) {
    session = await audioRepo.updateSession(session.id, {
      status: currentStatus,
      currentSpeakerId,
      turnStartedAt: updatedTurnStartedAt,
      endedAt: updatedEndedAt,
    });
  }

  const isRequester = currentUserId === session.requesterId;

  return {
    id: session.id,
    partnershipId: session.partnershipId,
    mode: session.mode,
    status: session.status,
    requesterId: session.requesterId,
    recipientId: session.recipientId,
    firstSpeakerId: session.firstSpeakerId,
    secondSpeakerId: session.secondSpeakerId,
    currentSpeakerId: session.currentSpeakerId,
    startedAt: session.startedAt,
    turnStartedAt: session.turnStartedAt,
    endedAt: session.endedAt,
    userTopic: isRequester ? session.userATopic : session.userBTopic,
    partnerTopic: isRequester ? session.userBTopic : session.userATopic,
    userTopicStatus: isRequester ? session.userATopicStatus : session.userBTopicStatus,
  };
}

export async function endAudioSession(userId: string, sessionId: string) {
  const session = await audioRepo.findSessionById(sessionId);
  if (!session) throw new AppError(ErrorCode.NOT_FOUND, 'Audio session not found', 404);

  if (session.requesterId !== userId && session.recipientId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403);
  }

  return audioRepo.updateSession(sessionId, {
    status: 'CANCELLED',
    endedAt: new Date(),
  });
}
