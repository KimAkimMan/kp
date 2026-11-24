export interface IdempotencyStore {
  get(key: string): Promise<{ status: number; body: unknown } | null>;
  reserve(
    key: string,
    ttlMs: number,
  ): Promise<"reserved" | "already_exists" | "capacity_exceeded">;
  set(key: string, value: { status: number; body: unknown }, ttlMs: number): Promise<void>;
  del(key: string): Promise<void>;
  cleanup(): Promise<void>;
}

const MAX_IDEMPOTENCY_ENTRIES = 10_000;
const CLEANUP_INTERVAL_MS = 60_000;

export class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly map = new Map<string, {
    status: number;
    body: unknown;
    expiresAt: number;
  }>();
  private lastCleanupAt = 0;

  async get(key: string) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return { status: entry.status, body: entry.body };
  }

  async reserve(key: string, ttlMs: number) {
    const now = Date.now();
    const existing = this.map.get(key);
    if (existing && existing.expiresAt > now) return "already_exists";
    if (existing) this.map.delete(key);

    if (this.map.size >= MAX_IDEMPOTENCY_ENTRIES) {
      this.cleanupExpired(now);
      if (this.map.size >= MAX_IDEMPOTENCY_ENTRIES) return "capacity_exceeded";
    }

    this.map.set(key, { status: 102, body: null, expiresAt: now + ttlMs });
    return "reserved";
  }

  async set(key: string, value: { status: number; body: unknown }, ttlMs: number) {
    this.map.set(key, { ...value, expiresAt: Date.now() + ttlMs });
  }

  async del(key: string) {
    this.map.delete(key);
  }

  async cleanup() {
    const now = Date.now();
    if (now - this.lastCleanupAt < CLEANUP_INTERVAL_MS) return;
    this.cleanupExpired(now);
  }

  private cleanupExpired(now: number) {
    for (const [key, entry] of this.map.entries()) {
      if (now >= entry.expiresAt) this.map.delete(key);
    }
    this.lastCleanupAt = now;
  }
}

let sharedStore: IdempotencyStore = new MemoryIdempotencyStore();

export function getIdempotencyStore(): IdempotencyStore {
  return sharedStore;
}

export function setIdempotencyStore(store: IdempotencyStore) {
  sharedStore = store;
}

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
