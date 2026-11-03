import { prisma } from "@/lib/prisma";
import type { AdviceStatus } from "@/generated/prisma/client";

export const adviceRepository = {
  findActiveProgram(id: number) {
    return prisma.program.findFirst({ where: { id, deletedAt: null } });
  },

  findActiveOperator(id: number) {
    return prisma.user.findFirst({
      where: { id, role: "OPERATOR", isActive: true, deletedAt: null },
    });
  },

  async findMany(pagination?: { skip: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      prisma.adviceRecord.findMany({
      include: { program: true, pimpinan: true, operator: true },
      orderBy: { createdAt: "desc" },
      ...(pagination === undefined
        ? {}
        : { skip: pagination.skip, take: pagination.pageSize }),
      }),
      prisma.adviceRecord.count(),
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
