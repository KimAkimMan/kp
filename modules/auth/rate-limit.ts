import type { NextRequest } from "next/server";

type Entry = { failures: number; resetAt: number };
// Jendela pemblokiran login setelah melebihi batas kegagalan. Diperpanjang
// agar percobaan brute-force tidak dapat mencoba ulang terlalu cepat.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_FAILURES = 5;
const entries = new Map<string, Entry>();

// CATATAN KEAMANAN: x-forwarded-for dapat dipalsukan klien. Header ini hanya
// aman dipakai jika aplikasi berjalan di balik reverse proxy tepercaya yang
// sudah menyaring/menimpa x-forwarded-for dengan IP socket sebenarnya.
// Jika berjalan langsung di internet tanpa proxy tepercaya, gunakan IP socket
// asli daripada header ini.
function key(request: NextRequest, email: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";
  return `${forwarded}:${ua}:${email.toLowerCase()}`;
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
