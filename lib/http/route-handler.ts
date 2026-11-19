import { errorResponse } from "./api-response";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { ApiError } from "./api-error";

export const DEFAULT_ROUTE_TIMEOUT_MS = 30_000;

// Cache idempotensi di server (in-memory). Kunci: Idempotency-Key header.
// Nilai: { status, body } dari response yang sudah diproses.
// TTL 24 jam untuk mencegah pertumbuhan tak terbatas.
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const idempotencyCache = new Map<string, {
  status: number;
  body: unknown;
  expiresAt: number;
}>();

async function getIdempotencyKey(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("Idempotency-Key") ?? null;
  } catch {
    return null;
  }
}

export async function handleRoute(
  handler: () => Promise<Response>,
  timeoutMs = DEFAULT_ROUTE_TIMEOUT_MS,
): Promise<Response> {
  const effectiveTimeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0
    ? timeoutMs
    : DEFAULT_ROUTE_TIMEOUT_MS;
  let requestId: string = randomUUID();
  try {
    requestId = (await headers()).get("x-request-id") ?? requestId;
  } catch {
    // Route unit tests can run without a Next request context.
  }

  // Bersihkan entri kadaluarsa sebelum pemeriksaan.
  const now = Date.now();
  for (const [key, entry] of idempotencyCache.entries()) {
    if (entry.expiresAt < now) {
      idempotencyCache.delete(key);
    }
  }

  const idempotencyKey = await getIdempotencyKey();

  // Jika kunci idempotensi sudah diproses sebelumnya, kembalikan cache.
  if (idempotencyKey) {
    const cached = idempotencyCache.get(idempotencyKey);
    if (cached) {
      return new Response(JSON.stringify(cached.body), {
        status: cached.status,
        headers: {
          "content-type": "application/json",
          "x-request-id": requestId,
          "x-idempotent": "replayed",
        },
      });
    }
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new ApiError(
          "GATEWAY_TIMEOUT",
          "Permintaan melewati batas waktu pemrosesan server.",
          504,
        ));
      }, effectiveTimeoutMs);
      timeoutId.unref?.();
    });

    const response = await Promise.race([handler(), timeout]);
    if (timeoutId) clearTimeout(timeoutId);
    response.headers.set("x-request-id", requestId);

    // Simpan ke cache idempotensi untuk request mutasi (status non-GET).
    if (idempotencyKey) {
      try {
        const body = await response.clone().json();
        idempotencyCache.set(idempotencyKey, {
          status: response.status,
          body,
          expiresAt: now + IDEMPOTENCY_TTL_MS,
        });
      } catch {
        // Jika body tidak dapat di-parse, abaikan caching.
      }
    }

    return response;
  } catch (error) {
    return errorResponse(error, requestId);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
