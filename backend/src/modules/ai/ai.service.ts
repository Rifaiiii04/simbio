import { OpenRouterProvider } from '../../infrastructure/ai/openrouter.provider.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import { logger } from '../../infrastructure/logger/index.js';

const llmProvider = new OpenRouterProvider();

export async function generateRoadmapDraft(userId: string, goalId: string) {
  const goal = await prisma.learningGoal.findFirst({
    where: { id: goalId, userId },
    include: { skill: true },
  });

  if (!goal) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Learning goal not found', 404);
  }

  const draft = await llmProvider.generateRoadmapDraft({
    goalTitle: goal.title,
    skillName: goal.skill.name,
    description: goal.description ?? undefined,
    targetOutcome: goal.targetOutcome ?? undefined,
  });

  // Create the roadmap and milestones in database as initial DRAFT
  return prisma.roadmap.create({
    data: {
      goalId: goal.id,
      title: draft.title,
      description: draft.description,
      status: 'DRAFT',
      milestones: {
        create: draft.milestones.map((m) => ({
          title: m.title,
          description: m.description,
          order: m.order,
          status: 'TODO',
        })),
      },
    },
    include: {
      milestones: { orderBy: { order: 'asc' } },
    },
  });
}

export async function recommendAiPartners(userId: string) {
  // 1. Fetch user profile & user skills
  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userSkills: { include: { skill: true } },
    },
  });

  if (!me) {
    throw new AppError(ErrorCode.NOT_FOUND, 'User profile not found', 404);
  }

  // 2. Fetch candidate pool excluding current user & existing active partners
  const existingPartnerIds = (
    await prisma.partnership.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      select: { requesterId: true, recipientId: true },
    })
  ).flatMap((p) => [p.requesterId, p.recipientId]).filter((id) => id !== userId);

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: [userId, ...existingPartnerIds] },
    },
    take: 8, // Candidate pool limit for LLM prompt optimization
    select: {
      id: true,
      name: true,
      bio: true,
      country: true,
      avatarUrl: true,
      userSkills: { select: { type: true, level: true, skill: { select: { id: true, name: true } } } },
    },
  });

  if (candidates.length === 0) {
    return [];
  }

  // 3. Format candidate data for AI prompt
  const myLearnSkillNames = me.userSkills.filter((s) => s.type === 'LEARN').map((s) => s.skill.name);
  const myTeachSkillNames = me.userSkills.filter((s) => s.type === 'TEACH').map((s) => s.skill.name);

  const formattedUser = {
    name: me.name,
    bio: me.bio,
    teachSkills: myTeachSkillNames,
    learnSkills: myLearnSkillNames,
  };

  const formattedCandidates = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    bio: c.bio,
    teachSkills: c.userSkills.filter((s) => s.type === 'TEACH').map((s) => `${s.skill.name} (${s.level})`),
    learnSkills: c.userSkills.filter((s) => s.type === 'LEARN').map((s) => `${s.skill.name} (${s.level})`),
  }));

  // 4. Invoke LLM provider recommendation logic with graceful fallback
  let aiRecommendations: Array<{ candidateId: string; aiMatchScore: number; reasoning: string; suggestedProjectIdea: string }> = [];
  try {
    aiRecommendations = await llmProvider.recommendPartners({
      user: formattedUser,
      candidates: formattedCandidates,
    });
  } catch (err) {
    logger.warn({ err }, 'AI Partner LLM call failed. Falling back to deterministic partner synergy scoring.');
  }

  // 5. Merge AI output or calculate deterministic synergy fallback
  return candidates.map((c) => {
    const aiRec = aiRecommendations.find((r) => r.candidateId === c.id);

    const cTeachNames = c.userSkills.filter((s) => s.type === 'TEACH').map((s) => s.skill.name);
    const cLearnNames = c.userSkills.filter((s) => s.type === 'LEARN').map((s) => s.skill.name);

    const teachMatch = cTeachNames.filter((name) => myLearnSkillNames.includes(name)).length;
    const learnMatch = cLearnNames.filter((name) => myTeachSkillNames.includes(name)).length;
    const calcScore = Math.min(98, Math.max(75, 75 + (teachMatch * 10) + (learnMatch * 10)));

    const fallbackReasoning = teachMatch > 0
      ? `${c.name} teaches ${cTeachNames.filter((n) => myLearnSkillNames.includes(n)).join(', ')}, matching your learning goals!`
      : 'High reciprocal learning compatibility based on complementary skills.';

    const fallbackProject = cTeachNames.length > 0 && cLearnNames.length > 0
      ? `Collaborative workshop trading ${cTeachNames[0]} for ${cLearnNames[0]}.`
      : 'Pair programming and interactive skill sharing sessions.';

    return {
      user: {
        id: c.id,
        name: c.name,
        avatarUrl: c.avatarUrl,
        bio: c.bio,
        country: c.country,
      },
      teachSkills: c.userSkills.filter((s) => s.type === 'TEACH').map((s) => ({ id: s.skill.id, name: s.skill.name, level: s.level })),
      learnSkills: c.userSkills.filter((s) => s.type === 'LEARN').map((s) => ({ id: s.skill.id, name: s.skill.name, level: s.level })),
      aiMatchScore: aiRec?.aiMatchScore || calcScore,
      aiReasoning: aiRec?.reasoning || fallbackReasoning,
      suggestedProjectIdea: aiRec?.suggestedProjectIdea || fallbackProject,
    };
  }).sort((a, b) => b.aiMatchScore - a.aiMatchScore);
}

