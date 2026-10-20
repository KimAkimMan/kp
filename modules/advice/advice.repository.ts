import { prisma } from "@/lib/prisma";

export const adviceRepository = {
  findMany() {
    return prisma.adviceRecord.findMany({
      include: { program: true, pimpinan: true, operator: true },
      orderBy: { createdAt: "desc" },
    });
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
    status: string;
  }) {
    return prisma.adviceRecord.create({
      data: input,
      include: { program: true, pimpinan: true, operator: true },
    });
  },

  update(id: string, data: { status?: string }) {
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
