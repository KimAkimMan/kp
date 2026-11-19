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
  /** Callback pelacak progres upload (hanya berlaku di browser untuk FormData). */
  onUploadProgress?: (loaded: number, total: number) => void;
};

export type RawApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

function getBaseUrl(baseUrl?: string) {
  return (baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/+$/, "");
}

function createUrl(
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"],
) {
  // `http://kp.local` adalah base URL dummy hanya untuk keperluan parsing
  // `URL` dan `URLSearchParams`. Ia tidak digunakan untuk kirim request aktual.
  const url = new URL(`${baseUrl}/${path.replace(/^\/+/, "")}`, "http://kp.local");
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  return baseUrl.startsWith("http://") || baseUrl.startsWith("https://")
    ? url.toString()
    : `${url.pathname}${url.search}`;
}

function validateQuery(query?: RequestOptions["query"]): void {
  if (!query) return;
  const page = query.page;
  const pageSize = query.pageSize;
  if (page !== undefined && page !== null) {
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1) {
      throw new ApiClientError(400, {
        code: "VALIDATION_ERROR",
        message: "Parameter page harus berupa bilangan bulat positif.",
      });
    }
  }
  if (pageSize !== undefined && pageSize !== null) {
    const ps = Number(pageSize);
    if (!Number.isInteger(ps) || ps < 1 || ps > 100) {
      throw new ApiClientError(400, {
        code: "VALIDATION_ERROR",
        message: "Parameter pageSize harus antara 1 sampai 100.",
      });
    }
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly accessToken?: string;
  private readonly fetcher: typeof fetch;
  private readonly defaultTimeout: number;
  // Menyimpan promise request read-only (GET/HEAD) yang sedang berlangsung
  // untuk mencegah duplikasi request yang sama ke backend.
  private readonly inflight = new Map<string, Promise<unknown>>();

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

  private requestKey(method: string, url: string): string {
    return `${method.toUpperCase()} ${url}`;
  }

  private async executeRequest<T>(
    path: string,
    options: RequestOptions,
  ): Promise<{ payload: T; response: Response }> {
    const { body, query, headers, signal, timeout, onUploadProgress, ...init } = options;

    const requestHeaders = new Headers(headers);
    if (body !== undefined && !(body instanceof FormData)) {
      requestHeaders.set("content-type", "application/json");
    }
    if (this.accessToken) requestHeaders.set("authorization", `Bearer ${this.accessToken}`);

    const url = createUrl(this.baseUrl, path, query);
    const method = (init.method ?? "GET").toUpperCase();

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
      if (onUploadProgress && body instanceof FormData && typeof XMLHttpRequest !== "undefined") {
        response = await this.uploadWithProgress(
          url,
          requestInit,
          onUploadProgress,
          combinedSignal,
        );
      } else {
        response = await this.fetcher(url, requestInit);
      }
    } catch (error) {
      if (this.isAbortError(error)) throw error;
      const canRetry = method === "GET" || method === "HEAD" || method === "OPTIONS";
      if (!canRetry) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
      response = await this.fetcher(url, requestInit);
    }

    const payload = await response.json().catch(() => undefined) as T;
    return { payload, response };
  }

  private async uploadWithProgress(
    url: string,
    requestInit: RequestInit,
    onProgress: (loaded: number, total: number) => void,
    signal: AbortSignal | undefined,
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = requestInit.method ?? "POST";
      xhr.open(method, url);
      if (requestInit.credentials === "include") {
        xhr.withCredentials = true;
      }
      if (requestInit.headers instanceof Headers) {
        requestInit.headers.forEach((value, key) => {
          xhr.setRequestHeader(key, value);
        });
      }
      if (signal) {
        signal.addEventListener("abort", () => {
          xhr.abort();
          reject(new DOMException("Aborted", "AbortError"));
        }, { once: true });
      }
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      });
      xhr.addEventListener("load", () => {
        const headers = new Headers();
        const headerLines = xhr.getAllResponseHeaders().split("\r\n");
        for (const line of headerLines) {
          const separator = line.indexOf(": ");
          if (separator > 0) {
            headers.append(line.slice(0, separator), line.slice(separator + 2));
          }
        }
        resolve(new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers,
        }));
      });
      xhr.addEventListener("error", () => reject(new Error("Network error")));
      xhr.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
      const body = requestInit.body as
        | string
        | FormData
        | URLSearchParams
        | Blob
        | null;
      xhr.send(body);
    });
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, query, headers, signal, timeout, onUploadProgress, ...init } = options;
    validateQuery(query);
    const method = (init.method ?? "GET").toUpperCase();

    if (method === "GET" || method === "HEAD") {
      const url = createUrl(this.baseUrl, path, query);
      const key = this.requestKey(method, url);
      const existing = this.inflight.get(key);
      if (existing) {
        return existing as Promise<T>;
      }
    }

    const result = await this.executeRequest<T>(path, { ...options, ...init } as RequestOptions);

    if (!result.response.ok) {
      const error = result.payload as ApiErrorPayload | undefined;
      throw new ApiClientError(result.response.status, error ?? {
        code: "UNKNOWN_API_ERROR",
        message: `Request gagal dengan status ${result.response.status}.`,
      });
    }

    if (method === "GET" || method === "HEAD") {
      const url = createUrl(this.baseUrl, path, query);
      const key = this.requestKey(method, url);
      this.inflight.delete(key);
    }

    return result.payload;
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

  /**
   * Sama seperti {@link request}, tetapi mengembalikan status HTTP dan header
   * respons tambahan. Cocok untuk kasus yang perlu mengetahui kode status
   * mentah (mis. 201 vs 200) atau header seperti `ETag`/`Location`.
   */
  async requestRaw<T>(path: string, options: RequestOptions = {}): Promise<RawApiResponse<T>> {
    const { body, query, headers, signal, timeout, onUploadProgress, ...init } = options;
    validateQuery(query);
    const result = await this.executeRequest<T>(path, { ...options, ...init } as RequestOptions);
    return {
      data: result.payload,
      status: result.response.status,
      statusText: result.response.statusText,
      headers: result.response.headers,
    };
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
