import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/client";
import { ApiError } from "@/lib/http/api-error";
import { authService } from "./auth.service";
import type { AuthenticatedUser } from "./auth.types";

export const SESSION_COOKIE = "kp_session";

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
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
