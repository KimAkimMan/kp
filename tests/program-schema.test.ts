import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/http/api-error";
import {
  parseCreateProgramInput,
  parseProgramListFilters,
  parseUpdateProgramInput,
} from "@/modules/programs/program.schema";

describe("program schemas", () => {
  it("parses create program input", () => {
    expect(parseCreateProgramInput({
      kode: "PKP-001",
      nama: "Jalan Desa",
      kategori: "Jalan",
      lokasi: "Ciawigebang",
      pj: "Operator",
      periode: "2026",
      satuan: "KM",
      target: 5,
      pagu: 1000,
    })).toMatchObject({ kode: "PKP-001", target: 5, pagu: 1000 });
  });

  it("rejects invalid program status and filters", () => {
    expect(() => parseUpdateProgramInput({ status: "INVALID" })).toThrowError(ApiError);
    expect(parseProgramListFilters(new URLSearchParams("status=SEDANG_DIKERJAKAN&search=jalan")))
      .toEqual({ status: "SEDANG_DIKERJAKAN", search: "jalan", operatorId: undefined, kecamatan: undefined });
  });
});
