import { adviceRepository } from "./advice.repository";
import { ApiError } from "@/lib/http/api-error";
import { randomUUID } from "node:crypto";

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
    return adviceRepository.create({
      ...input,
      id: randomUUID(),
      tanggal: new Date(),
      status: "Belum ditindaklanjuti",
    });
  },

  async updateStatus(id: string, status: string) {
    await this.get(id);
    return adviceRepository.update(id, { status });
  },

  async remove(id: string) {
    await this.get(id);
    return adviceRepository.delete(id);
  },
};
