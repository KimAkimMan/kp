import { prisma } from "@/lib/prisma";
import { ProgressStatus, ProgramStatus } from "@/generated/prisma/client";
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
        program: { select: { operatorPengelolaId: true } },
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
      // Serialisasi verifikasi per program: transaksi lain untuk program yang sama
      // menunggu lock ini sebelum mengubah progres atau menghitung realisasi.
      const locked = await tx.$queryRawUnsafe<Array<{
        id: number;
        target: unknown;
        status: string;
        pagu: unknown;
      }>>(
        `SELECT id, target, status, pagu FROM Program WHERE id = ? FOR UPDATE`,
        progress.programId,
      );
      if (!locked || locked.length === 0) {
        throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      }

      // Transisi status atomik: hanya baris berstatus DIAJUKAN yang bisa diubah.
      // Dua admin yang memverifikasi bersamaan: hanya satu yang berhasil (count=1),
      // yang lain mendapat count=0 → PROGRESS_ALREADY_VERIFIED (409).
      const transition = await tx.programProgress.updateMany({
        where: { id: progressId, status: ProgressStatus.DIAJUKAN },
        data: {
          status: decision === "APPROVED" ? ProgressStatus.DIVERIFIKASI : ProgressStatus.DITOLAK,
          verifiedById: reviewerId,
          verifiedAt: new Date(),
          rejectionReason: decision === "REJECTED" ? rejectionReason ?? "Ditolak" : null,
        },
      });

      if (transition.count === 0) {
        // Bedakan: tidak ada vs sudah diverifikasi.
        const exists = await tx.programProgress.findUnique({ where: { id: progressId }, select: { id: true } });
        if (!exists) throw new ApiError("PROGRESS_NOT_FOUND", "Progres tidak ditemukan.", 404);
        throw new ApiError("PROGRESS_ALREADY_VERIFIED", "Progres telah diverifikasi sebelumnya.", 409);
      }

      const updated = await tx.programProgress.findUnique({
        where: { id: progressId },
        include: {
          reportedBy: { select: { id: true, nama: true, role: true } },
          verifiedBy: { select: { id: true, nama: true, role: true } },
        },
      });

      if (!updated) throw new ApiError("PROGRESS_NOT_FOUND", "Progres tidak ditemukan.", 404);

      const prog = locked[0];

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: decision === "APPROVED" ? "APPROVE" : "REJECT",
          entity: "ProgramProgress",
          entityId: String(progressId),
          details: {
            programId: progress.programId,
            fromStatus: ProgressStatus.DIAJUKAN,
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
        const target = Number(prog.target ?? 0);

        // Tolak realisasi kumulatif yang melebihi target (invariant §9).
        if (target > 0 && totalRealisasi > target) {
          throw new ApiError(
            "REALISASI_EXCEEDS_TARGET",
            `Realisasi kumulatif (${totalRealisasi}) melebihi target program (${target}).`,
            400,
          );
        }

        const selesai = target > 0 && totalRealisasi >= target;
        const sedang = !selesai && totalRealisasi > 0 && prog.status === ProgramStatus.BELUM_DIKERJAKAN;

        // Jika program akan selesai, operator wajib telah menetapkan pagu.
        if (selesai && Number(prog.pagu ?? 0) <= 0) {
          throw new ApiError(
            "PAGU_BELUM_DITETAPKAN",
            "Pagu anggaran belum ditetapkan oleh operator bersama CV. Program tidak dapat diselesaikan sebelum pagu ditetapkan.",
            409,
          );
        }

        await tx.program.update({
          where: { id: progress.programId },
          data: {
            realisasi: totalRealisasi,
            realisasiVolume: totalRealisasi,
            ...(selesai
              ? {
                  status: ProgramStatus.SELESAI_DIKERJAKAN,
                  tanggalSelesai: new Date().toISOString(),
                  // Saat program selesai, pagu anggaran otomatis terpakai penuh.
                  penggunaan: Number(prog.pagu ?? 0),
                  penggunaanBiaya: Number(prog.pagu ?? 0),
                }
              : sedang
              ? {
                  status: ProgramStatus.SEDANG_DIKERJAKAN,
                }
              : {}),
          },
        });
      }

      return updated;
    });
  },

  async updatePhoto(progressId: number, storageKey: string, originalName: string | null, operatorId?: number) {
    const progress = await this.findById(progressId);
    // Hanya operator yang mengelola program (atau admin) yang dapat update foto.
    if (operatorId !== undefined && progress.program.operatorPengelolaId !== operatorId) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengubah foto progres program operator lain.", 403);
    }
    return prisma.programProgress.update({
      where: { id: progressId },
      data: { storageKey, originalName },
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