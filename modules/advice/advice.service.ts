import { adviceRepository } from "./advice.repository";
import { ApiError } from "@/lib/http/api-error";
import { randomUUID } from "node:crypto";

export const adviceService = {
  list() {
    return adviceRepository.findMany();
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
    const advice = await adviceRepository.findById(id);
    if (!advice) throw new ApiError("ADVICE_NOT_FOUND", "Arahan tidak ditemukan.", 404);
    return adviceRepository.update(id, { status });
  },

  async remove(id: string) {
    const advice = await adviceRepository.findById(id);
    if (!advice) throw new ApiError("ADVICE_NOT_FOUND", "Arahan tidak ditemukan.", 404);
    return adviceRepository.delete(id);
  },
};
