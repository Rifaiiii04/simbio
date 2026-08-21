import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import * as repo from './skills.repository.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { type UserSkillType, type SkillLevel } from '../../../generated/prisma/index.js';

export async function getCategories() {
  return repo.findAllCategories();
}

export async function addCategory(data: { name: string; slug: string }) {
  try {
    return await repo.createCategory(data);
  } catch {
    throw new AppError(ErrorCode.CONFLICT, 'Category slug already exists', 409);
  }
}

export async function updateCategory(id: string, data: { name?: string; slug?: string }) {
  try {
    return await repo.updateCategory(id, data);
  } catch {
    throw new AppError(ErrorCode.CONFLICT, 'Failed to update category', 400);
  }
}

export async function deleteCategory(id: string) {
  try {
    await repo.deleteCategory(id);
  } catch {
    throw new AppError(ErrorCode.CONFLICT, 'Cannot delete category with associated skills', 409);
  }
}

export async function getSkills(q?: string, categoryId?: string) {
  return repo.findSkills(q, categoryId);
}

export async function getSkillById(id: string) {
  const skill = await repo.findSkillById(id);
  if (!skill) throw new AppError(ErrorCode.NOT_FOUND, 'Skill not found', 404);
  return skill;
}

export function normalizeSkillKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function generateCanonicalSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'skill'
  );
}

export async function addSkill(data: { name: string; categoryId?: string; slug?: string; description?: string }) {
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, 'Skill name cannot be empty', 400);
  }

  const normKey = normalizeSkillKey(trimmedName);
  const canonSlug = generateCanonicalSlug(trimmedName);

  // 1. Check all existing skills for duplicates (case, dots, spaces, commas normalization)
  const allSkills = await prisma.skill.findMany({
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  const existing = allSkills.find((s) => {
    const sNormKey = normalizeSkillKey(s.name);
    const sSlugNorm = normalizeSkillKey(s.slug);
    return (
      sNormKey === normKey ||
      sSlugNorm === normKey ||
      s.slug === canonSlug ||
      s.name.toLowerCase() === trimmedName.toLowerCase()
    );
  });

  if (existing) {
    // Return existing skill without duplicate row
    return existing;
  }

  // 2. Resolve categoryId (fallback to first category or create General category)
  let targetCategoryId = data.categoryId;
  if (targetCategoryId) {
    const catExists = await prisma.skillCategory.findUnique({ where: { id: targetCategoryId } });
    if (!catExists) targetCategoryId = undefined;
  }

  if (!targetCategoryId) {
    const firstCat = await prisma.skillCategory.findFirst({ orderBy: { createdAt: 'asc' } });
    if (firstCat) {
      targetCategoryId = firstCat.id;
    } else {
      const generalCat = await prisma.skillCategory.create({
        data: { name: 'General', slug: 'general' },
      });
      targetCategoryId = generalCat.id;
    }
  }

  // 3. Resolve slug collision
  let finalSlug = data.slug || canonSlug;
  const slugCollision = await prisma.skill.findUnique({ where: { slug: finalSlug } });
  if (slugCollision) {
    finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
  }

  return await repo.createSkill({
    categoryId: targetCategoryId,
    name: trimmedName,
    slug: finalSlug,
    description: data.description || 'User added skill',
  });
}

export async function updateSkill(id: string, data: { categoryId?: string; name?: string; slug?: string; description?: string | null }) {
  try {
    return await repo.updateSkill(id, data);
  } catch {
    throw new AppError(ErrorCode.CONFLICT, 'Failed to update skill', 400);
  }
}

export async function deleteSkill(id: string) {
  try {
    await repo.deleteSkill(id);
  } catch {
    throw new AppError(ErrorCode.CONFLICT, 'Cannot delete skill associated with user profiles', 409);
  }
}

export async function getUserSkills(userId: string) {
  return repo.findUserSkills(userId);
}

export async function addUserSkill(
  userId: string,
  data: { skillId: string; type: UserSkillType; level: SkillLevel },
) {
  const skill = await repo.findSkillById(data.skillId);
  if (!skill) throw new AppError(ErrorCode.NOT_FOUND, 'Skill not found', 404);
  try {
    return await prisma.userSkill.upsert({
      where: {
        userId_skillId_type: {
          userId,
          skillId: data.skillId,
          type: data.type,
        },
      },
      update: { level: data.level },
      create: { userId, ...data },
      include: { skill: true },
    });
  } catch {
    // Fallback if upsert has compound constraint variations
    const existing = await prisma.userSkill.findFirst({
      where: { userId, skillId: data.skillId, type: data.type },
      include: { skill: true },
    });
    if (existing) return existing;
    return await repo.createUserSkill({ userId, ...data });
  }
}

export async function updateUserSkill(
  userId: string,
  id: string,
  data: { level: SkillLevel },
) {
  return repo.updateUserSkill(id, userId, data);
}

export async function removeUserSkill(userId: string, id: string) {
  await repo.deleteUserSkill(id, userId);
}
