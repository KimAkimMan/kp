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
  timeout?: number;
};

export type RequestOptions = Omit<RequestInit, "body" | "signal"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  timeout?: number;
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
  private readonly defaultTimeout: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = getBaseUrl(options.baseUrl);
    this.accessToken = options.accessToken;
    // Keep the native fetch receiver intact in browsers. Calling a detached
    // `window.fetch` function can throw an "Illegal invocation" TypeError.
    this.fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
    this.defaultTimeout = options.timeout ?? 30_000;
  }

  private createAbortController(timeout?: number): AbortController {
    const controller = new AbortController();
    const ms = timeout ?? this.defaultTimeout;
    const timer = setTimeout(() => controller.abort(), ms);
    // Jangan biarkan timer mencegah Node.js keluar dari event loop.
    timer.unref?.();
    return controller;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
      const { body, query, headers, signal, timeout, ...init } = options;
      const requestHeaders = new Headers(headers);
      // Don't set content-type for FormData - browser will set with boundary
      if (body !== undefined && !(body instanceof FormData)) {
        requestHeaders.set("content-type", "application/json");
      }
      if (this.accessToken) requestHeaders.set("authorization", `Bearer ${this.accessToken}`);

      const url = createUrl(this.baseUrl, path, query);

      // Gabungkan signal eksternal dengan timeout internal: jika salah satu
      // membatalkan, request dibatalkan.
      const controller = this.createAbortController(timeout);
      const combinedSignal = this.combineSignals(signal, controller.signal);

      const requestInit: RequestInit = {
        ...init,
        credentials: init.credentials ?? "include",
        headers: requestHeaders,
        body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
        signal: combinedSignal,
      };

      let response: Response;
      try {
        response = await this.fetcher(url, requestInit);
      } catch (error) {
        // Jika error disebabkan oleh abort (timeout atau signal eksternal),
        // jangan pernah mencoba retry — bahkan untuk GET.
        if (this.isAbortError(error)) throw error;

        const method = (init.method ?? "GET").toUpperCase();
        const canRetry = method === "GET" || method === "HEAD" || method === "OPTIONS";
        if (!canRetry) throw error;

        // A dev-server rebuild or Fast Refresh can briefly interrupt a read
        // request. Retry reads once without ever replaying mutations.
        await new Promise((resolve) => setTimeout(resolve, 150));
        response = await this.fetcher(url, requestInit);
      }

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

  private combineSignals(
    external: AbortSignal | undefined,
    internal: AbortSignal,
  ): AbortSignal | undefined {
    if (!external) return internal;
    if (external.aborted || internal.aborted) {
      // Buat controller baru yang langsung diabort agar signal sudah terminal.
      const merged = new AbortController();
      merged.abort();
      return merged.signal;
    }
    const merged = new AbortController();
    const abort = () => merged.abort();
    external.addEventListener("abort", abort, { once: true });
    internal.addEventListener("abort", abort, { once: true });
    return merged.signal;
  }

  private isAbortError(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    if (error instanceof Error && error.name === "AbortError") return true;
    return false;
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
