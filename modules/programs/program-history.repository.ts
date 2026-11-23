import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";

export const programHistoryRepository = {
  async list(programId: number, user?: { role: string; id: number }) {
    const program = await prisma.program.findFirst({
      where: { id: programId, deletedAt: null },
      select: { id: true, operatorPengelolaId: true },
    });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    // Non-admin hanya dapat melihat history program yang dikelolanya.
    if (user?.role !== "ADMIN") {
      if (!user || program.operatorPengelolaId === null || program.operatorPengelolaId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat melihat history program ini.", 403);
      }
    }

    return prisma.programHistory.findMany({
      where: { programId },
      include: {
        inputBy: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { tanggal: "desc" },
    });
  },
};