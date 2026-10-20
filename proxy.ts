import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  if (!MUTATING_METHODS.has(request.method)) return response;

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

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
