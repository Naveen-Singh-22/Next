type RateLimitState = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __tchRateLimitStore?: Map<string, RateLimitState>;
};

const rateLimitStore = globalForRateLimit.__tchRateLimitStore ?? new Map<string, RateLimitState>();

if (!globalForRateLimit.__tchRateLimitStore) {
  globalForRateLimit.__tchRateLimitStore = rateLimitStore;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
  };
}