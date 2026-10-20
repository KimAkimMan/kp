import { cookies } from "next/headers";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { SESSION_COOKIE, getSessionToken } from "@/modules/auth/auth.context";
import { authService } from "@/modules/auth/auth.service";

export async function POST() {
  return handleRoute(async () => {
    await authService.logout(await getSessionToken());
    (await cookies()).delete(SESSION_COOKIE);
    return successResponse({ loggedOut: true });
  });
}
