import { prisma } from "@/lib/prisma";
import type { AdviceStatus } from "@/generated/prisma/client";
import { publicUserSelect } from "../auth/auth.repository";

export type AdviceListFilters = {
  search?: string;
  status?: AdviceStatus;
  operatorId?: number;
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
    if (filters.operatorId !== undefined) where.operatorId = filters.operatorId;
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
        include: { program: true, pimpinan: { select: publicUserSelect }, operator: { select: publicUserSelect } },
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
      include: { program: true, pimpinan: { select: publicUserSelect }, operator: { select: publicUserSelect } },
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
      include: { program: true, pimpinan: { select: publicUserSelect }, operator: { select: publicUserSelect } },
    });
  },

  update(id: string, data: { status?: AdviceStatus }) {
    return prisma.adviceRecord.update({
      where: { id },
      data,
      include: { program: true, pimpinan: { select: publicUserSelect }, operator: { select: publicUserSelect } },
    });
  },

  delete(id: string, userId?: number) {
    // Audit log sebelum hard delete
    if (userId !== undefined) {
      void prisma.auditLog.create({
        data: {
          userId,
          action: "DELETE",
          entity: "AdviceRecord",
          entityId: id,
          details: {},
        },
      });
    }
    return prisma.adviceRecord.delete({ where: { id }, select: { id: true } });
  },
};
