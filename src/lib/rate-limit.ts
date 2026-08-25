/**
 * Minimal in-memory rate limiter for the public form endpoints.
 *
 * Scope and honesty about it: this is a per-instance Map. On a single server
 * or a warm serverless instance it stops the obvious case — someone holding
 * down submit, or a crude script hammering /api/contact. It does NOT hold
 * across instances or cold starts, so it is a speed bump rather than a
 * guarantee. If inbound spam becomes a real problem, move this to Redis
 * (Upstash) behind the same `limit()` signature and nothing else changes.
 *
 * It is paired with a honeypot field on every public form, which catches more
 * naive bots than rate limiting does.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Drop expired buckets so a long-lived instance does not grow unbounded. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function limit(key: string, max = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfter: Math.ceil(windowMs / 1000) };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    ok: existing.count <= max,
    remaining: Math.max(0, max - existing.count),
    retryAfter,
  };
}

/**
 * Best-effort client identity. Behind Vercel this is the real client IP; on a
 * misconfigured proxy it can be spoofed, which is another reason not to treat
 * this limiter as a security control.
 */
export function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}
