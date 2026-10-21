import { errorResponse } from "./api-response";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";

export async function handleRoute(
  handler: () => Promise<Response>,
): Promise<Response> {
  let requestId: string = randomUUID();
  try {
    requestId = (await headers()).get("x-request-id") ?? requestId;
  } catch {
    // Route unit tests can run without a Next request context.
  }
  try {
    const response = await handler();
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
