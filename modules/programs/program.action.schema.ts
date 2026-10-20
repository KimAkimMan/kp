import { ApiError } from "@/lib/http/api-error";
import { nonNegativeNumber, optionalString, parseJsonObject, requiredString } from "@/lib/validation";
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
  const foto = optionalString(input, "foto");
  if (foto !== undefined && foto !== "true" && foto !== "false") {
    throw new ApiError("VALIDATION_ERROR", "Field foto harus boolean.", 400);
  }
  return { foto: foto === "true" };
}
