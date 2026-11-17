import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole } from "@/modules/auth/auth.context";
import { surveyPhotoService } from "@/modules/surveys/survey-photo.service";

type Context = { params: Promise<{ photoId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const { photoId } = await context.params;
    return successResponse(await surveyPhotoService.download(photoId, user));
  });
}
