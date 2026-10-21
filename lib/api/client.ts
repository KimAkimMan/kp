export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
};

export type ApiResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    page: number;
    pageSize: number;
    skip: number;
    total: number;
    totalPages: number;
  };
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(status: number, error: ApiErrorPayload) {
    super(error.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = error.code;
    this.details = error.details;
    this.requestId = error.requestId;
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
  accessToken?: string;
  fetcher?: typeof fetch;
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
};

function getBaseUrl(baseUrl?: string) {
  return (baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/+$/, "");
}

function createUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
) {
  const url = new URL(`${baseUrl}/${path.replace(/^\/+/, "")}`, "http://kp.local");
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  return baseUrl.startsWith("http://") || baseUrl.startsWith("https://")
    ? url.toString()
    : `${url.pathname}${url.search}`;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly accessToken?: string;
  private readonly fetcher: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = getBaseUrl(options.baseUrl);
    this.accessToken = options.accessToken;
    this.fetcher = options.fetcher ?? fetch;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, query, headers, ...init } = options;
    const requestHeaders = new Headers(headers);
    if (body !== undefined) requestHeaders.set("content-type", "application/json");
    if (this.accessToken) requestHeaders.set("authorization", `Bearer ${this.accessToken}`);

    const response = await this.fetcher(createUrl(this.baseUrl, path, query), {
      ...init,
      credentials: init.credentials ?? "include",
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await response.json().catch(() => undefined);
    if (!response.ok) {
      const error = payload?.error as ApiErrorPayload | undefined;
      throw new ApiClientError(response.status, error ?? {
        code: "UNKNOWN_API_ERROR",
        message: `Request gagal dengan status ${response.status}.`,
      });
    }

    return payload as T;
  }

  get<T>(path: string, query?: RequestOptions["query"]) {
    return this.request<T>(path, { method: "GET", query });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "POST", body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PATCH", body });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
