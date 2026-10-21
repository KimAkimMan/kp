import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";

export async function GET() {
  return handleRoute(async () =>
    successResponse({
      status: "ok",
      timestamp: new Date().toISOString(),
    }),
  );
}
