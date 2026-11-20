import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

import { handleRoute } from "@/lib/http/route-handler";

describe("handleRoute", () => {
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
});
