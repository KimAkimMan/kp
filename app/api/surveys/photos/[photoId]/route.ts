import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { surveyPhotoService } from "@/modules/surveys/survey-photo.service";

type Context = { params: Promise<{ photoId: string }> };

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const photoId = (await context.params).photoId;
    const result = await surveyPhotoService.deletePhoto(photoId, user);
    return successResponse(result);
  });
}
