import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { surveyPhotoService } from "@/modules/surveys/survey-photo.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const surveyId = (await context.params).id;
    const result = await surveyPhotoService.list(surveyId, user as AuthenticatedUser);
    return successResponse(result);
  });
}
export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const surveyId = (await context.params).id;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;
    const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : undefined;
    const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : undefined;

    if (!file) {
      throw new Error("File tidak ditemukan.");
    }

    const result = await surveyPhotoService.addPhoto(
      surveyId,
      { file, caption: caption ?? undefined, latitude, longitude },
      user as AuthenticatedUser,
    );
    return successResponse(result, 201);
  });
}
