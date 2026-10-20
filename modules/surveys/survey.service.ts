import { surveyRepository } from "./survey.repository";
import { ApiError } from "@/lib/http/api-error";
import { randomUUID } from "node:crypto";
import type { SurveyInput } from "./survey.types";
import { prisma } from "@/lib/prisma";

export const surveyService = {
  list() {
    return surveyRepository.findMany();
  },

  async get(id: string) {
    const survey = await surveyRepository.findById(id);
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);
    return survey;
  },

  create(input: SurveyInput) {
    return surveyRepository.create(input, input.id ?? randomUUID());
  },

  async update(id: string, input: Partial<SurveyInput>) {
    await this.get(id);
    return surveyRepository.update(id, input);
  },

  async remove(id: string) {
    await this.get(id);
    return surveyRepository.delete(id);
  },

  async verify(id: string, programId?: number | null) {
    await this.get(id);
    return surveyRepository.update(id, {
      status: "DIVERIFIKASI",
      programId: programId ?? undefined,
    });
  },

  async convertToProgram(id: string, input: {
    kode: string;
    nama?: string;
    pj: string;
    periode: string;
    satuan: string;
    target: number;
    pagu: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const survey = await tx.fieldSurvey.findUnique({ where: { id } });
      if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);
      if (survey.programId) {
        throw new ApiError("SURVEY_ALREADY_CONVERTED", "Survey sudah menjadi program.", 409);
      }
      const program = await tx.program.create({
        data: {
          kode: input.kode,
          nama: input.nama ?? survey.namaKegiatan,
          namaKegiatan: input.nama ?? survey.namaKegiatan,
          kategori: survey.kategori,
          lokasi: [survey.detailLokasi, survey.desaKelurahan, survey.kecamatan].filter(Boolean).join(", "),
          kecamatan: survey.kecamatan,
          desaKelurahan: survey.desaKelurahan,
          detailLokasi: survey.detailLokasi,
          pj: input.pj,
          operatorPengelola: survey.surveyor,
          operatorPengelolaId: survey.surveyorId,
          periode: input.periode,
          satuan: input.satuan,
          targetAwal: input.target,
          target: input.target,
          targetVolume: input.target,
          realisasi: 0,
          realisasiVolume: 0,
          status: "BELUM_DIKERJAKAN",
          update: new Date().toISOString(),
          sumber: `Hasil Survey Lapangan (${survey.kodeSurvey})`,
          catatan: `${survey.uraianTemuan} Rekomendasi: ${survey.rekomendasi}`,
          pagu: input.pagu,
          penggunaan: 0,
          penggunaanBiaya: 0,
          lebarJalan: survey.lebar,
          kondisiJalan: survey.kondisi,
        },
      });
      await tx.fieldSurvey.update({
        where: { id },
        data: { programId: program.id, status: "DIVERIFIKASI" },
      });
      return program;
    });
  },
};
