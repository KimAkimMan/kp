import { ApiError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma";
import { ProgramStatus } from "@/generated/prisma/client";

export type CreateProgressInput = {
  tanggal: string;
  tahap: string;
  nilai: number;
  satuan: string;
  keterangan: string;
  foto?: boolean;
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
      const program = await tx.program.findUnique({ where: { id: programId } });
      if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      const history = await tx.programHistory.create({
        data: {
          programId,
          tanggal: date,
          tahap: input.tahap,
          nilai: input.nilai,
          satuan: input.satuan,
          keterangan: input.keterangan,
          foto: input.foto ?? false,
          penginput: userName,
          inputById: userId,
          status: input.status as ProgramStatus,
        },
      });
      const updated = await tx.program.update({
        where: { id: programId },
        data: {
          realisasi: input.nilai,
          realisasiVolume: input.nilai,
          status: input.status as ProgramStatus,
          update: date.toISOString(),
          catatan: input.keterangan,
          sumber: "Input progres Operator",
        },
        include: { operator: true, histories: true, costs: true },
      });
      return { program: updated, history };
    });
  },

  async addCost(programId: number, input: CreateCostInput, userId: number, userName: string) {
    const date = parseDate(input.tanggal);
    return prisma.$transaction(async (tx) => {
      const program = await tx.program.findUnique({ where: { id: programId } });
      if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
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
      const updated = await tx.program.update({
        where: { id: programId },
        data: {
          penggunaan: { increment: input.nominal },
          penggunaanBiaya: { increment: input.nominal },
        },
        include: { operator: true, histories: true, costs: true },
      });
      return { program: updated, cost };
    });
  },

  async markComplete(programId: number, userId: number, userName: string, foto = false) {
    return prisma.$transaction(async (tx) => {
      const program = await tx.program.findUnique({ where: { id: programId } });
      if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
      const date = new Date();
      const history = await tx.programHistory.create({
        data: {
          programId,
          tanggal: date,
          tahap: "Penyelesaian kegiatan",
          nilai: program.realisasi,
          satuan: program.satuan,
          keterangan: "Kegiatan ditandai selesai.",
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
        },
        include: { operator: true, histories: true, costs: true },
      });
      return { program: updated, history };
    });
  },
};
