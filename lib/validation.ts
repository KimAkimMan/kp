import { ApiError } from "./http/api-error";

export function parseJsonObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Body request harus berupa object JSON.",
      400,
    );
  }

  return value as Record<string, unknown>;
}

export function requiredString(
  input: Record<string, unknown>,
  field: string,
): string {
  const value = input[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Field ${field} wajib berupa teks dan tidak boleh kosong.`,
      400,
    );
  }

  return value.trim();
}

export function optionalString(
  input: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = input[field];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Field ${field} harus berupa teks.`,
      400,
    );
  }

  return value.trim();
}

export function nonNegativeNumber(
  input: Record<string, unknown>,
  field: string,
  required = true,
): number | undefined {
  const value = input[field];
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new ApiError(
        "VALIDATION_ERROR",
        `Field ${field} wajib berupa angka.`,
        400,
      );
    }
    return undefined;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Field ${field} harus berupa angka nol atau lebih.`,
      400,
    );
  }

  return value;
}

export function positiveIntegerParam(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Parameter ${field} harus berupa bilangan bulat positif.`,
      400,
    );
  }

  return parsed;
}
