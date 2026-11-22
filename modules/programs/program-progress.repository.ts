import { prisma } from "@/lib/prisma";
import { ProgressStatus } from "@/generated/prisma/client";
import { ApiError } from "@/lib/http/api-error";
import { publicUserSelect } from "@/modules/auth/auth.repository";

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
    if (progress.status !== ProgressStatus.DIAJUKAN) {
      throw new ApiError("PROGRESS_NOT_PENDING", "Progres belum dalam status diajukan.", 409);
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

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: decision === "APPROVED" ? "APPROVE" : "REJECT",
          entity: "ProgramProgress",
          entityId: String(progressId),
          details: {
            programId: progress.programId,
            fromStatus: progress.status,
            toStatus: decision === "APPROVED" ? ProgressStatus.DIVERIFIKASI : ProgressStatus.DITOLAK,
            rejectionReason: decision === "REJECTED" ? rejectionReason : null,
          },
        },
      });

      // Realisasi Program hanya dihitung dari progres yang DIVERIFIKASI.
      // Saat DITOLAK, realisasi Program tidak berubah (belum pernah ditambah).
      if (decision === "APPROVED") {
        const approved = await tx.programProgress.aggregate({
          where: {
            programId: progress.programId,
            status: ProgressStatus.DIVERIFIKASI,
          },
          _sum: { volume: true },
        });
        const totalRealisasi = Number(approved._sum.volume ?? 0);
        await tx.program.update({
          where: { id: progress.programId },
          data: {
            realisasi: totalRealisasi,
            realisasiVolume: totalRealisasi,
          },
        });
      }

      return updated;
    });
  },

  async updatePhoto(progressId: number, storageKey: string, originalName: string | null) {
    const progress = await this.findById(progressId);
    return prisma.programProgress.update({
      where: { id: progressId },
      data: {
        storageKey,
        originalName,
      },
    });
  },

  async findPhotoByProgressId(progressId: number) {
    return prisma.programProgress.findFirst({
      where: { id: progressId, storageKey: { not: null } },
      select: {
        id: true,
        storageKey: true,
        originalName: true,
        tahap: true,
        tanggal: true,
      },
    });
  },
};