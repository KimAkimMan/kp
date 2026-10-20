import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

const roleMap: Record<CreateUserInput["role"], UserRole> = {
  Admin: UserRole.ADMIN,
  Operator: UserRole.OPERATOR,
  Pimpinan: UserRole.PIMPINAN,
};

export const userRepository = {
  async findMany(pagination?: { skip: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      ...(pagination === undefined
        ? {}
        : { skip: pagination.skip, take: pagination.pageSize }),
      }),
      prisma.user.count(),
    ]);
    return { items, total };
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
        passwordHash: input.password,
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

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
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

  update(id: number, input: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(input.nama === undefined ? {} : { nama: input.nama }),
        ...(input.email === undefined ? {} : { email: input.email }),
        ...(input.role === undefined ? {} : { role: roleMap[input.role] }),
        ...(input.password === undefined ? {} : { passwordHash: input.password }),
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

  delete(id: number) {
    return prisma.user.delete({ where: { id }, select: { id: true } });
  },
};
