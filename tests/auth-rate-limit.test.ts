import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { loginRateLimiter } from "@/modules/auth/rate-limit";

const now = 1_700_000_000_000;

function request(ip = "127.0.0.1"): NextRequest {
  return new NextRequest("http://localhost/api/auth/login", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("loginRateLimiter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mengizinkan percobaan pertama tanpa riwayat kegagalan", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const result = loginRateLimiter.check(request(), "rate-awal@example.com");
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("memblokir setelah batas kegagalan dicapai", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const req = request();
    const email = "rate-block@example.com";
    for (let i = 0; i < 5; i++) {
      loginRateLimiter.recordFailure(req, email);
    }
    const result = loginRateLimiter.check(req, email);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tidak memblokir sebelum batas kegagalan tercapai", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const req = request();
    const email = "rate-under@example.com";
    for (let i = 0; i < 4; i++) {
      loginRateLimiter.recordFailure(req, email);
    }
    expect(loginRateLimiter.check(req, email).allowed).toBe(true);
  });

  it("mereset jendela setelah kadaluarsa", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const req = request();
    const email = "rate-reset@example.com";
    for (let i = 0; i < 5; i++) {
      loginRateLimiter.recordFailure(req, email);
    }
    expect(loginRateLimiter.check(req, email).allowed).toBe(false);

    vi.spyOn(Date, "now").mockReturnValue(now + 60 * 60 * 1000 + 1);
    expect(loginRateLimiter.check(req, email).allowed).toBe(true);
  });

  it("clear menghapus riwayat kegagalan", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const req = request();
    const email = "rate-clear@example.com";
    loginRateLimiter.recordFailure(req, email);
    loginRateLimiter.clear(req, email);
    expect(loginRateLimiter.check(req, email).allowed).toBe(true);
  });

  it("jendela pemblokiran berdurasi 60 menit", () => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    const req = request();
    const email = "rate-window@example.com";
    for (let i = 0; i < 5; i++) {
      loginRateLimiter.recordFailure(req, email);
    }
    // Masih dalam jendela 60 menit: diblokir.
    vi.spyOn(Date, "now").mockReturnValue(now + 30 * 60 * 1000);
    expect(loginRateLimiter.check(req, email).allowed).toBe(false);
    // Melewati jendela 60 menit: diizinkan lagi.
    vi.spyOn(Date, "now").mockReturnValue(now + 60 * 60 * 1000 + 1);
    expect(loginRateLimiter.check(req, email).allowed).toBe(true);
  });
});
