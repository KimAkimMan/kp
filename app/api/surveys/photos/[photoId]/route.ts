import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { surveyPhotoRepository } from "@/modules/surveys/survey-photo.repository";

type Context = { params: Promise<{ photoId: string }> };

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    await requireRole("ADMIN", "OPERATOR");
    const photoId = (await context.params).photoId;
    const result = await surveyPhotoRepository.deletePhoto(photoId);
    return successResponse(result);
  });
}