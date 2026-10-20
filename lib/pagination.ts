import { ApiError } from "@/lib/http/api-error";

export const paginationConfig = {
  defaultPage: 1,
  defaultPageSize: 25,
  maxPageSize: 100,
} as const;

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
};

export type PaginationMeta = Pagination & {
  total: number;
  totalPages: number;
};

export function parsePagination(searchParams: URLSearchParams): Pagination {
  const page = Number(searchParams.get("page") ?? paginationConfig.defaultPage);
  const pageSize = Number(
    searchParams.get("pageSize") ?? paginationConfig.defaultPageSize,
  );

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > paginationConfig.maxPageSize
  ) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Parameter page harus positif dan pageSize harus antara 1 sampai ${paginationConfig.maxPageSize}.`,
      400,
    );
  }

  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function createPaginationMeta(
  pagination: Pagination,
  total: number,
): PaginationMeta {
  return {
    ...pagination,
    total,
    totalPages: Math.ceil(total / pagination.pageSize),
  };
}
