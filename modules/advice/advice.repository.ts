import { prisma } from "@/lib/prisma";
import type { AdviceStatus } from "@/generated/prisma/client";

export type AdviceListFilters = {
  search?: string;
  status?: AdviceStatus;
  pagination?: { skip: number; pageSize: number };
};

export const adviceRepository = {
  findActiveProgram(id: number) {
    return prisma.program.findFirst({ where: { id, deletedAt: null } });
  },

  findActiveOperator(id: number) {
    return prisma.user.findFirst({
      where: { id, role: "OPERATOR", isActive: true, deletedAt: null },
    });
  },

  async findMany(filters: AdviceListFilters = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status !== undefined) where.status = filters.status;
    if (filters.search !== undefined) {
      const search = filters.search;
      where.AND = [
        {
          OR: [
            { namaKegiatan: { contains: search } },
            { identitasPimpinan: { contains: search } },
            { operatorPenerima: { contains: search } },
            { isi: { contains: search } },
          ],
        },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.adviceRecord.findMany({
        where,
        include: { program: true, pimpinan: true, operator: true },
        orderBy: { createdAt: "desc" },
        ...(filters.pagination === undefined
          ? {}
          : { skip: filters.pagination.skip, take: filters.pagination.pageSize }),
      }),
      prisma.adviceRecord.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.adviceRecord.findUnique({
      where: { id },
      include: { program: true, pimpinan: true, operator: true },
    });
  },

  create(input: {
    id: string;
    idKegiatan: number;
    namaKegiatan: string;
    identitasPimpinan: string;
    pimpinanId: number;
    operatorPenerima: string;
    operatorId?: number | null;
    isi: string;
    tanggal: Date;
    status: AdviceStatus;
  }) {
    return prisma.adviceRecord.create({
      data: input,
      include: { program: true, pimpinan: true, operator: true },
    });
  },

  update(id: string, data: { status?: AdviceStatus }) {
    return prisma.adviceRecord.update({
      where: { id },
      data,
      include: { program: true, pimpinan: true, operator: true },
    });
  },

  delete(id: string) {
    return prisma.adviceRecord.delete({ where: { id }, select: { id: true } });
  },
};
