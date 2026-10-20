import type { NextRequest } from "next/server";

type Entry = { failures: number; resetAt: number };
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const entries = new Map<string, Entry>();

function key(request: NextRequest, email: string): string {
  return `${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}:${email}`;
}

export const loginRateLimiter = {
  check(request: NextRequest, email: string) {
    const now = Date.now();
    const entry = entries.get(key(request, email));
    if (!entry || entry.resetAt <= now) return { allowed: true, retryAfterSeconds: 0 };
    return {
      allowed: entry.failures < MAX_FAILURES,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  },
  recordFailure(request: NextRequest, email: string) {
    const now = Date.now();
    const current = entries.get(key(request, email));
    const entry = !current || current.resetAt <= now
      ? { failures: 1, resetAt: now + WINDOW_MS }
      : { failures: current.failures + 1, resetAt: current.resetAt };
    entries.set(key(request, email), entry);
  },
  clear(request: NextRequest, email: string) {
    entries.delete(key(request, email));
  },
};
