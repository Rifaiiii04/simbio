import { prisma } from '../../infrastructure/database/prisma.js';

// Haversine formula for distance in km between two coordinates
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface DiscoveryFilters {
  skillId?: string;
  level?: string;
  radius?: number; // km
  country?: string;
}

export interface CandidateReputation {
  count: number;
  overall: number | null; // 1-5 average
  averages: { consistency: number; communication: number; knowledgeSharing: number; collaboration: number } | null;
}

export interface CandidateResult {
  user: { id: string; name: string; username: string | null; avatarUrl: string | null; bio: string | null; country: string | null };
  teachSkills: Array<{ id: string; name: string; level: string }>;
  learnSkills: Array<{ id: string; name: string; level: string }>;
  matchScore: number;
  distanceKm: number | null;
  reputation: CandidateReputation;
}

export async function findCandidates(
  currentUserId: string,
  filters: DiscoveryFilters,
): Promise<CandidateResult[]> {
  // Load current user's skills with categories and location
  const me = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      latitude: true,
      longitude: true,
      locationEnabled: true,
      country: true,
      userSkills: {
        select: {
          skillId: true,
          type: true,
          level: true,
          skill: {
            select: { id: true, name: true, categoryId: true, category: { select: { id: true, name: true, slug: true } } },
          },
        },
      },
    },
  });
  if (!me) return [];

  const myLearnSkills = me.userSkills.filter((s) => s.type === 'LEARN');
  const myTeachSkills = me.userSkills.filter((s) => s.type === 'TEACH');

  const myLearnSkillIds = new Set(myLearnSkills.map((s) => s.skillId));
  const myLearnCategoryIds = new Set(myLearnSkills.map((s) => s.skill.categoryId));

  const myTeachSkillIds = new Set(myTeachSkills.map((s) => s.skillId));
  const myTeachCategoryIds = new Set(myTeachSkills.map((s) => s.skill.categoryId));

  const myCountry = me.country?.toLowerCase().trim() ?? null;

  // Exclude current user and existing partners
  const existingPartnerIds = (
    await prisma.partnership.findMany({
      where: { OR: [{ requesterId: currentUserId }, { recipientId: currentUserId }], status: { in: ['PENDING', 'ACCEPTED'] } },
      select: { requesterId: true, recipientId: true },
    })
  ).flatMap((p) => [p.requesterId, p.recipientId]).filter((id) => id !== currentUserId);

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: [currentUserId, ...existingPartnerIds] },
      ...(filters.country ? { country: { contains: filters.country } } : {}),
      ...(filters.skillId ? { userSkills: { some: { skillId: filters.skillId, type: 'TEACH', ...(filters.level ? { level: filters.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' } : {}) } } } : {}),
    },
    select: {
      id: true, name: true, username: true, avatarUrl: true, bio: true, country: true,
      latitude: true, longitude: true, locationEnabled: true,
      userSkills: {
        select: {
          skillId: true,
          type: true,
          level: true,
          skill: {
            select: { id: true, name: true, categoryId: true, category: { select: { id: true, name: true, slug: true } } },
          },
        },
      },
    },
  });

  const results: CandidateResult[] = candidates.map((candidate) => {
    const candidateTeach = candidate.userSkills.filter((s) => s.type === 'TEACH');
    const candidateLearn = candidate.userSkills.filter((s) => s.type === 'LEARN');

    /*
     * Advanced Data Mining & Recommendation Affinity Scoring:
     *
     * 1. Exact Skill Overlap (Confidence = 1.0):
     *    Candidate teaches what user specifically seeks -> Highest Affinity (+20 pts/skill).
     *
     * 2. Domain / Category Association (Confidence = 0.6):
     *    Candidate teaches skills within the same knowledge domain/category
     *    (e.g., User wants TypeScript, Candidate teaches Python/React in Programming & Tech) -> Strong Association (+10 pts/skill).
     *
     * 3. Reciprocal Exchange Affinity:
     *    - Candidate wants to learn user's exact skill: +15 pts.
     *    - Candidate wants to learn skills in user's teaching domain: +8 pts.
     *
     * 4. Bidirectional Harmonic Reciprocity:
     *    Simultaneous mutual teach/learn synergy bonus (+20 pts).
     *
     * 5. Local Community Proximity (+5 pts).
     */
    let teachAffinityScore = 0;
    let exactTeachCount = 0;
    let relatedTeachCount = 0;

    const scoredTeachSkills = candidateTeach.map((s) => {
      const isExact = myLearnSkillIds.has(s.skillId) || (!!filters.skillId && s.skillId === filters.skillId);
      const isRelated = !isExact && myLearnCategoryIds.has(s.skill.categoryId);

      let itemScore = 0;
      if (isExact) {
        itemScore = 20 + (filters.skillId && s.skillId === filters.skillId ? 10 : 0);
        exactTeachCount++;
      } else if (isRelated) {
        itemScore = 10;
        relatedTeachCount++;
      }

      teachAffinityScore += itemScore;
      return { ...s, isExact, isRelated, itemScore };
    });

    let learnAffinityScore = 0;
    let exactLearnCount = 0;
    let relatedLearnCount = 0;

    const scoredLearnSkills = candidateLearn.map((s) => {
      const isExact = myTeachSkillIds.has(s.skillId);
      const isRelated = !isExact && myTeachCategoryIds.has(s.skill.categoryId);

      let itemScore = 0;
      if (isExact) {
        itemScore = 15;
        exactLearnCount++;
      } else if (isRelated) {
        itemScore = 8;
        relatedLearnCount++;
      }

      learnAffinityScore += itemScore;
      return { ...s, isExact, isRelated, itemScore };
    });

    const isHarmonicReciprocal = (exactTeachCount > 0 || relatedTeachCount > 0) && (exactLearnCount > 0 || relatedLearnCount > 0);
    const reciprocalSynergyBonus = isHarmonicReciprocal ? 20 : 0;
    const candidateCountry = candidate.country?.toLowerCase().trim() ?? null;
    const sameCountryBonus = myCountry && candidateCountry && myCountry === candidateCountry ? 5 : 0;

    const matchScore = teachAffinityScore + learnAffinityScore + reciprocalSynergyBonus + sameCountryBonus;

    let distanceKm: number | null = null;
    if (
      me.locationEnabled &&
      me.latitude != null && me.longitude != null &&
      candidate.latitude != null && candidate.longitude != null
    ) {
      distanceKm = Math.round(haversine(me.latitude, me.longitude, candidate.latitude, candidate.longitude) * 10) / 10;
    }

    // Sort candidate skills: Exact Match > Domain Related > Others
    const sortedCandidateTeach = scoredTeachSkills.sort((a, b) => b.itemScore - a.itemScore);
    const sortedCandidateLearn = scoredLearnSkills.sort((a, b) => b.itemScore - a.itemScore);

    return {
      user: { id: candidate.id, name: candidate.name, username: candidate.username, avatarUrl: candidate.avatarUrl, bio: candidate.bio, country: candidate.country },
      teachSkills: sortedCandidateTeach.map((s) => ({
        id: s.skill.id,
        name: s.skill.name,
        level: s.level,
        isMatch: s.isExact,
        isRelated: s.isRelated,
      })),
      learnSkills: sortedCandidateLearn.map((s) => ({
        id: s.skill.id,
        name: s.skill.name,
        level: s.level,
        isMatch: s.isExact,
        isRelated: s.isRelated,
      })),
      matchScore,
      distanceKm,
      reputation: { count: 0, overall: null, averages: null }, // populated below
    };
  });

  // Filter by radius if requested
  const filtered = filters.radius != null
    ? results.filter((r) => r.distanceKm == null || r.distanceKm <= (filters.radius ?? Infinity))
    : results;

  // Sort: matchScore DESC → distanceKm ASC (null pushed to end)
  const sorted = filtered.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm != null) return -1;
    if (b.distanceKm != null) return 1;
    return 0;
  });

  // Batch-fetch reputation for all candidate IDs
  const candidateIds = sorted.map((r) => r.user.id);
  const reviews = await prisma.partnershipReview.findMany({
    where: { revieweeId: { in: candidateIds } },
    select: { revieweeId: true, consistency: true, communication: true, knowledgeSharing: true, collaboration: true },
  });

  // Group reviews by user and compute averages (all scores are 1-5)
  const reputationMap = new Map<string, CandidateReputation>();
  for (const id of candidateIds) {
    const userReviews = reviews.filter((r) => r.revieweeId === id);
    const count = userReviews.length;
    if (count === 0) {
      reputationMap.set(id, { count: 0, overall: null, averages: null });
    } else {
      const sum = userReviews.reduce((acc, r) => ({
        consistency: acc.consistency + r.consistency,
        communication: acc.communication + r.communication,
        knowledgeSharing: acc.knowledgeSharing + r.knowledgeSharing,
        collaboration: acc.collaboration + r.collaboration,
      }), { consistency: 0, communication: 0, knowledgeSharing: 0, collaboration: 0 });
      const avg = {
        consistency: Math.round((sum.consistency / count) * 10) / 10,
        communication: Math.round((sum.communication / count) * 10) / 10,
        knowledgeSharing: Math.round((sum.knowledgeSharing / count) * 10) / 10,
        collaboration: Math.round((sum.collaboration / count) * 10) / 10,
      };
      const overall = Math.round(((avg.consistency + avg.communication + avg.knowledgeSharing + avg.collaboration) / 4) * 10) / 10;
      reputationMap.set(id, { count, overall, averages: avg });
    }
  }

  return sorted.map((r) => ({ ...r, reputation: reputationMap.get(r.user.id) ?? { count: 0, overall: null, averages: null } }));
}

