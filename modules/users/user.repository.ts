import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

const roleMap: Record<CreateUserInput["role"], UserRole> = {
  Admin: UserRole.ADMIN,
  Operator: UserRole.OPERATOR,
  Pimpinan: UserRole.PIMPINAN,
};

export type UserListFilters = {
  search?: string;
  role?: "Admin" | "Operator" | "Pimpinan";
  pagination?: { skip: number; pageSize: number };
};

export const userRepository = {
  async findMany(filters: UserListFilters = {}) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.role !== undefined) where.role = filters.role;
    if (filters.search !== undefined) {
      const search = filters.search;
      where.AND = [
        {
          OR: [
            { nama: { contains: search } },
            { email: { contains: search } },
          ],
        },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        ...(filters.pagination === undefined
          ? {}
          : { skip: filters.pagination.skip, take: filters.pagination.pageSize }),
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  },

  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
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
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
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
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: { id: true, deletedAt: true },
    });
  },
};