// ─── Simbi Match Consultation ────────────────────────────────────────────────
// Builds a context-rich prompt from both users' data and lets Simbi answer
// user questions about reciprocal skill compatibility.
export async function simbiMatchConsult(myUserId: string, candidateId: string, userMessage: string): Promise<string> {
  const [me, candidate] = await Promise.all([
    prisma.user.findUnique({
      where: { id: myUserId },
      include: { userSkills: { include: { skill: true } } },
    }),
    prisma.user.findUnique({
      where: { id: candidateId },
      include: { userSkills: { include: { skill: true } } },
    }),
  ]);

  if (!me) throw new AppError(ErrorCode.NOT_FOUND, 'Your profile was not found', 404);
  if (!candidate) throw new AppError(ErrorCode.NOT_FOUND, 'Candidate not found', 404);

  // Fetch reputation for candidate
  const reviews = await prisma.partnershipReview.findMany({
    where: { revieweeId: candidateId },
    select: { consistency: true, communication: true, knowledgeSharing: true, collaboration: true },
  });
  const reviewCount = reviews.length;
  let reputationSummary = 'Belum ada review dari partner sebelumnya.';
  if (reviewCount > 0) {
    const avg = {
      consistency: Math.round((reviews.reduce((s, r) => s + r.consistency, 0) / reviewCount) * 10) / 10,
      communication: Math.round((reviews.reduce((s, r) => s + r.communication, 0) / reviewCount) * 10) / 10,
      knowledgeSharing: Math.round((reviews.reduce((s, r) => s + r.knowledgeSharing, 0) / reviewCount) * 10) / 10,
      collaboration: Math.round((reviews.reduce((s, r) => s + r.collaboration, 0) / reviewCount) * 10) / 10,
    };
    const overall = Math.round(((avg.consistency + avg.communication + avg.knowledgeSharing + avg.collaboration) / 4) * 10) / 10;
    reputationSummary = `Rating keseluruhan: ${overall}/5 (dari ${reviewCount} review). Konsistensi: ${avg.consistency}/5, Komunikasi: ${avg.communication}/5, Berbagi Ilmu: ${avg.knowledgeSharing}/5, Kolaborasi: ${avg.collaboration}/5.`;
  }

  const myTeach = me.userSkills.filter((s) => s.type === 'TEACH').map((s) => `${s.skill.name} (${s.level})`);
  const myLearn = me.userSkills.filter((s) => s.type === 'LEARN').map((s) => `${s.skill.name} (${s.level})`);
  const candTeach = candidate.userSkills.filter((s) => s.type === 'TEACH').map((s) => `${s.skill.name} (${s.level})`);
  const candLearn = candidate.userSkills.filter((s) => s.type === 'LEARN').map((s) => `${s.skill.name} (${s.level})`);

  const systemPrompt = `Kamu adalah Simbi, asisten AI capybara yang ceria dan cerdas di platform Simbioly — platform pertukaran skill timbal-balik (reciprocal skill exchange) antar manusia.

Konteks saat ini:
- Pengguna yang bertanya: ${me.name}
  - Skill yang bisa dia AJARKAN: ${myTeach.join(', ') || 'Belum dicantumkan'}
  - Skill yang ingin dia PELAJARI: ${myLearn.join(', ') || 'Belum dicantumkan'}

- Kandidat partner yang sedang dievaluasi: ${candidate.name} (${candidate.country ?? 'Negara tidak diketahui'})
  - Bio: ${candidate.bio ?? 'Tidak ada bio.'}
  - Skill yang bisa dia AJARKAN: ${candTeach.join(', ') || 'Belum dicantumkan'}
  - Skill yang ingin dia PELAJARI: ${candLearn.join(', ') || 'Belum dicantumkan'}
  - Reputasi dari peer review: ${reputationSummary}

Tugasmu: Help ${me.name} evaluate whether ${candidate.name} is a good reciprocal skill exchange partner. Focus on the reciprocal balance: does the candidate's teaching skill match the user's learning needs, and vice versa. Provide an honest, constructive, and enthusiastic assessment. **Respond in English**. Format your response beautifully using markdown headings, bullet points, and emojis. Do not use markdown tables, they are hard to read on mobile. Maximum 200 words.`;

  try {
    return await llmProvider.generateChatResponse(systemPrompt, userMessage);
  } catch (err) {
    logger.warn({ err }, 'Simbi match consult LLM call failed');
    throw new AppError(ErrorCode.AI_UNAVAILABLE, 'Simbi sedang tidak tersedia, coba beberapa saat lagi.', 503);
  }
}