export async function getMapData(currentUserId: string, radius?: number) {
  const me = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { latitude: true, longitude: true, locationEnabled: true },
  });

  const [users, myPartnerships] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: currentUserId }, latitude: { not: null }, longitude: { not: null } },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        latitude: true,
        longitude: true,
        country: true,
        bio: true,
        userSkills: {
          select: { type: true, skill: { select: { id: true, name: true } } },
          where: { type: 'TEACH' },
          take: 3,
        },
      },
    }),
    prisma.partnership.findMany({
      where: {
        OR: [{ requesterId: currentUserId }, { recipientId: currentUserId }],
        status: { in: ['ACCEPTED', 'PENDING'] },
      },
      select: { id: true, requesterId: true, recipientId: true, status: true },
    }),
  ]);

  const partnershipMap = new Map<string, { status: string; id: string }>();
  myPartnerships.forEach((p) => {
    const otherId = p.requesterId === currentUserId ? p.recipientId : p.requesterId;
    partnershipMap.set(otherId, { status: p.status, id: p.id });
  });

  return users
    .map((u) => {
      const pInfo = partnershipMap.get(u.id);
      return {
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        country: u.country,
        bio: u.bio,
        latitude: u.latitude,
        longitude: u.longitude,
        teachSkills: u.userSkills.map((s) => ({ id: s.skill.id, name: s.skill.name })),
        distanceKm:
          me?.locationEnabled && me.latitude != null && me.longitude != null && u.latitude != null && u.longitude != null
            ? Math.round(haversine(me.latitude, me.longitude, u.latitude, u.longitude) * 10) / 10
            : null,
        isConnected: pInfo?.status === 'ACCEPTED',
        isPending: pInfo?.status === 'PENDING',
        partnershipId: pInfo?.id ?? null,
      };
    })
    .filter((u) => radius == null || u.distanceKm == null || u.distanceKm <= radius);
}
