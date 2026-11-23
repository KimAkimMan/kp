import { nonNegativeNumber, parseJsonObject, requiredString, optionalNullableNumber } from "@/lib/validation";

export function parseConvertSurveyInput(body: unknown) {
  const input = parseJsonObject(body);
  return {
    kode: requiredString(input, "kode"),
    nama: input.nama === undefined ? undefined : requiredString(input, "nama"),
    periode: requiredString(input, "periode"),
    satuan: requiredString(input, "satuan"),
    target: nonNegativeNumber(input, "target") as number,
    pagu: input.pagu === undefined ? undefined : nonNegativeNumber(input, "pagu") as number | undefined,
    operatorPengelolaId: optionalNullableNumber(input, "operatorPengelolaId"),
  };
}
