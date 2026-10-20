import {
  nonNegativeNumber,
  parseJsonObject,
  requiredString,
} from "@/lib/validation";
import type { CreateProgramInput } from "./program.types";

export function parseCreateProgramInput(body: unknown): CreateProgramInput {
  const input = parseJsonObject(body);
  return {
    kode: requiredString(input, "kode"),
    nama: requiredString(input, "nama"),
    kategori: requiredString(input, "kategori"),
    lokasi: requiredString(input, "lokasi"),
    pj: requiredString(input, "pj"),
    periode: requiredString(input, "periode"),
    satuan: requiredString(input, "satuan"),
    target: nonNegativeNumber(input, "target") as number,
    pagu: nonNegativeNumber(input, "pagu") as number,
  };
}
