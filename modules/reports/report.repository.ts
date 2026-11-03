import { prisma } from "@/lib/prisma";
import type { Prisma, ProgramStatus } from "@/generated/prisma/client";

export const reportRepository = {
  async programSummary(where: Prisma.ProgramWhereInput) {
    const [count, byStatus, totals] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      prisma.program.aggregate({
        where,
        _sum: { target: true, realisasi: true, pagu: true, penggunaan: true },
      }),
    ]);
    return { count, byStatus, totals };
  },
};

export type ReportProgramFilters = {
  status?: ProgramStatus;
  periode?: string;
  kecamatan?: string;
  operatorId?: number;
};
