import type { NextRequest } from "next/server";
type Entry = { failures: number; resetAt: number };
const WINDOW_MS = 60 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_TRACKED_KEYS = 10_000;
const CLEANUP_INTERVAL_MS = 60_000;
const SATURATED_RETRY_AFTER_SECONDS = 60;
const entries = new Map<string, Entry>();
let lastCleanupAt = 0;
let saturatedUntil = 0;

function cleanupExpired(now: number) {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  for (const [key, entry] of entries) {
    if (now >= entry.resetAt) entries.delete(key);
  }
  lastCleanupAt = now;
}

// CATATAN KEAMANAN: x-forwarded-for dapat dipalsukan klien. Header ini hanya
// aman dipakai jika aplikasi berjalan di balik reverse proxy tepercaya yang
// sudah menyaring/menimpa x-forwarded-for dengan IP socket sebenarnya.
// Jika berjalan langsung di internet tanpa proxy tepercaya, gunakan IP socket
// asli daripada header ini.
function key(request: NextRequest, email: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${forwarded}:${email.trim().toLowerCase()}`;
}

export const loginRateLimiter = {
  async check(request: NextRequest, email: string) {
    const now = Date.now();
    cleanupExpired(now);
    const entry = entries.get(key(request, email));
    if (!entry || entry.resetAt <= now) {
      if (entry) entries.delete(key(request, email));
      if (saturatedUntil > now || entries.size >= MAX_TRACKED_KEYS) {
        saturatedUntil = Math.max(saturatedUntil, now + SATURATED_RETRY_AFTER_SECONDS * 1000);
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((saturatedUntil - now) / 1000),
          ),
        };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    }
    return {
      allowed: entry.failures < MAX_FAILURES,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  },
  async recordFailure(request: NextRequest, email: string) {
    const now = Date.now();
    cleanupExpired(now);
    const rateLimitKey = key(request, email);
    const current = entries.get(rateLimitKey);
    if (!current && entries.size >= MAX_TRACKED_KEYS) {
      saturatedUntil = Math.max(saturatedUntil, now + SATURATED_RETRY_AFTER_SECONDS * 1000);
      return;
    }
    const entry = !current || current.resetAt <= now
      ? { failures: 1, resetAt: now + WINDOW_MS }
      : { failures: current.failures + 1, resetAt: current.resetAt };
    entries.set(rateLimitKey, entry);
  },
  async clear(request: NextRequest, email: string) {
    entries.delete(key(request, email));
  },
};
