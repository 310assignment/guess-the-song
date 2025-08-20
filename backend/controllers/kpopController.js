import { getKpopRandom, refreshKpopCache } from "../deezer/playlist.js";

/**
 * GET /api/kpop?count=50
 */
export async function getRandomFromKpop(req, res, next) {
  try {
    const count = 79;
    const tracks = await getKpopRandom(count);
    res.json({ count: tracks.length, tracks });
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/kpop/refresh
 */
export async function refreshKpop(_req, res, next) {
  try {
    const size = await refreshKpopCache();
    res.json({ ok: true, cacheSize: size });
  } catch (e) {
    next(e);
  }
}
