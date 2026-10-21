import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { getHealthConfigError, validateRuntimeConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return handleRoute(async () => {
    try {
      validateRuntimeConfig();
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      throw getHealthConfigError(error);
    }
    return successResponse({
      status: "ready",
      database: "up",
      timestamp: new Date().toISOString(),
    });
  });
}
