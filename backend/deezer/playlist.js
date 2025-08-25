import { deezerGet } from "./client.js";
import { getCache, setCache, isExpired } from "../utils/cache.js";
import { shuffleInPlace } from "../utils/shuffle.js";

const PLAYLIST_ID = 4096400722; // Deezer K-Pop chart id
const CACHE_KEY = "kpop_chart_pool";

// Normalize a Deezer track into your app's shape
function normalizeTrack(t) {
  return {
    id: t.id,
    name: t.title,
    artists: t.artist?.name ? [t.artist.name] : [],
    preview_url: t.preview || null, // 30s MP3
    duration_ms: (t.duration ?? 0) * 1000,
    image: t.album?.cover_medium || null,
    external_url: t.link || null,
    is_playable: true,
  };
}

// Playlist utilities for Deezer integration
// Suggestions: Use descriptive variable names and add error handling for API calls.
async function fetchPlaylist(index = 0, limit = 50) {
  const data = await deezerGet(`/playlist/${PLAYLIST_ID}/tracks`, {
    params: { index, limit },
  });
  const items = data?.data ?? [];
  return items.map(normalizeTrack);
}

// Build/refresh the cached pool from up to 3 pages (0, 50, 100)
async function buildPool() {
  let pool = [];
  for (const idx of [0, 50, 100]) {
    const chunk = await fetchPlaylist(idx, 50);
    pool.push(...chunk);
  }
  // Keep only previewable tracks, de-dupe by id/name+artist, then shuffle
  pool = dedupe(pool.filter((t) => t.preview_url));
  shuffleInPlace(pool);
  return pool;
}

function dedupe(tracks) {
  const seenId = new Set();
  const seenKey = new Set();
  const out = [];
  for (const t of tracks) {
    const idKey = String(t.id);
    const nameKey = `${(t.name || "").toLowerCase()}::${(
      t.artists?.[0] || ""
    ).toLowerCase()}`;
    if (seenId.has(idKey) || seenKey.has(nameKey)) continue;
    seenId.add(idKey);
    seenKey.add(nameKey);
    out.push(t);
  }
  return out;
}

/**
 * Ensures we have a fresh pool in cache (TTL controlled in utils/cache).
 */
async function ensurePool() {
  const entry = getCache(CACHE_KEY);
  if (!entry || isExpired(entry)) {
    const pool = await buildPool();
    setCache(CACHE_KEY, pool);
    return pool;
  }
  return entry.items;
}

export async function getKpopRandom(count = 50) {
  const pool = await ensurePool();
  // If pool is smaller than requested, just return what we have
  return pool.slice(0, count);
}

export async function refreshKpopCache() {
  const fresh = await buildPool();
  setCache(CACHE_KEY, fresh, true);
  return fresh.length;
}
