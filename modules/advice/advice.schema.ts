import { parseJsonObject, requiredString } from "@/lib/validation";
import { ApiError } from "@/lib/http/api-error";
import type { AdviceStatus } from "@/generated/prisma/client";

const adviceStatuses = [
  "BELUM_DITINDAKLANJUTI",
  "SUDAH_DITINDAKLANJUTI",
] as const;

export function parseCreateAdviceInput(body: unknown) {
  const input = parseJsonObject(body);
  const idKegiatan = Number(input.idKegiatan);
  const pimpinanId = Number(input.pimpinanId);
  if (!Number.isSafeInteger(idKegiatan) || idKegiatan < 1 || !Number.isSafeInteger(pimpinanId) || pimpinanId < 1) {
    throw new ApiError("VALIDATION_ERROR", "Program dan pimpinan harus valid.", 400);
  }
  const operatorId = input.operatorId === undefined || input.operatorId === null ? null : Number(input.operatorId);
  if (operatorId !== null && (!Number.isSafeInteger(operatorId) || operatorId < 1)) {
    throw new ApiError("VALIDATION_ERROR", "Operator harus valid.", 400);
  }
  return {
    idKegiatan,
    namaKegiatan: requiredString(input, "namaKegiatan"),
    identitasPimpinan: requiredString(input, "identitasPimpinan"),
    pimpinanId,
    operatorPenerima: requiredString(input, "operatorPenerima"),
    operatorId,
    isi: requiredString(input, "isi"),
  };
}

export function parseAdviceStatusInput(body: unknown) {
  const input = parseJsonObject(body);
  const status = requiredString(input, "status");
  if (!adviceStatuses.includes(status as (typeof adviceStatuses)[number])) {
    throw new ApiError("VALIDATION_ERROR", "Status arahan tidak valid.", 400);
  }
  return { status: status as AdviceStatus };
}
