import { errorResponse } from "./api-response";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { ApiError } from "./api-error";
import { getSessionToken } from "@/modules/auth/auth.context";
import {
  getIdempotencyStore,
  IDEMPOTENCY_TTL_MS,
} from "@/lib/idempotency-store";

export const DEFAULT_ROUTE_TIMEOUT_MS = 30_000;

// Metode yang dimutasi dan layak disimpan ke cache idempotensi.
const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

type IdempotencyScope = { method: string; path: string };

async function getIdempotencyKey(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("Idempotency-Key") ?? null;
  } catch {
    return null;
  }
}

function cacheKey(
  scope: IdempotencyScope | undefined,
  key: string,
  sessionToken?: string,
): string {
  if (!scope) return key;
  return `${scope.method.toUpperCase()}|${scope.path}|${
    sessionToken ?? "anon"
  }|${key}`;
}

export async function handleRoute(
  handler: () => Promise<Response>,
  timeoutMs = DEFAULT_ROUTE_TIMEOUT_MS,
  options: { idempotencyScope?: IdempotencyScope } = {},
): Promise<Response> {
  const effectiveTimeoutMs =
    Number.isFinite(timeoutMs) && timeoutMs > 0
      ? timeoutMs
      : DEFAULT_ROUTE_TIMEOUT_MS;
  let requestId: string = randomUUID();
  try {
    requestId = (await headers()).get("x-request-id") ?? requestId;
  } catch {
    // Route unit tests can run without a Next request context.
  }

  let sessionToken: string | null = null;
  try {
    sessionToken = await getSessionToken();
  } catch {
    // Tidak ada konteks request (unit tests).
  }

  // Bersihkan entri kadaluarsa sebelum pemeriksaan.
  const now = Date.now();
  await getIdempotencyStore().cleanup();

  const idempotencyKey = await getIdempotencyKey();
  const { idempotencyScope } = options;

  // Jika kunci idempotensi sudah diproses sebelumnya, kembalikan cache.
  // Hanya berlaku untuk request mutasi dengan scope yang ditetapkan, sehingga
  // kunci pada endpoint yang berbeda tidak saling bentrok.
  if (
    idempotencyKey &&
    idempotencyScope &&
    MUTATION_METHODS.has(idempotencyScope.method.toUpperCase())
  ) {
    const cached = await getIdempotencyStore().get(
      cacheKey(idempotencyScope, idempotencyKey, sessionToken ?? undefined),
    );
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
        reject(
          new ApiError(
            "GATEWAY_TIMEOUT",
            "Permintaan melewati batas waktu pemrosesan server.",
            504,
          ),
        );
      }, effectiveTimeoutMs);
      timeoutId.unref?.();
    });

    // Catatan: Promise.race tidak benar-benar membatalkan eksekusi handler di
    // background setelah timeout. Handler tetap berjalan sampai selesai, tetapi
    // responsnya akan dibuang dan klien menerima 504. Untuk pembatalan sebenarnya
    // membutuhkan AbortController yang di-support handler secara eksklusif.
    const response = await Promise.race([handler(), timeout]);
    if (timeoutId) clearTimeout(timeoutId);
    response.headers.set("x-request-id", requestId);

    // Simpan ke cache idempotensi HANYA jika response sukses (2xx).
    // Jangan cache error response agar client bisa retry dengan aman.
    if (
      idempotencyKey &&
      idempotencyScope &&
      MUTATION_METHODS.has(idempotencyScope.method.toUpperCase()) &&
      response.status >= 200 &&
      response.status < 300
    ) {
      try {
        const body = await response.clone().json();
        await getIdempotencyStore().set(
          cacheKey(idempotencyScope, idempotencyKey, sessionToken ?? undefined),
          { status: response.status, body },
          IDEMPOTENCY_TTL_MS,
        );
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
