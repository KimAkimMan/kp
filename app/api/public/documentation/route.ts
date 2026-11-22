import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { programService } from "@/modules/programs/program.service";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await requireUser();
    const photos = await programService.getDocumentationPhotos();
    return successResponse(photos);
  });
}

