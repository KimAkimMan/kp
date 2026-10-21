import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(async () => [{ 1: 1 }]),
  },
}));

import * as healthRoute from "@/app/api/health/route";
import * as readyRoute from "@/app/api/ready/route";

describe("health routes", () => {
  beforeEach(() => {
    process.env.DATABASE_HOST = "localhost";
    process.env.DATABASE_USER = "test";
    process.env.DATABASE_NAME = "test";
    process.env.DATABASE_PORT = "3306";
    process.env.JWT_SECRET = "a".repeat(32);
    process.env.APP_ORIGIN = "http://localhost:3000";
  });

  it("reports application health", async () => {
    const response = await healthRoute.GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(await response.json()).toMatchObject({ data: { status: "ok" } });
  });

  it("reports database readiness", async () => {
    const response = await readyRoute.GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      data: { status: "ready", database: "up" },
    });
  });

  it("returns 503 when required configuration is missing", async () => {
    delete process.env.APP_ORIGIN;
    const response = await readyRoute.GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: { code: "CONFIGURATION_ERROR" },
    });
  });
});
