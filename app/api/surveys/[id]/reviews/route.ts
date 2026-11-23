import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { prisma } from "@/lib/prisma";
import { surveyRepository } from "@/modules/surveys/survey.repository";
import { surveyReviewRepository, surveyStatusHistoryRepository } from "@/modules/surveys/survey-review.repository";
import { publicUserSelect } from "@/modules/auth/auth.repository";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireUser();
    const { id } = await context.params;
    const reviews = await surveyReviewRepository.list(id);
    const history = await surveyStatusHistoryRepository.list(id);
    return successResponse({ reviews, history });
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireUser();
      const { id } = await context.params;
      const body = await request.json();
      const { decision, notes } = body;

      if (!decision || !["DITOLAK", "PERLU_REVISI", "DISETUJUI"].includes(decision)) {
        throw new ApiError("VALIDATION_ERROR", "Decision harus 'DITOLAK', 'PERLU_REVISI', atau 'DISETUJUI'.", 400);
      }

      const survey = await surveyRepository.findById(id);
      if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);
      if (["DIVERIFIKASI", "DIKONVERSI"].includes(survey.status)) {
        throw new ApiError("SURVEY_LOCKED", "Survey yang telah diverifikasi tidak dapat ditinjau ulang.", 409);
      }

      return successResponse(
        await prisma.$transaction(async (tx) => {
          const targetStatus =
            decision === "DISETUJUI" ? "DIVERIFIKASI" : decision === "PERLU_REVISI" ? "PERLU_REVISI" : "DRAFT";

          const updated = await tx.fieldSurvey.update({
            where: { id },
            data: {
              status: targetStatus,
              ...(decision === "DITOLAK" ? { verifiedById: null, verifiedAt: null } : {}),
            },
            include: { program: true, surveyorUser: { select: publicUserSelect } },
          });

          await tx.surveyReview.create({
            data: {
              surveyId: id,
              reviewerId: user.id,
              decision,
              notes: notes ?? null,
            },
          });

          await tx.surveyStatusHistory.create({
            data: {
              surveyId: id,
              fromStatus: survey.status,
              toStatus: targetStatus,
              changedById: user.id,
              reason: notes ?? null,
            },
          });

          return updated;
        }),
      );
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/surveys/[id]/reviews" } },
  );
}
