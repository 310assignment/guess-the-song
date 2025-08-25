// Very small in-memory cache with TTL per key
const store = new Map();
// default 30 minutes (specified in minutes in .env)
const defaultTtlMs = Number(process.env.CACHE_TTL_MINUTES || 30) * 60 * 1000;

export function setCache(key, items, resetTimestamp = false) {
  const now = Date.now();
  const prev = store.get(key);
  const createdAt = resetTimestamp || !prev ? now : prev.createdAt;
  store.set(key, { items, createdAt, ttlMs: defaultTtlMs });
}

export function getCache(key) {
  return store.get(key) || null;
}

export function isExpired(entry) {
  return Date.now() - entry.createdAt > (entry.ttlMs || defaultTtlMs);
}

export function clearCache(key) {
  store.delete(key);
}
