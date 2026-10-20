import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/http/api-error";

const { state, serviceMethods, programActions, cookieStore } = vi.hoisted(() => ({
  state: {
    auth: "valid" as "none" | "wrong" | "valid",
    user: { id: 7, nama: "Penguji", email: "uji@example.com", role: "ADMIN" as const },
  },
  serviceMethods: {
    list: vi.fn(async () => ({ items: [{ id: "1" }], total: 1 })),
    get: vi.fn(async () => ({ id: 1 })),
    create: vi.fn(async (input: unknown) => input),
    update: vi.fn(async (_id: unknown, input: unknown) => input),
    remove: vi.fn(async () => ({ deleted: true })),
    verify: vi.fn(async () => ({ verified: true })),
    convertToProgram: vi.fn(async () => ({ id: 1 })),
    updateStatus: vi.fn(async () => ({ status: "SELESAI" })),
    assertCanEdit: vi.fn(async () => undefined),
  },
  programActions: {
    addProgress: vi.fn(async () => ({ id: 1 })),
    addCost: vi.fn(async () => ({ id: 1 })),
    markComplete: vi.fn(async () => ({ id: 1 })),
  },
  cookieStore: {
    value: undefined as string | undefined,
    set: vi.fn((_name: string, value: string) => { cookieStore.value = value; }),
    delete: vi.fn(() => { cookieStore.value = undefined; }),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => cookieStore.value === undefined ? undefined : { value: cookieStore.value },
    set: cookieStore.set,
    delete: cookieStore.delete,
  })),
}));

vi.mock("@/modules/auth/auth.context", () => ({
  SESSION_COOKIE: "kp_session",
  getSessionToken: vi.fn(async () => (state.auth === "valid" ? "valid-token" : state.auth === "wrong" ? "wrong-token" : null)),
  requireUser: vi.fn(async () => {
    if (state.auth === "none") throw new ApiError("UNAUTHENTICATED", "Silakan masuk terlebih dahulu.", 401);
    if (state.auth === "wrong") throw new ApiError("UNAUTHENTICATED", "Sesi sudah tidak berlaku.", 401);
    return state.user;
  }),
  requireRole: vi.fn(async () => {
    if (state.auth === "none") throw new ApiError("UNAUTHENTICATED", "Silakan masuk terlebih dahulu.", 401);
    if (state.auth === "wrong") throw new ApiError("UNAUTHENTICATED", "Sesi sudah tidak berlaku.", 401);
    return state.user;
  }),
}));

vi.mock("@/modules/auth/auth.service", () => ({
  authService: {
    login: vi.fn(async (input: { email: string; password: string }) => {
      if (input.email !== "uji@example.com" || input.password !== "rahasia") {
        throw new ApiError("INVALID_CREDENTIALS", "Email atau kata sandi tidak sesuai.", 401);
      }
      return { token: "valid-token", expiresAt: new Date("2026-12-31"), user: state.user };
    }),
    logout: vi.fn(async () => undefined),
  },
}));

vi.mock("@/modules/users/user.service", () => ({ userService: serviceMethods }));
vi.mock("@/modules/programs/program.service", () => ({ programService: serviceMethods }));
vi.mock("@/modules/programs/program.actions", () => ({
  programActions,
}));
vi.mock("@/modules/surveys/survey.service", () => ({ surveyService: serviceMethods }));
vi.mock("@/modules/advice/advice.service", () => ({ adviceService: serviceMethods }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    program: {
      findUnique: vi.fn(async () => ({ id: 1, operatorPengelolaId: null })),
      update: vi.fn(async () => ({ id: 1 })),
      count: vi.fn(async () => 1),
      groupBy: vi.fn(async () => []),
      aggregate: vi.fn(async () => ({ _sum: {} })),
    },
  },
}));

import * as loginRoute from "@/app/api/auth/login/route";
import * as logoutRoute from "@/app/api/auth/logout/route";
import * as meRoute from "@/app/api/auth/me/route";
import * as usersRoute from "@/app/api/users/route";
import * as userRoute from "@/app/api/users/[id]/route";
import * as programsRoute from "@/app/api/programs/route";
import * as programRoute from "@/app/api/programs/[id]/route";
import * as claimRoute from "@/app/api/programs/[id]/claim/route";
import * as progressRoute from "@/app/api/programs/[id]/progress/route";
import * as costsRoute from "@/app/api/programs/[id]/costs/route";
import * as completeRoute from "@/app/api/programs/[id]/complete/route";
import * as surveysRoute from "@/app/api/surveys/route";
import * as surveyRoute from "@/app/api/surveys/[id]/route";
import * as verifyRoute from "@/app/api/surveys/[id]/verify/route";
import * as convertRoute from "@/app/api/surveys/[id]/convert/route";
import * as adviceRoute from "@/app/api/advice/route";
import * as adviceItemRoute from "@/app/api/advice/[id]/route";
import * as reportRoute from "@/app/api/reports/summary/route";
import * as openapiRoute from "@/app/api/openapi/route";
import * as docsRoute from "@/app/api/docs/route";

const context = { params: Promise.resolve({ id: "1" }) };

