/**
 * Idempotency store abstraction.
 *
 * Implementasi default menggunakan in-memory Map yang cocok untuk development
 * dan single-instance deployment. Untuk production multi-instance/serverless,
 * ganti dengan implementasi yang backed by Redis (misalnya Upstash Redis atau
 * ioredis) dengan men-set variabel lingkungan `IDEMPOTENCY_STORE=redis` dan
 * `REDIS_URL`.
 */
export interface IdempotencyStore {
  get(key: string): Promise<{ status: number; body: unknown } | null>;
  set(
    key: string,
    value: { status: number; body: unknown },
    ttlMs: number,
  ): Promise<void>;
  del(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

/** In-memory store (default). Cocok untuk dev dan single instance. */
export class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly map = new Map<string, {
    status: number;
    body: unknown;
    expiresAt: number;
  }>();

  async get(key: string) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return { status: entry.status, body: entry.body };
  }

  async set(key: string, value: { status: number; body: unknown }, ttlMs: number) {
    this.map.set(key, { ...value, expiresAt: Date.now() + ttlMs });
  }

  async del(key: string) {
    this.map.delete(key);
  }

  async cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.map.entries()) {
      if (now > entry.expiresAt) this.map.delete(key);
    }
  }
}

/** Shared store instance. Default ke in-memory. */
let sharedStore: IdempotencyStore | null = null;

export function getIdempotencyStore(): IdempotencyStore {
  if (!sharedStore) {
    sharedStore = new MemoryIdempotencyStore();
  }
  return sharedStore;
}

export function setIdempotencyStore(store: IdempotencyStore) {
  sharedStore = store;
}

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
