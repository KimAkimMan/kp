import { adviceRepository } from "./advice.repository";
import { ApiError } from "@/lib/http/api-error";
import { randomUUID } from "node:crypto";
import type { AdviceStatus } from "@/generated/prisma/client";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const adviceService = {
  list(pagination?: { skip: number; pageSize: number }) {
    return adviceRepository.findMany(pagination);
  },

  async get(id: string) {
    const advice = await adviceRepository.findById(id);
    if (!advice) throw new ApiError("ADVICE_NOT_FOUND", "Arahan tidak ditemukan.", 404);
    return advice;
  },

  async create(input: {
    idKegiatan: number;
    namaKegiatan: string;
    identitasPimpinan: string;
    pimpinanId: number;
    operatorPenerima: string;
    operatorId?: number | null;
    isi: string;
  }) {
    const program = await adviceRepository.findActiveProgram(input.idKegiatan);
    if (!program) {
      throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    }
    if (input.operatorId !== null && input.operatorId !== undefined) {
      const operator = await adviceRepository.findActiveOperator(input.operatorId);
      if (!operator) {
        throw new ApiError("OPERATOR_NOT_FOUND", "Operator penerima tidak ditemukan.", 404);
      }
    }
    return adviceRepository.create({
      ...input,
      id: randomUUID(),
      tanggal: new Date(),
      status: "BELUM_DITINDAKLANJUTI",
    });
  },

  async updateStatus(id: string, status: AdviceStatus, user?: AuthenticatedUser) {
    const advice = await this.get(id);
    if (
      user?.role === "OPERATOR" &&
      advice.operatorId !== null &&
      advice.operatorId !== user.id
    ) {
      throw new ApiError("FORBIDDEN", "Arahan ini bukan ditujukan kepada Anda.", 403);
    }
    if (
      user?.role === "OPERATOR" &&
      status !== "SUDAH_DITINDAKLANJUTI"
    ) {
      throw new ApiError("INVALID_ADVICE_TRANSITION", "Operator hanya dapat menandai arahan telah ditindaklanjuti.", 409);
    }
    return adviceRepository.update(id, { status });
  },

  async remove(id: string) {
    await this.get(id);
    return adviceRepository.delete(id);
  },
};
