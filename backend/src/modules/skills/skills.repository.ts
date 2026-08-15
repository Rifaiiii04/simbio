import { prisma } from '../../infrastructure/database/prisma.js';

export async function findAllCategories() {
  return prisma.skillCategory.findMany({
    include: { _count: { select: { skills: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(data: { name: string; slug: string }) {
  return prisma.skillCategory.create({ data });
}

export async function updateCategory(id: string, data: { name?: string; slug?: string }) {
  return prisma.skillCategory.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.skillCategory.delete({ where: { id } });
}

export async function findSkills(q?: string, categoryId?: string) {
  return prisma.skill.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function findSkillById(id: string) {
  return prisma.skill.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function createSkill(data: { categoryId: string; name: string; slug: string; description?: string }) {
  return prisma.skill.create({
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function updateSkill(id: string, data: { categoryId?: string; name?: string; slug?: string; description?: string | null }) {
  return prisma.skill.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function deleteSkill(id: string) {
  return prisma.skill.delete({ where: { id } });
}

export async function findUserSkills(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId },
    include: { skill: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUserSkill(data: {
  userId: string;
  skillId: string;
  type: 'TEACH' | 'LEARN';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}) {
  return prisma.userSkill.create({ data, include: { skill: true } });
}

export async function updateUserSkill(
  id: string,
  userId: string,
  data: { level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' },
) {
  return prisma.userSkill.update({ where: { id, userId }, data, include: { skill: true } });
}

export async function deleteUserSkill(id: string, userId: string) {
  return prisma.userSkill.delete({ where: { id, userId } });
}
