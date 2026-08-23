import { prisma } from '../../infrastructure/database/prisma.js';

export class WaitlistService {
  async joinWaitlist(data: { email: string; name: string; profession: string }) {
    // Check if already exists
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Email is already on the waitlist');
    }

    return prisma.waitlistEntry.create({
      data: {
        email: data.email,
        name: data.name,
        profession: data.profession,
      },
    });
  }

  async getWaitlist() {
    return prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const waitlistService = new WaitlistService();
