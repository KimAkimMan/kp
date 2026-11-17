import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";

export const surveyReviewRepository = {
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