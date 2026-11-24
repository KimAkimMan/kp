import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";

export const surveyReviewRepository = {
  async review(
    surveyId: string,
    decision: "DITOLAK" | "PERLU_REVISI" | "DISETUJUI",
    notes: unknown,
    reviewerId: number,
  ) {
    return prisma.$transaction(async (tx) => {
      const survey = await tx.fieldSurvey.findFirst({
        where: { id: surveyId, deletedAt: null },
      });
      if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);
      if (["DIVERIFIKASI", "DIKONVERSI"].includes(survey.status)) {
        throw new ApiError("SURVEY_LOCKED", "Survey yang telah diverifikasi tidak dapat ditinjau ulang.", 409);
      }
      if (survey.status !== "MENUNGGU_VERIFIKASI") {
        throw new ApiError("SURVEY_NOT_READY_FOR_REVIEW", "Survey belum dalam status menunggu verifikasi. Tidak dapat direview.", 409);
      }

      const targetStatus =
        decision === "DISETUJUI" ? "DIVERIFIKASI" : decision === "PERLU_REVISI" ? "PERLU_REVISI" : "DRAFT";
      const transition = await tx.fieldSurvey.updateMany({
        where: { id: surveyId, status: "MENUNGGU_VERIFIKASI", deletedAt: null },
        data: {
          status: targetStatus,
          ...(decision === "DISETUJUI"
            ? { verifiedById: reviewerId, verifiedAt: new Date() }
            : decision === "DITOLAK"
            ? { verifiedById: null, verifiedAt: null }
            : {}),
        },
      });
      if (transition.count !== 1) {
        throw new ApiError("SURVEY_ALREADY_REVIEWED", "Survey telah diproses review sebelumnya.", 409);
      }

      await tx.surveyReview.create({
        data: {
          surveyId,
          reviewerId,
          decision,
          notes: typeof notes === "string" ? notes : null,
        },
      });
      await tx.surveyStatusHistory.create({
        data: {
          surveyId,
          fromStatus: "MENUNGGU_VERIFIKASI",
          toStatus: targetStatus,
          changedById: reviewerId,
          reason: typeof notes === "string" ? notes : null,
        },
      });
      return tx.fieldSurvey.findUnique({
        where: { id: surveyId },
        include: { program: true, surveyorUser: { select: { id: true, nama: true, email: true, role: true } } },
      });
    });
  },
  async list(surveyId: string) {
    const survey = await prisma.fieldSurvey.findFirst({
      where: { id: surveyId, deletedAt: null },
      select: { id: true },
    });
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);

    return prisma.surveyReview.findMany({
      where: { surveyId },
      include: {
        reviewer: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { reviewedAt: "desc" },
    });
  },
};

export const surveyStatusHistoryRepository = {
  async list(surveyId: string) {
    const survey = await prisma.fieldSurvey.findFirst({
      where: { id: surveyId, deletedAt: null },
      select: { id: true },
    });
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);

    return prisma.surveyStatusHistory.findMany({
      where: { surveyId },
      include: {
        changedBy: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};