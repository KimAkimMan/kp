import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  createAccessToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
  verifyAccessToken,
} from "@/modules/auth/auth.crypto";

describe("auth crypto", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("secret");
    expect(hash).not.toBe("secret");
    expect(await verifyPassword("secret", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("creates one-way session token hashes", () => {
    const token = createSessionToken();
    expect(token).toHaveLength(84);
    expect(hashSessionToken(token)).toHaveLength(64);
    expect(hashSessionToken(token)).not.toBe(token);
  });

  it("signs and verifies JWT access tokens", () => {
    process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters";
    const expiresAt = new Date(Date.now() + 60_000);
    const token = createAccessToken(7, "session-1", expiresAt);
    expect(verifyAccessToken(token)).toMatchObject({ sub: "7", sid: "session-1" });
    expect(() => verifyAccessToken(`${token.slice(0, -1)}x`)).toThrow();
  });
});
