import { ApiError } from "@/lib/http/api-error";
import { nonNegativeNumber, parseJsonObject, requiredString } from "@/lib/validation";
import type { CreateCostInput, CreateProgressInput } from "./program.actions";

export function parseProgressInput(body: unknown): CreateProgressInput {
  const input = parseJsonObject(body);
  const status = requiredString(input, "status");
  if (!["BELUM_DIKERJAKAN", "SEDANG_DIKERJAKAN", "SELESAI_DIKERJAKAN"].includes(status)) {
    throw new ApiError("VALIDATION_ERROR", "Status progres tidak valid.", 400);
  }
  return {
    tanggal: requiredString(input, "tanggal"),
    tahap: requiredString(input, "tahap"),
    nilai: nonNegativeNumber(input, "nilai") as number,
    satuan: requiredString(input, "satuan"),
    keterangan: requiredString(input, "keterangan"),
    foto: input.foto === undefined ? false : input.foto === true,
    storageKey: typeof input.storageKey === "string" ? input.storageKey : null,
    originalName: typeof input.originalName === "string" ? input.originalName : null,
    status: status as CreateProgressInput["status"],
  };
}

export function parseCostInput(body: unknown): CreateCostInput {
  const input = parseJsonObject(body);
  return {
    tanggal: requiredString(input, "tanggal"),
    uraian: requiredString(input, "uraian"),
    nominal: nonNegativeNumber(input, "nominal") as number,
    bukti: input.bukti === undefined ? false : input.bukti === true,
  };
}

export function parseCompletionInput(body: unknown): { foto: boolean } {
  const input = parseJsonObject(body);
  if (input.foto !== undefined && typeof input.foto !== "boolean") {
    throw new ApiError("VALIDATION_ERROR", "Field foto harus boolean.", 400);
  }
  return { foto: input.foto === true };
}
