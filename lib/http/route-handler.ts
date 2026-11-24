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
  let reservedIdempotencyKey: string | null = null;
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
    const key = cacheKey(idempotencyScope, idempotencyKey, sessionToken ?? undefined);
    const cached = await getIdempotencyStore().get(key);
    if (cached?.status === 102) {
      return new Response(JSON.stringify({
        error: {
          code: "IDEMPOTENCY_IN_PROGRESS",
          message: "Permintaan dengan kunci idempotensi ini sedang diproses.",
        },
      }), {
        status: 409,
        headers: {
          "content-type": "application/json",
          "x-request-id": requestId,
          "x-idempotent": "in-progress",
        },
      });
    }
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
    const reservation = await getIdempotencyStore().reserve(key, IDEMPOTENCY_TTL_MS);
    if (reservation === "capacity_exceeded") {
      return new Response(JSON.stringify({
        error: {
          code: "IDEMPOTENCY_CAPACITY",
          message: "Penyimpanan idempotensi sedang penuh. Coba kembali beberapa saat lagi.",
        },
      }), {
        status: 503,
        headers: {
          "content-type": "application/json",
          "retry-after": "60",
          "x-request-id": requestId,
        },
      });
    }
    if (reservation === "already_exists") {
      return new Response(JSON.stringify({
        error: {
          code: "IDEMPOTENCY_IN_PROGRESS",
          message: "Permintaan dengan kunci idempotensi ini sedang diproses.",
        },
      }), {
        status: 409,
        headers: {
          "content-type": "application/json",
          "x-request-id": requestId,
          "x-idempotent": "in-progress",
        },
      });
    }
    reservedIdempotencyKey = key;
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
      const key = cacheKey(idempotencyScope, idempotencyKey, sessionToken ?? undefined);
      let body: unknown;
      try {
        body = await response.clone().json();
      } catch {
        await getIdempotencyStore().del(key);
        reservedIdempotencyKey = null;
        return response;
      }
      await getIdempotencyStore().set(
        key,
        { status: response.status, body },
        IDEMPOTENCY_TTL_MS,
      );
      reservedIdempotencyKey = null;
    } else if (reservedIdempotencyKey) {
      await getIdempotencyStore().del(reservedIdempotencyKey);
      reservedIdempotencyKey = null;
    }

    return response;
  } catch (error) {
    if (
      reservedIdempotencyKey &&
      !(error instanceof ApiError && error.code === "GATEWAY_TIMEOUT")
    ) {
      await getIdempotencyStore().del(reservedIdempotencyKey);
    }
    return errorResponse(error, requestId);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
