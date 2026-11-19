import { errorResponse } from "./api-response";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { ApiError } from "./api-error";

export const DEFAULT_ROUTE_TIMEOUT_MS = 30_000;

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
    return response;
  } catch (error) {
    return errorResponse(error, requestId);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
