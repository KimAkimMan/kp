import { prisma } from "@/lib/prisma";
import { ProgressStatus } from "@/generated/prisma/client";
import { ApiError } from "@/lib/http/api-error";

export const programProgressRepository = {
  async list(programId: number) {
    const program = await prisma.program.findFirst({
      where: { id: programId, deletedAt: null },
      select: { id: true },
    });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);

    return prisma.programProgress.findMany({
      where: { programId },
      include: {
        reportedBy: { select: { id: true, nama: true, role: true } },
        verifiedBy: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { tanggal: "desc" },
    });
  },

  async findById(id: number) {
    const progress = await prisma.programProgress.findUnique({
      where: { id },
      include: {
        reportedBy: { select: { id: true, nama: true, role: true } },
        verifiedBy: { select: { id: true, nama: true, role: true } },
      },
    });
    if (!progress) throw new ApiError("PROGRESS_NOT_FOUND", "Progress tidak ditemukan.", 404);
    return progress;
  },

  async verify(progressId: number, decision: "APPROVED" | "REJECTED", reviewerId: number, rejectionReason?: string) {
    const progress = await this.findById(progressId);
    if (progress.status === ProgressStatus.DIVERIFIKASI) {
      throw new ApiError("PROGRESS_ALREADY_VERIFIED", "Progress telah diverifikasi sebelumnya.", 409);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.programProgress.update({
        where: { id: progressId },
        data: {
          status: decision === "APPROVED" ? ProgressStatus.DIVERIFIKASI : ProgressStatus.DITOLAK,
          verifiedById: reviewerId,
          verifiedAt: new Date(),
          rejectionReason: decision === "REJECTED" ? rejectionReason ?? "Ditolak" : null,
        },
        include: {
          reportedBy: { select: { id: true, nama: true, role: true } },
          verifiedBy: { select: { id: true, nama: true, role: true } },
        },
      });

      // Jika disetujui dan realisasi sudah mencapai target, update status program
      if (decision === "APPROVED") {
        const program = await tx.program.findUnique({ where: { id: progress.programId } });
        if (program && Number(program.target) > 0 && Number(program.realisasi) >= Number(program.target)) {
          await tx.program.update({
            where: { id: progress.programId },
            data: { status: "SELESAI_DIKERJAKAN" },
          });
        }
      }

      return updated;
    });
  },
};