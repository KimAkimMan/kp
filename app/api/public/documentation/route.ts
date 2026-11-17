import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { programService } from "@/modules/programs/program.service";

export async function GET() {
  return handleRoute(async () => {
    const photos = await programService.getDocumentationPhotos();
    return successResponse(photos);
  });
}

