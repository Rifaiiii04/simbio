import { prisma } from '../../infrastructure/database/prisma.js';
import { type AudioCallMode, type AudioSessionStatus } from '../../../generated/prisma/index.js';

export async function createSession(data: {
  partnershipId: string;
  mode: AudioCallMode;
  requesterId: string;
  recipientId: string;
  status?: AudioSessionStatus;
  userATopic?: string | null;
  userBTopic?: string | null;
  userATopicStatus?: string | null;
  userBTopicStatus?: string | null;
  firstSpeakerId?: string | null;
  secondSpeakerId?: string | null;
  currentSpeakerId?: string | null;
  turnStartedAt?: Date | null;
  startedAt?: Date | null;
}) {
  return prisma.partnershipAudioSession.create({
    data: {
      partnershipId: data.partnershipId,
      mode: data.mode,
      status: data.status || 'WAITING',
      requesterId: data.requesterId,
      recipientId: data.recipientId,
      userATopic: data.userATopic,
      userBTopic: data.userBTopic,
      userATopicStatus: data.userATopicStatus,
      userBTopicStatus: data.userBTopicStatus,
      firstSpeakerId: data.firstSpeakerId,
      secondSpeakerId: data.secondSpeakerId,
      currentSpeakerId: data.currentSpeakerId || data.firstSpeakerId || data.requesterId,
      turnStartedAt: data.turnStartedAt || null,
      startedAt: data.startedAt || null,
    },
  });
}

export async function findActiveSession(partnershipId: string) {
  return prisma.partnershipAudioSession.findFirst({
    where: {
      partnershipId,
      status: {
        in: ['WAITING', 'PREPARING', 'USER_A_TURN', 'USER_B_TURN'],
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findSessionById(id: string) {
  return prisma.partnershipAudioSession.findUnique({
    where: { id },
  });
}

export async function updateSession(
  id: string,
  data: {
    status?: AudioSessionStatus;
    currentSpeakerId?: string | null;
    firstSpeakerId?: string | null;
    secondSpeakerId?: string | null;
    turnStartedAt?: Date | null;
    startedAt?: Date | null;
    endedAt?: Date | null;
    userATopic?: string | null;
    userBTopic?: string | null;
  }
) {
  return prisma.partnershipAudioSession.update({
    where: { id },
    data,
  });
}
