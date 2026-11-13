import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { parseRequestBody } from "@/lib/http/request";
import { requireRole } from "@/modules/auth/auth.context";
import { parseDirectUploadInput } from "@/modules/storage/direct-upload.service";
import { surveyPhotoService } from "@/modules/surveys/survey-photo.service";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const { id } = await context.params;
    const input = parseDirectUploadInput(await parseRequestBody(request));
    return successResponse(await surveyPhotoService.presignDirect(id, input, user));
  });
}
