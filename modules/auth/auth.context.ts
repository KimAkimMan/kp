import { cookies, headers } from "next/headers";
import type { UserRole } from "@/generated/prisma/client";
import { ApiError } from "@/lib/http/api-error";
import { authService } from "./auth.service";
import type { AuthenticatedUser } from "./auth.types";

export const SESSION_COOKIE = "kp_session";

export async function getSessionToken(): Promise<string | null> {
  const cookieToken = (await cookies()).get(SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const authorization = (await headers()).get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireUser(): Promise<AuthenticatedUser> {
  return authService.authenticate(await getSessionToken());
}

export async function requireRole(
  ...roles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ApiError("FORBIDDEN", "Anda tidak memiliki hak akses.", 403);
  }
  return user;
}
