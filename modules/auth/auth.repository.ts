import { prisma } from "@/lib/prisma";

const publicUserSelect = {
  id: true,
  nama: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null, isActive: true } });
  },

  findUserById(id: number) {
    return prisma.user.findFirst({ where: { id, deletedAt: null, isActive: true }, select: publicUserSelect });
  },

  createUserSession(input: {
    id: string;
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({
      data: input,
      include: { user: { select: publicUserSelect } },
    });
  },

  setSessionTokenHash(id: string, tokenHash: string) {
    return prisma.session.update({ where: { id }, data: { tokenHash } });
  },

  findSession(tokenHash: string) {
    return prisma.session.findUnique({
      where: { tokenHash },
      include: { user: { select: publicUserSelect } },
    });
  },

  deleteSession(tokenHash: string) {
    return prisma.session.deleteMany({ where: { tokenHash } });
  },

  deleteExpiredSessions() {
    return prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },

  updateLastLoginAt(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  findUserWithPassword(id: number) {
    return prisma.user.findFirst({ where: { id, deletedAt: null, isActive: true } });
  },

  updateOwnProfile(id: number, input: { nama?: string; email?: string }) {
    return prisma.user.update({ where: { id }, data: input, select: publicUserSelect });
  },

  updatePassword(id: number, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  deleteOtherSessions(userId: number, currentSessionId: string) {
    return prisma.session.deleteMany({ where: { userId, id: { not: currentSessionId } } });
  },

};
