import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";

export async function GET() {
  return handleRoute(async () => successResponse(await requireUser()));
}
