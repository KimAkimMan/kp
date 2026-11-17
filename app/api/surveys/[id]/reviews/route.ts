import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { surveyReviewRepository, surveyStatusHistoryRepository } from "@/modules/surveys/survey-review.repository";

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