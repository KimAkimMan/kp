import { ApiError } from "./api-error";

export async function parseRequestBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(
      "INVALID_JSON",
      "Body request harus berupa JSON yang valid.",
      400,
    );
  }
}

export function parsePositiveId(value: string, field = "id"): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Parameter ${field} harus berupa bilangan bulat positif.`,
      400,
    );
  }
  return parsed;
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 25);

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Parameter page harus positif dan pageSize harus antara 1 sampai 100.",
      400,
    );
  }

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function parseOptionalBoolean(
  value: string | null,
  field: string,
): boolean | undefined {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ApiError(
    "VALIDATION_ERROR",
    `Parameter ${field} harus bernilai true atau false.`,
    400,
  );
}
