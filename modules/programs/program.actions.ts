import { ApiError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma";
import { ProgramStatus, ProgressStatus } from "@/generated/prisma/client";

export type CreateProgressInput = {
  tanggal: string;
  tahap: string;
  nilai: number;
  satuan: string;
  keterangan: string;
  foto?: boolean;
  storageKey?: string | null;
  originalName?: string | null;
  status: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
};

export type CreateCostInput = {
  tanggal: string;
  uraian: string;
  nominal: number;
  bukti?: boolean;
};

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError("VALIDATION_ERROR", "Tanggal tidak valid.", 400);
  }
  return date;
}

export const programActions = {
  async addProgress(programId: number, input: CreateProgressInput, userId: number, userName: string) {
    const date = parseDate(input.tanggal);
    return prisma.$transaction(async (tx) => {
      // Lock program row untuk mencegah race condition: dua request concurrent
      // tidak boleh sama-sama lolos validasi PROGRESS_EXCEEDS_TARGET.
      const locked = await tx.$queryRawUnsafe<Array<{ id: number; target: unknown; status: string }>>(
        `SELECT id, target, status FROM Program WHERE id = ? FOR UPDATE`,
        programId,
      );
      if (!locked || locked.length === 0) {
        throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      }
      const program = await tx.program.findFirst({ where: { id: programId, deletedAt: null } });
      if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      if (String(locked[0].status) === ProgramStatus.SELESAI_DIKERJAKAN) {
        throw new ApiError("PROGRAM_COMPLETED", "Program yang sudah selesai tidak dapat diubah.", 409);
      }
      // Validasi kumulatif: sum progress DIVERIFIKASI + nilai baru <= target
      const alreadyApproved = await tx.programProgress.aggregate({
        where: {
          programId,
          status: ProgressStatus.DIVERIFIKASI,
        },
        _sum: { volume: true },
      });
      const totalCurrent = Number(alreadyApproved._sum.volume ?? 0);
      const requested = Number(input.nilai);
      const target = Number(program.target ?? 0);
      if (target > 0 && totalCurrent + requested > target) {
        throw new ApiError(
          "PROGRESS_EXCEEDS_TARGET",
          `Realisasi kumulatif (${totalCurrent + requested}) melebihi target program (${target}).`,
          400,
        );
      }
      const progressStatus = input.status as ProgramStatus;
      // Operator tidak bisa menyelesaikan program lewat progres.
      // Status SELESAI_DIKERJAKAN hanya boleh ditetapkan melalui action markComplete.
      if (progressStatus === ProgramStatus.SELESAI_DIKERJAKAN) {
        throw new ApiError(
          "PROGRESS_NOT_READY_TO_COMPLETE",
          "Status selesai hanya dapat ditetapkan melalui aksi Selesai, bukan melalui input progres.",
          409,
        );
      }
      const history = await tx.programHistory.create({
        data: {
          programId,
          tanggal: date,
          tahap: input.tahap,
          nilai: input.nilai,
          satuan: input.satuan,
          keterangan: input.keterangan,
          foto: input.foto ?? false,
          storageKey: input.storageKey ?? null,
          originalName: input.originalName ?? null,
          penginput: userName,
          inputById: userId,
          status: progressStatus,
        },
      });
      // Jika storageKey diberikan, cari progress record DRAFT yang sudah dibuat
      // oleh completeDirect (upload foto terlebih dahulu). Update record tersebut
      // agar tidak ada duplikasi progress record untuk 1 foto yang sama.
      let progress;
      if (input.storageKey) {
        const existingDraft = await tx.programProgress.findFirst({
          where: {
            programId,
            storageKey: input.storageKey,
            status: ProgressStatus.DRAFT,
          },
        });
        if (existingDraft) {
          progress = await tx.programProgress.update({
            where: { id: existingDraft.id },
            data: {
              tanggal: date,
              tahap: input.tahap,
              volume: input.nilai,
              satuan: input.satuan,
              persentase:
                Number(program.target) > 0
                  ? Math.min(100, (input.nilai / Number(program.target)) * 100)
                  : null,
              keterangan: input.keterangan,
              reportedById: userId,
              status: "DIAJUKAN",
              originalName:
                input.originalName ?? existingDraft.originalName ?? null,
            },
          });
        } else {
          const storageKeys = input.storageKey.split(",").map((key) => key.trim()).filter(Boolean);
          const draftProgress = storageKeys.length > 1
            ? await tx.programProgress.findMany({
                where: {
                  programId,
                  storageKey: { in: storageKeys },
                  status: ProgressStatus.DRAFT,
                },
                orderBy: { createdAt: "asc" },
              })
            : [];
          if (draftProgress.length > 0) {
            progress = await tx.programProgress.update({
              where: { id: draftProgress[0].id },
              data: {
                tanggal: date,
                tahap: input.tahap,
                volume: input.nilai,
                satuan: input.satuan,
                persentase:
                  Number(program.target) > 0
                    ? Math.min(100, (input.nilai / Number(program.target)) * 100)
                    : null,
                keterangan: input.keterangan,
                reportedById: userId,
                status: "DIAJUKAN",
                storageKey: input.storageKey,
                originalName: input.originalName ?? draftProgress[0].originalName ?? null,
              },
            });
            await tx.programProgress.deleteMany({
              where: {
                id: { in: draftProgress.slice(1).map((draft) => draft.id) },
                status: ProgressStatus.DRAFT,
              },
            });
          } else {
            progress = await tx.programProgress.create({
              data: {
                programId,
                tanggal: date,
                tahap: input.tahap,
                volume: input.nilai,
                satuan: input.satuan,
                persentase:
                  Number(program.target) > 0
                    ? Math.min(100, (input.nilai / Number(program.target)) * 100)
                    : null,
                keterangan: input.keterangan,
                reportedById: userId,
                status: "DIAJUKAN",
                storageKey: input.storageKey,
                originalName: input.originalName ?? null,
              },
            });
          }
        }
      } else {
        progress = await tx.programProgress.create({
          data: {
            programId,
            tanggal: date,
            tahap: input.tahap,
            volume: input.nilai,
            satuan: input.satuan,
            persentase:
              Number(program.target) > 0
                ? Math.min(100, (input.nilai / Number(program.target)) * 100)
                : null,
            keterangan: input.keterangan,
            reportedById: userId,
            status: "DIAJUKAN",
            storageKey: input.storageKey ?? null,
            originalName: input.originalName ?? null,
          },
        });
      }
      const updated = await tx.program.update({
        where: { id: programId },
        data: {
          // Realisasi dan status Program HANYA diupdate saat progres DIVERIFIKASI
          // (lihat program-progress.repository.ts verify), bukan saat DIAJUKAN.
          update: date.toISOString(),
          catatan: input.keterangan,
          sumber: "Input progres Operator",
        },
        include: { operator: true, histories: true, costs: true },
      });
      return { program: updated, history, progress };
    });
  },

  async addCost(programId: number, input: CreateCostInput, userId: number, userName: string) {
    const date = parseDate(input.tanggal);
    return prisma.$transaction(async (tx) => {
      // Lock program row untuk mencegah race condition pada cek pagu.
      const locked = await tx.$queryRawUnsafe<Array<{ id: number; pagu: unknown; penggunaan: unknown; status: string }>>(
        `SELECT id, pagu, penggunaan, status FROM Program WHERE id = ? FOR UPDATE`,
        programId,
      );
      if (!locked || locked.length === 0) {
        throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      }
      const program = await tx.program.findFirst({ where: { id: programId, deletedAt: null } });
      if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      if (String(locked[0].status) === ProgramStatus.SELESAI_DIKERJAKAN) {
        throw new ApiError("PROGRAM_COMPLETED", "Program yang sudah selesai tidak dapat diubah.", 409);
      }
      const nextUsage = Number(locked[0].penggunaan ?? 0) + input.nominal;
      if (Number(locked[0].pagu ?? 0) > 0 && nextUsage > Number(locked[0].pagu)) {
        throw new ApiError("COST_EXCEEDS_BUDGET", "Penggunaan biaya melebihi pagu program.", 400);
      }
      const cost = await tx.programCost.create({
        data: {
          programId,
          tanggal: date,
          uraian: input.uraian,
          nominal: input.nominal,
          input: userName,
          inputById: userId,
          bukti: input.bukti ?? false,
        },
      });
      // Penggunaan anggaran hanya bertambah saat biaya DIVERIFIKASI (di cost repository.verify),
      // bukan saat dibuat (DIAJUKAN). Biaya yang ditolak tidak pernah memakan pagu.
      return { program, cost };
    });
  },

  async markComplete(programId: number, userId: number, userName: string, foto = false) {
    return prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRawUnsafe<Array<{
        id: number;
        pagu: unknown;
        target: unknown;
        realisasi: unknown;
        status: string;
      }>>(
        `SELECT id, pagu, target, realisasi, status FROM Program WHERE id = ? FOR UPDATE`,
        programId,
      );
      if (!locked || locked.length === 0) {
        throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      }
      const program = await tx.program.findFirst({
        where: { id: programId, deletedAt: null },
      });
      if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      if (String(locked[0].status) === ProgramStatus.SELESAI_DIKERJAKAN) {
        throw new ApiError("PROGRAM_COMPLETED", "Program sudah selesai.", 409);
      }
      // Operator wajib telah menetapkan pagu bersama CV sebelum program selesai.
      if (Number(locked[0].pagu ?? 0) <= 0) {
        throw new ApiError(
          "PAGU_BELUM_DITETAPKAN",
          "Pagu anggaran belum ditetapkan oleh operator bersama CV. Program tidak dapat diselesaikan sebelum pagu ditetapkan.",
          409,
        );
      }
      if (Number(locked[0].target) > 0 && Number(locked[0].realisasi) < Number(locked[0].target)) {
        throw new ApiError("PROGRAM_NOT_READY_TO_COMPLETE", "Realisasi belum mencapai target.", 409);
      }
      // Wajib ada minimal 1 progress DIVERIFIKASI sebelum menyelesaikan program
      const approvedProgress = await tx.programProgress.aggregate({
        where: {
          programId,
          status: ProgressStatus.DIVERIFIKASI,
        },
        _count: true,
      });
      if (approvedProgress._count === 0) {
        throw new ApiError(
          "NO_VERIFIED_PROGRESS",
          "Program tidak dapat diselesaikan: belum ada progres yang diverifikasi.",
          409,
        );
      }
      const date = new Date();
      const history = await tx.programHistory.create({
        data: {
          programId,
          tanggal: date,
          tahap: "Penyelesaian kegiatan",
          nilai: Number(locked[0].realisasi),
          satuan: program.satuan,
          keterangan: "Kegiatan ditandai selesai. Pagu anggaran terpakai penuh.",
          foto,
          penginput: userName,
          inputById: userId,
          status: ProgramStatus.SELESAI_DIKERJAKAN,
        },
      });
      const updated = await tx.program.update({
        where: { id: programId },
        data: {
          status: ProgramStatus.SELESAI_DIKERJAKAN,
          update: date.toISOString(),
          tanggalSelesai: date.toISOString(),
          // Saat program selesai, pagu anggaran otomatis terpakai penuh.
          penggunaan: program.pagu,
          penggunaanBiaya: program.pagu,
        },
        include: { operator: true, histories: true, costs: true },
      });
      return { program: updated };
    });
  },
};
