import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

const headersState = vi.hoisted(() => ({
  headers: new Map<string, string>(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => {
    const h = new Headers();
    headersState.headers.forEach((value, key) => h.set(key, value));
    return h;
  }),
}));

import { handleRoute } from "@/lib/http/route-handler";

function setHeader(key: string, value: string | null) {
  if (value === null) {
    headersState.headers.delete(key);
  } else {
    headersState.headers.set(key, value);
  }
}

describe("handleRoute", () => {
  beforeEach(() => {
    headersState.headers.clear();
  });

  it("returns a structured gateway timeout response", async () => {
    const response = await handleRoute(
      () => new Promise<Response>((resolve) => {
        setTimeout(() => resolve(NextResponse.json({ data: "late" })), 50);
      }),
      5,
    );

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "GATEWAY_TIMEOUT",
        message: "Permintaan melewati batas waktu pemrosesan server.",
      },
    });
  });

  it("preserves successful route responses", async () => {
    const response = await handleRoute(
      () => Promise.resolve(NextResponse.json({ data: { id: 1 } })),
      100,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { id: 1 } });
  });

  it("replays cached response for same idempotency key and scope", async () => {
    setHeader("Idempotency-Key", "kunci-uji-1");
    const first = await handleRoute(
      () => Promise.resolve(NextResponse.json({ data: { id: 1 } }, { status: 201 })),
      100,
      { idempotencyScope: { method: "POST", path: "/api/programs" } },
    );
    expect(first.status).toBe(201);
    expect(first.headers.get("x-idempotent")).toBeNull();

    const replay = await handleRoute(
      () => Promise.resolve(NextResponse.json({ data: { id: 999 } }, { status: 200 })),
      100,
      { idempotencyScope: { method: "POST", path: "/api/programs" } },
    );
    expect(replay.status).toBe(201);
    await expect(replay.json()).resolves.toEqual({ data: { id: 1 } });
    expect(replay.headers.get("x-idempotent")).toBe("replayed");
  });

  it("does not replay across different route scopes with the same key", async () => {
    setHeader("Idempotency-Key", "kunci-uji-2");
    const first = await handleRoute(
      () => Promise.resolve(NextResponse.json({ data: { id: 1 } }, { status: 201 })),
      100,
      { idempotencyScope: { method: "POST", path: "/api/programs" } },
    );
    expect(first.status).toBe(201);

    const other = await handleRoute(
      () => Promise.resolve(NextResponse.json({ data: { id: 2 } }, { status: 200 })),
      100,
      { idempotencyScope: { method: "PATCH", path: "/api/programs/[id]" } },
    );
    expect(other.status).toBe(200);
    await expect(other.json()).resolves.toEqual({ data: { id: 2 } });
    expect(other.headers.get("x-idempotent")).toBeNull();
  });

  it("does not cache read-only GET requests", async () => {
    setHeader("Idempotency-Key", "kunci-uji-3");
    const first = await handleRoute(
      () => Promise.resolve(NextResponse.json({ data: { id: 1 } })),
      100,
      { idempotencyScope: { method: "GET", path: "/api/programs" } },
    );
    expect(first.status).toBe(200);

    const second = await handleRoute(
      () => Promise.resolve(NextResponse.json({ data: { id: 2 } })),
      100,
      { idempotencyScope: { method: "GET", path: "/api/programs" } },
    );
    expect(second.status).toBe(200);
    await expect(second.json()).resolves.toEqual({ data: { id: 2 } });
    expect(second.headers.get("x-idempotent")).toBeNull();
  });
});
