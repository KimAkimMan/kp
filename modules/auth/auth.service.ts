import { ApiError } from "@/lib/http/api-error";
import { authRepository } from "./auth.repository";
import {
  createAccessToken,
  createSessionId,
  hashSessionToken,
  verifyAccessToken,
  verifyPassword,
} from "./auth.crypto";
import type { AuthenticatedUser, LoginInput } from "./auth.types";
import { emailString, passwordString, parseJsonObject, requiredString } from "@/lib/validation";
import { hashPassword } from "./auth.crypto";

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
    const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
    const sessionId = createSessionId();
    const accessToken = createAccessToken(user.id, sessionId, expiresAt);
    const session = await authRepository.createUserSession({
      id: sessionId,
      userId: user.id,
      tokenHash: hashSessionToken(accessToken),
      expiresAt,
    });
    await authRepository.updateLastLoginAt(user.id);

    return {
      accessToken,
      expiresAt,
      user: session.user,
    };
  },

  async authenticate(token: string | null): Promise<AuthenticatedUser> {
    if (!token) {
      throw new ApiError("UNAUTHENTICATED", "Silakan masuk terlebih dahulu.", 401);
    }
    let claims;
    try {
      claims = verifyAccessToken(token);
    } catch {
      throw new ApiError("UNAUTHENTICATED", "Sesi sudah tidak berlaku.", 401);
    }
    const session = await authRepository.findSession(hashSessionToken(token));
    if (
      !session ||
      session.id !== claims.sid ||
      session.userId !== Number(claims.sub) ||
      session.expiresAt <= new Date()
    ) {
      throw new ApiError("UNAUTHENTICATED", "Sesi sudah tidak berlaku.", 401);
    }
    return { ...session.user, sessionId: session.id };
  },

  logout(token: string | null) {
    if (!token) return Promise.resolve();
    return authRepository.deleteSession(hashSessionToken(token));
  },

  async updateProfile(user: AuthenticatedUser, body: unknown) {
    const input = parseJsonObject(body);
    const nama = input.nama === undefined ? undefined : requiredString(input, "nama");
    const email = input.email === undefined ? undefined : emailString(input);
    if (nama === undefined && email === undefined) {
      throw new ApiError("VALIDATION_ERROR", "Tidak ada profil yang diubah.", 400);
    }
    if (email && email !== user.email) {
      const existing = await authRepository.findUserByEmail(email);
      if (existing) throw new ApiError("USER_EMAIL_EXISTS", "Email pengguna sudah terdaftar.", 409);
    }
    return authRepository.updateOwnProfile(user.id, { ...(nama === undefined ? {} : { nama }), ...(email === undefined ? {} : { email }) });
  },

  async changePassword(user: AuthenticatedUser, body: unknown) {
    const input = parseJsonObject(body);
    const currentPassword = passwordString(input, "currentPassword");
    const newPassword = passwordString(input, "newPassword");
    if (currentPassword === newPassword) throw new ApiError("VALIDATION_ERROR", "Password baru harus berbeda.", 400);
    const account = await authRepository.findUserWithPassword(user.id);
    if (!account || !(await verifyPassword(currentPassword, account.passwordHash))) {
      throw new ApiError("INVALID_CREDENTIALS", "Password saat ini tidak sesuai.", 401);
    }
    await authRepository.updatePassword(user.id, await hashPassword(newPassword));
    await authRepository.deleteOtherSessions(user.id, user.sessionId);
  },
};
