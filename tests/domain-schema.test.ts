import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/http/api-error";
import { parseProgressInput, parseCostInput } from "@/modules/programs/program.action.schema";
import { parseCreateAdviceInput } from "@/modules/advice/advice.schema";
import { parseSurveyInput } from "@/modules/surveys/survey.schema";
import { openapiDocument } from "@/lib/openapi";

describe("domain schemas and OpenAPI", () => {
  it("parses progress and costs", () => {
    expect(parseProgressInput({
      tanggal: "2026-10-20",
      tahap: "Persiapan",
      nilai: 2,
      satuan: "KM",
      keterangan: "Selesai",
      status: "SEDANG_DIKERJAKAN",
    }).nilai).toBe(2);
    expect(parseCostInput({
      tanggal: "2026-10-20",
      uraian: "Material",
      nominal: 500,
    }).nominal).toBe(500);
  });

  it("rejects invalid survey and advice payloads", () => {
    expect(() => parseSurveyInput({ kodeSurvey: "S-1" })).toThrowError(ApiError);
    expect(() => parseCreateAdviceInput({
      idKegiatan: 0,
      pimpinanId: 1,
    })).toThrowError(ApiError);
  });

  it("documents every public API group", () => {
    expect(Object.keys(openapiDocument.paths)).toEqual(expect.arrayContaining([
      "/auth/login",
      "/users",
      "/programs/{id}/progress",
      "/surveys/{id}/convert",
      "/advice/{id}",
      "/reports/summary",
    ]));
    expect(openapiDocument.openapi).toBe("3.1.0");
  });
});
