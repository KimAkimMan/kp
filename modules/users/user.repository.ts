import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import type { CreateUserInput } from "./user.types";

const roleMap: Record<CreateUserInput["role"], UserRole> = {
  Admin: UserRole.ADMIN,
  Operator: UserRole.OPERATOR,
  Pimpinan: UserRole.PIMPINAN,
};

export const userRepository = {
  findMany() {
    return prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(input: CreateUserInput) {
    return prisma.user.create({
      data: {
        nama: input.nama,
        email: input.email,
        role: roleMap[input.role],
        passwordHash: input.passwordHash,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
