import { ApiError } from "@/lib/http/api-error";
import { authRepository } from "./auth.repository";
import {
  createSessionToken,
  hashSessionToken,
  verifyPassword,
} from "./auth.crypto";
import type { AuthenticatedUser, LoginInput } from "./auth.types";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export const authService = {
  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email.toLowerCase());
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Email atau kata sandi tidak sesuai.",
        401,
      );
    }

    await authRepository.deleteExpiredSessions();
    const token = createSessionToken();
    const session = await authRepository.createUserSession({
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt: new Date(Date.now() + SESSION_DURATION_SECONDS * 1000),
    });

    return {
      token,
      expiresAt: session.expiresAt,
      user: session.user,
    };
  },

  async authenticate(token: string | null): Promise<AuthenticatedUser> {
    if (!token) {
      throw new ApiError("UNAUTHENTICATED", "Silakan masuk terlebih dahulu.", 401);
    }
    const session = await authRepository.findSession(hashSessionToken(token));
    if (!session || session.expiresAt <= new Date()) {
      throw new ApiError("UNAUTHENTICATED", "Sesi sudah tidak berlaku.", 401);
    }
    return { ...session.user, sessionId: session.id };
  },

  logout(token: string | null) {
    if (!token) return Promise.resolve();
    return authRepository.deleteSession(hashSessionToken(token));
  },
};
