import { adviceRepository } from "./advice.repository";
import { ApiError } from "@/lib/http/api-error";
import { randomUUID } from "node:crypto";
import type { AdviceStatus } from "@/generated/prisma/client";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export type AdviceListFilters = {
  search?: string;
  status?: "BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI";
  operatorId?: number;
  pagination?: { skip: number; pageSize: number };
};

export const adviceService = {
  list(filters?: AdviceListFilters) {
    return adviceRepository.findMany(filters);
  },

  async get(id: string, user?: AuthenticatedUser) {
    const advice = await adviceRepository.findById(id);
    if (!advice) throw new ApiError("ADVICE_NOT_FOUND", "Arahan tidak ditemukan.", 404);
    // Operator hanya dapat melihat arahan yang ditujukan kepadanya.
    if (user?.role === "OPERATOR" && advice.operatorId !== user.id) {
      throw new ApiError("FORBIDDEN", "Arahan ini bukan ditujukan kepada Anda.", 403);
    }
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
    const operatorId = input.operatorId ?? program.operatorPengelolaId;
    const operator = operatorId === null || operatorId === undefined
      ? null
      : await adviceRepository.findActiveOperator(operatorId);
    if (operatorId !== null && operatorId !== undefined) {
      if (!operator) {
        throw new ApiError("OPERATOR_NOT_FOUND", "Operator penerima tidak ditemukan atau tidak aktif.", 404);
      }
    }
    return adviceRepository.create({
      ...input,
      operatorId,
      id: randomUUID(),
      tanggal: new Date(),
      status: "BELUM_DITINDAKLANJUTI",
    });
  },

  async updateStatus(id: string, status: AdviceStatus, user?: AuthenticatedUser) {
    const advice = await this.get(id);
    if (user?.role === "OPERATOR" && advice.operatorId !== user.id) {
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

  async remove(id: string, userId?: number) {
    await this.get(id);
    return adviceRepository.delete(id, userId);
  },
};
