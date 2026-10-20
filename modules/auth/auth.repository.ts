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
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: number) {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
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

};
