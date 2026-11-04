import { surveyRepository } from "./survey.repository";
import { ApiError } from "@/lib/http/api-error";
import { randomUUID } from "node:crypto";
import type { SurveyInput } from "./survey.types";
import { prisma } from "@/lib/prisma";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const surveyService = {
  list(pagination?: { skip: number; pageSize: number }, user?: AuthenticatedUser) {
    return surveyRepository.findMany(pagination, user?.role === "OPERATOR" ? user.id : undefined);
  },

  async get(id: string) {
    const survey = await surveyRepository.findById(id);
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);
    return survey;
  },

  create(input: SurveyInput, user?: AuthenticatedUser) {
    if (user?.role === "OPERATOR" && input.status === "DIVERIFIKASI") {
      throw new ApiError("FORBIDDEN", "Operator tidak dapat memverifikasi survey.", 403);
    }
    return surveyRepository.create(input, input.id ?? randomUUID());
  },

  async update(id: string, input: Partial<SurveyInput>, user?: AuthenticatedUser) {
    const survey = await this.get(id);
    if (user?.role === "OPERATOR" && survey.surveyorId !== user.id) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengubah survey operator lain.", 403);
    }
    if (
      user?.role === "OPERATOR" &&
      (input.surveyorId !== undefined || input.status === "DIVERIFIKASI" || input.status === "DIKONVERSI")
    ) {
      throw new ApiError("FORBIDDEN", "Operator tidak dapat mengubah kepemilikan atau status verifikasi survey.", 403);
    }
    if (survey.status === "DIVERIFIKASI" || survey.status === "DIKONVERSI") {
      throw new ApiError("SURVEY_LOCKED", "Survey yang telah diverifikasi tidak dapat diubah.", 409);
    }
    return surveyRepository.update(id, input);
  },

  async remove(id: string) {
    await this.get(id);
    return surveyRepository.delete(id);
  },

  async verify(id: string, programId: number | null | undefined, reviewerId: number) {
    const survey = await this.get(id);
    if (survey.status === "DIKONVERSI") {
      throw new ApiError("SURVEY_LOCKED", "Survey yang telah dikonversi tidak dapat diverifikasi ulang.", 409);
    }
    if (!["SELESAI_SURVEY", "MENUNGGU_VERIFIKASI", "PERLU_REVISI"].includes(survey.status)) {
      throw new ApiError("SURVEY_NOT_READY_FOR_REVIEW", "Survey belum siap untuk diverifikasi.", 409);
    }
    if (programId !== undefined && programId !== null) {
      const program = await prisma.program.findFirst({ where: { id: programId, deletedAt: null } });
      if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    }
    return prisma.$transaction(async (tx) => {
      const updated = await tx.fieldSurvey.update({
        where: { id },
        data: {
          status: "DIVERIFIKASI",
          programId: programId ?? survey.programId,
          verifiedById: reviewerId,
          verifiedAt: new Date(),
        },
        include: { program: true, surveyorUser: true },
      });
      await tx.surveyReview.create({
        data: {
          surveyId: id,
          reviewerId,
          decision: "DISETUJUI",
        },
      });
      await tx.surveyStatusHistory.create({
        data: {
          surveyId: id,
          fromStatus: survey.status,
          toStatus: "DIVERIFIKASI",
          changedById: reviewerId,
        },
      });
      return updated;
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
  }, createdById?: number) {
    return prisma.$transaction(async (tx) => {
      const survey = await tx.fieldSurvey.findFirst({ where: { id, deletedAt: null } });
      if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);
      if (survey.programId) {
        throw new ApiError("SURVEY_ALREADY_CONVERTED", "Survey sudah menjadi program.", 409);
      }
      if (survey.status !== "DIVERIFIKASI") {
        throw new ApiError("SURVEY_NOT_VERIFIED", "Survey harus diverifikasi sebelum dikonversi.", 409);
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
          createdById,
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
        data: { programId: program.id, status: "DIKONVERSI" },
      });
      await tx.surveyProgramLink.create({
        data: {
          surveyId: id,
          programId: program.id,
          relationType: "CONVERTED_TO_PROGRAM",
        },
      });
      if (survey.surveyorId !== null) {
        await tx.programAssignment.create({
          data: {
            programId: program.id,
            operatorId: survey.surveyorId,
            assignedById: createdById,
            status: "DITERIMA",
            acceptedAt: new Date(),
          },
        });
      }
      return program;
    });
  },
};
