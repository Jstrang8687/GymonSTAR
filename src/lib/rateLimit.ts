import "server-only";

// Single-process in-memory sliding-window limiter. Fine for this app's
// actual deployment (one `next dev`/`next start` process) -- would need a
// shared store (Redis, etc.) if this ever ran as multiple instances.
const attempts = new Map<string, number[]>();

// Sweeps stale keys occasionally so this doesn't grow unbounded if the
// process stays up a long time.
let lastSweep = Date.now();
function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  for (const [key, timestamps] of attempts) {
    const recent = timestamps.filter((t) => now - t < windowMs);
    if (recent.length === 0) attempts.delete(key);
    else attempts.set(key, recent);
  }
}

// Returns true if `key` is allowed to proceed, false if it's rate-limited.
// Only counts a hit against the window when the caller reports failure via
// recordFailure -- successful logins don't consume the budget.
export function isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
  sweep(windowMs);
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  return timestamps.length >= maxAttempts;
}

export function recordFailure(key: string, windowMs: number): void {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  attempts.set(key, timestamps);
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
