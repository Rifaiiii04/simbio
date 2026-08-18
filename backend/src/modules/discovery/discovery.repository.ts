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

export interface CandidateResult {
  user: { id: string; name: string; username: string | null; avatarUrl: string | null; bio: string | null; country: string | null };
  teachSkills: Array<{ id: string; name: string; level: string }>;
  learnSkills: Array<{ id: string; name: string; level: string }>;
  matchScore: number;
  distanceKm: number | null;
}

export async function findCandidates(
  currentUserId: string,
  filters: DiscoveryFilters,
): Promise<CandidateResult[]> {
  // Load current user's skills and location
  const me = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      latitude: true,
      longitude: true,
      locationEnabled: true,
      country: true,
      userSkills: { select: { skillId: true, type: true, level: true } },
    },
  });
  if (!me) return [];

  const myLearnSkillIds = me.userSkills.filter((s) => s.type === 'LEARN').map((s) => s.skillId);
  const myTeachSkillIds = me.userSkills.filter((s) => s.type === 'TEACH').map((s) => s.skillId);
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
      userSkills: { select: { skillId: true, type: true, level: true, skill: { select: { id: true, name: true } } } },
    },
  });

  const results: CandidateResult[] = candidates.map((candidate) => {
    const candidateTeach = candidate.userSkills.filter((s) => s.type === 'TEACH');
    const candidateLearn = candidate.userSkills.filter((s) => s.type === 'LEARN');

    /*
     * Priority-weighted scoring:
     *
     * 1. teachMatch (PRIMARY): How many of the candidate's TEACH skills overlap
     *    with what the current user wants to LEARN — this is the core value.
     *    Weight: 10 pts per matching skill.
     *
     * 2. sameCountry (SECONDARY): Candidate lives in the same country as the
     *    current user — local community-first discovery.
     *    Weight: 5 pts flat bonus.
     *
     * 3. reciprocalBonus (TERTIARY): How many of the candidate's LEARN skills
     *    overlap with what the current user can TEACH — true reciprocal exchange.
     *    Weight: 3 pts per matching skill.
     *
     * Final sort order:
     *   a. matchScore DESC (higher is better)
     *   b. distanceKm ASC (closer is better, null last)
     */
    const teachMatchCount = candidateTeach.filter((s) => myLearnSkillIds.includes(s.skillId)).length;
    const reciprocalBonus = candidateLearn.filter((s) => myTeachSkillIds.includes(s.skillId)).length;
    const candidateCountry = candidate.country?.toLowerCase().trim() ?? null;
    const sameCountryBonus = myCountry && candidateCountry && myCountry === candidateCountry ? 5 : 0;

    const matchScore = teachMatchCount * 10 + sameCountryBonus + reciprocalBonus * 3;

    let distanceKm: number | null = null;
    if (
      me.locationEnabled &&
      me.latitude != null && me.longitude != null &&
      candidate.latitude != null && candidate.longitude != null
    ) {
      distanceKm = Math.round(haversine(me.latitude, me.longitude, candidate.latitude, candidate.longitude) * 10) / 10;
    }

    return {
      user: { id: candidate.id, name: candidate.name, username: candidate.username, avatarUrl: candidate.avatarUrl, bio: candidate.bio, country: candidate.country },
      teachSkills: candidateTeach.map((s) => ({ id: s.skill.id, name: s.skill.name, level: s.level })),
      learnSkills: candidateLearn.map((s) => ({ id: s.skill.id, name: s.skill.name, level: s.level })),
      matchScore,
      distanceKm,
    };
  });

  // Filter by radius if requested
  const filtered = filters.radius != null
    ? results.filter((r) => r.distanceKm == null || r.distanceKm <= (filters.radius ?? Infinity))
    : results;

  // Sort: matchScore DESC → distanceKm ASC (null pushed to end)
  return filtered.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm != null) return -1; // a has distance, b doesn't → a first
    if (b.distanceKm != null) return 1;
    return 0;
  });
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
