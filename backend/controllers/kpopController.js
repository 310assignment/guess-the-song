import { getKpopRandom, refreshKpopCache } from "../deezer/playlist.js";

/**
 * GET /api/kpop?count=50
 * Returns N random previewable tracks from Deezer's K-Pop chart (cached).
 */
export async function getRandomFromKpop(req, res, next) {
  try {
    const count = 79; // Hardcoded to 79 to match number of songs in Deezer Kpop playlist
    const tracks = await getKpopRandom(count);
    res.json({ count: tracks.length, tracks });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/kpop/refresh
 * Clears the cache and refetches the chart pages - creates random order.
 */
export async function refreshKpop(_req, res, next) {
  try {
    const size = await refreshKpopCache();
    res.json({ ok: true, cacheSize: size });
  } catch (e) {
    next(e);
  }
}
