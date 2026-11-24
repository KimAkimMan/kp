import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { parseRequestBody } from "@/lib/http/request";
import { requireRole } from "@/modules/auth/auth.context";
import { parseCompletedUploadInput } from "@/modules/storage/direct-upload.service";
import { surveyPhotoService } from "@/modules/surveys/survey-photo.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN", "OPERATOR");
    const rateLimit = await operationRateLimiter.check(request, user.id);
    if (!rateLimit.allowed) {
      throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
    }
    const { id } = await context.params;
    const body = await parseRequestBody(request);
    const input = parseCompletedUploadInput(body);
    const raw = body as Record<string, unknown>;
    return successResponse(await surveyPhotoService.completeDirect(id, {
      ...input,
      caption: typeof raw.caption === "string" ? raw.caption.trim() : null,
      latitude: typeof raw.latitude === "number" ? raw.latitude : null,
      longitude: typeof raw.longitude === "number" ? raw.longitude : null,
    }, user), 201);
  });
}
