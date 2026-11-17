import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";

export const programHistoryRepository = {
  async list(programId: number) {
    const program = await prisma.program.findFirst({
      where: { id: programId, deletedAt: null },
      select: { id: true },
    });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);

    return prisma.programHistory.findMany({
      where: { programId },
      include: {
        inputBy: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { tanggal: "desc" },
    });
  },
};