function request(path: string, method: string, body?: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    ...(body === undefined ? {} : {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
}

async function json(response: Response) {
  return { status: response.status, body: await response.json() as Record<string, unknown> };
}

async function expectAuthFailure(handler: () => Promise<Response>, status = 401) {
  for (const auth of ["none", "wrong"] as const) {
    state.auth = auth;
    const response = await json(await handler());
    expect(response.status).toBe(status);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
  }
  state.auth = "valid";
}

describe("API route contracts", () => {
  beforeEach(() => {
    state.auth = "valid";
    vi.clearAllMocks();
  });

  it("returns explicit errors for missing, invalid, and valid login credentials", async () => {
    const missing = await json(await loginRoute.POST(request("/api/auth/login", "POST", {})));
    expect(missing.status).toBe(400);
    expect(missing.body.error).toMatchObject({ code: "VALIDATION_ERROR" });

    const invalid = await json(await loginRoute.POST(request("/api/auth/login", "POST", {
      email: "uji@example.com", password: "salah",
    })));
    expect(invalid.status).toBe(401);
    expect(invalid.body.error).toMatchObject({ code: "INVALID_CREDENTIALS" });

    const valid = await json(await loginRoute.POST(request("/api/auth/login", "POST", {
      email: "uji@example.com", password: "rahasia",
    })));
    expect(valid.status).toBe(200);
    expect(valid.body).toHaveProperty("data");
  });

  it("covers auth session endpoints and logout without a credential", async () => {
    await expectAuthFailure(() => meRoute.GET());
    state.auth = "valid";
    const me = await json(await meRoute.GET());
    expect(me.status).toBe(200);
    expect(me.body).toHaveProperty("data");

    state.auth = "none";
    const logout = await json(await logoutRoute.POST());
    expect(logout.status).toBe(200);
    expect(logout.body).toMatchObject({ data: { loggedOut: true } });
  });

  it("covers users, programs, surveys, advice, reports, and every protected action", async () => {
    const protectedHandlers: Array<() => Promise<Response>> = [
      () => usersRoute.GET(request("/api/users", "GET")),
      () => usersRoute.POST(request("/api/users", "POST", {})),
      () => userRoute.GET(request("/api/users/1", "GET"), context),
      () => userRoute.PATCH(request("/api/users/1", "PATCH", {}), context),
      () => userRoute.DELETE(request("/api/users/1", "DELETE"), context),
      () => programsRoute.GET(request("/api/programs", "GET")),
      () => programsRoute.POST(request("/api/programs", "POST", {})),
      () => programRoute.GET(request("/api/programs/1", "GET"), context),
      () => programRoute.PATCH(request("/api/programs/1", "PATCH", {}), context),
      () => programRoute.DELETE(request("/api/programs/1", "DELETE"), context),
      () => claimRoute.POST(request("/api/programs/1/claim", "POST"), context),
      () => progressRoute.POST(request("/api/programs/1/progress", "POST", {}), context),
      () => costsRoute.POST(request("/api/programs/1/costs", "POST", {}), context),
      () => completeRoute.POST(request("/api/programs/1/complete", "POST"), context),
      () => surveysRoute.GET(request("/api/surveys", "GET")),
      () => surveysRoute.POST(request("/api/surveys", "POST", {})),
      () => surveyRoute.GET(request("/api/surveys/1", "GET"), context),
      () => surveyRoute.PATCH(request("/api/surveys/1", "PATCH", {}), context),
      () => surveyRoute.DELETE(request("/api/surveys/1", "DELETE"), context),
      () => verifyRoute.POST(request("/api/surveys/1/verify", "POST", {}), context),
      () => convertRoute.POST(request("/api/surveys/1/convert", "POST", {}), context),
      () => adviceRoute.GET(request("/api/advice", "GET")),
      () => adviceRoute.POST(request("/api/advice", "POST", {})),
      () => adviceItemRoute.GET(request("/api/advice/1", "GET"), context),
      () => adviceItemRoute.PATCH(request("/api/advice/1", "PATCH", {}), context),
      () => adviceItemRoute.DELETE(request("/api/advice/1", "DELETE"), context),
      () => reportRoute.GET(request("/api/reports/summary", "GET")),
    ];

    for (const handler of protectedHandlers) {
      await expectAuthFailure(handler);
    }

    state.auth = "valid";
    const success = await json(await adviceRoute.GET(request("/api/advice", "GET")));
    expect(success.status).toBe(200);
    expect(success.body).toHaveProperty("data");

    const invalidBodies = [
      usersRoute.POST(request("/api/users", "POST", {})),
      programsRoute.POST(request("/api/programs", "POST", {})),
      surveysRoute.POST(request("/api/surveys", "POST", {})),
      adviceRoute.POST(request("/api/advice", "POST", {})),
      progressRoute.POST(request("/api/programs/1/progress", "POST", {}), context),
      costsRoute.POST(request("/api/programs/1/costs", "POST", {}), context),
      convertRoute.POST(request("/api/surveys/1/convert", "POST", {}), context),
    ];
    for (const responsePromise of invalidBodies) {
      const response = await json(await responsePromise);
      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    }

    const validBodies: Array<[Promise<Response>, number]> = [
      [usersRoute.POST(request("/api/users", "POST", {
        nama: "Operator Baru", email: "operator@example.com", role: "Operator", password: "rahasia",
      })), 201],
      [userRoute.PATCH(request("/api/users/1", "PATCH", { nama: "Operator Diperbarui" }), context), 200],
      [programsRoute.POST(request("/api/programs", "POST", {
        kode: "P-001", nama: "Jalan Desa", kategori: "Infrastruktur", lokasi: "Desa A",
        pj: "Penguji", periode: "2026", satuan: "KM", target: 10, pagu: 100000,
      })), 201],
      [programRoute.PATCH(request("/api/programs/1", "PATCH", { nama: "Jalan Diperbarui" }), context), 200],
      [progressRoute.POST(request("/api/programs/1/progress", "POST", {
        tanggal: "2026-10-20", tahap: "Persiapan", nilai: 2, satuan: "KM",
        keterangan: "Selesai", status: "SEDANG_DIKERJAKAN",
      }), context), 201],
      [costsRoute.POST(request("/api/programs/1/costs", "POST", {
        tanggal: "2026-10-20", uraian: "Material", nominal: 500,
      }), context), 201],
      [completeRoute.POST(request("/api/programs/1/complete", "POST"), context), 200],
      [surveysRoute.POST(request("/api/surveys", "POST", {
        kodeSurvey: "S-001", tanggal: "2026-10-20", surveyor: "Penguji",
        namaKegiatan: "Jalan Desa", kategori: "Infrastruktur", kecamatan: "Kecamatan A",
        desaKelurahan: "Desa A", detailLokasi: "Lokasi A", kondisi: "BAIK",
        tingkatUrgensi: "RENDAH", uraianTemuan: "Baik", rekomendasi: "Lanjutkan",
        status: "DRAFT",
      })), 201],
      [surveyRoute.PATCH(request("/api/surveys/1", "PATCH", { status: "DIVERIFIKASI" }), context), 200],
      [verifyRoute.POST(request("/api/surveys/1/verify", "POST", {}), context), 200],
      [convertRoute.POST(request("/api/surveys/1/convert", "POST", {
        kode: "P-002", pj: "Penguji", periode: "2026", satuan: "KM", target: 1, pagu: 1000,
      }), context), 201],
      [adviceRoute.POST(request("/api/advice", "POST", {
        idKegiatan: 1, namaKegiatan: "Jalan Desa", identitasPimpinan: "Penguji",
        pimpinanId: 7, operatorPenerima: "Operator", isi: "Lanjutkan",
      })), 201],
      [adviceItemRoute.PATCH(request("/api/advice/1", "PATCH", { status: "DIBACA" }), context), 200],
    ];
    for (const [responsePromise, expectedStatus] of validBodies) {
      const response = await json(await responsePromise);
      expect(response.status).toBe(expectedStatus);
      expect(response.body).toHaveProperty("data");
      expect(response.body).not.toHaveProperty("error");
    }

    const validReadDeleteHandlers: Array<[Promise<Response>, number]> = [
      [userRoute.GET(request("/api/users/1", "GET"), context), 200],
      [userRoute.DELETE(request("/api/users/1", "DELETE"), context), 200],
      [programRoute.GET(request("/api/programs/1", "GET"), context), 200],
      [programRoute.DELETE(request("/api/programs/1", "DELETE"), context), 200],
      [claimRoute.POST(request("/api/programs/1/claim", "POST"), context), 200],
      [surveyRoute.GET(request("/api/surveys/1", "GET"), context), 200],
      [surveyRoute.DELETE(request("/api/surveys/1", "DELETE"), context), 200],
      [adviceItemRoute.GET(request("/api/advice/1", "GET"), context), 200],
      [adviceItemRoute.DELETE(request("/api/advice/1", "DELETE"), context), 200],
    ];
    for (const [responsePromise, expectedStatus] of validReadDeleteHandlers) {
      const response = await json(await responsePromise);
      expect(response.status).toBe(expectedStatus);
      expect(response.body).toHaveProperty("data");
    }

    for (const handler of [
      () => usersRoute.GET(request("/api/users", "GET")),
      () => programsRoute.GET(request("/api/programs", "GET")),
      () => surveysRoute.GET(request("/api/surveys", "GET")),
      () => adviceRoute.GET(request("/api/advice", "GET")),
      () => reportRoute.GET(request("/api/reports/summary", "GET")),
    ]) {
      const response = await json(await handler());
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
    }
  });

  it("serves OpenAPI JSON and Swagger HTML without authentication", async () => {
    const specification = await json(await openapiRoute.GET());
    expect(specification.status).toBe(200);
    expect(specification.body).toHaveProperty("openapi", "3.1.0");
    expect(specification.body).toHaveProperty("paths");

    const docs = await docsRoute.GET();
    expect(docs.status).toBe(200);
    expect(docs.headers.get("content-type")).toContain("text/html");
    expect(await docs.text()).toContain("SwaggerUIBundle");
  });
});
