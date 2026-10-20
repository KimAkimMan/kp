import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { SESSION_COOKIE } from "@/modules/auth/auth.context";
import { authService } from "@/modules/auth/auth.service";
import { parseJsonObject, requiredString } from "@/lib/validation";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const input = parseJsonObject(await parseRequestBody(request));
    const result = await authService.login({
      email: requiredString(input, "email"),
      password: requiredString(input, "password"),
    });
    (await cookies()).set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return successResponse({ user: result.user, expiresAt: result.expiresAt });
  });
}
