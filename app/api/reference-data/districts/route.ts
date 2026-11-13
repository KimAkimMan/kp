import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { referenceDataService } from "@/modules/reference-data/reference-data.service";

export async function GET() {
  return handleRoute(async () => {
    await requireUser();
    return successResponse(await referenceDataService.districts());
  });
}
