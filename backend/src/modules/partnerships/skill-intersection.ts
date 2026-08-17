export interface SkillItem {
  name: string;
  slug: string;
}

/**
 * Pure deterministic skill intersection calculator for Audio Call AI Topic Exchange.
 * Calculates: Speaker TEACH skills ∩ Partner LEARN skills
 *
 * Rules:
 * - Speaker must own the skill with type = 'TEACH'
 * - Partner must want to learn the skill with type = 'LEARN' (or active LearningGoal)
 * - Returns only the intersection array. If empty, returns [] without calling AI.
 */
export function calculateSkillIntersection(
  speakerTeachSkills: SkillItem[],
  partnerLearnSkills: SkillItem[]
): SkillItem[] {
  if (!speakerTeachSkills.length || !partnerLearnSkills.length) {
    return [];
  }

  const partnerLearnSlugs = new Set(partnerLearnSkills.map((s) => s.slug.toLowerCase().trim()));

  return speakerTeachSkills.filter((s) =>
    partnerLearnSlugs.has(s.slug.toLowerCase().trim())
  );
}
