import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function setCorsHeaders(response: NextResponse, origin: string) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id");
  response.headers.set("Vary", "Origin");
}

export function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-request-id", requestId);

  const origin = request.headers.get("origin");
  if (!origin) return response;

  const configuredOrigin = process.env.APP_ORIGIN ?? request.nextUrl.origin;
  if (origin !== configuredOrigin) {
    return NextResponse.json(
      {
        error: {
          code: "CSRF_ORIGIN_MISMATCH",
          message: "Origin request tidak diizinkan.",
        },
      },
      { status: 403, headers: { "x-request-id": requestId } },
    );
  }

  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set("x-request-id", requestId);
    setCorsHeaders(preflight, origin);
    return preflight;
  }

  setCorsHeaders(response, origin);
  if (!MUTATING_METHODS.has(request.method)) return response;

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
