import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { SESSION_COOKIE } from "@/modules/auth/auth.context";
import { authService } from "@/modules/auth/auth.service";
import { emailString, parseJsonObject, passwordString } from "@/lib/validation";
import { loginRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const input = parseJsonObject(await parseRequestBody(request));
    const email = emailString(input);
    const limit = loginRateLimiter.check(request, email);
    if (!limit.allowed) {
      throw new ApiError(
        "RATE_LIMITED",
        "Terlalu banyak percobaan login. Silakan coba lagi nanti.",
        429,
        { retryAfterSeconds: limit.retryAfterSeconds },
      );
    }
    let result;
    try {
      result = await authService.login({
        email,
        password: passwordString(input),
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
        loginRateLimiter.recordFailure(request, email);
      }
      throw error;
    }
    loginRateLimiter.clear(request, email);
    (await cookies()).set(SESSION_COOKIE, result.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return successResponse({
      accessToken: result.accessToken,
      user: result.user,
      expiresAt: result.expiresAt,
    });
  });
}
