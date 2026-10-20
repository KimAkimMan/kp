import { nonNegativeNumber, parseJsonObject, requiredString } from "@/lib/validation";

export function parseConvertSurveyInput(body: unknown) {
  const input = parseJsonObject(body);
  return {
    kode: requiredString(input, "kode"),
    nama: input.nama === undefined ? undefined : requiredString(input, "nama"),
    pj: requiredString(input, "pj"),
    periode: requiredString(input, "periode"),
    satuan: requiredString(input, "satuan"),
    target: nonNegativeNumber(input, "target") as number,
    pagu: nonNegativeNumber(input, "pagu") as number,
  };
}
