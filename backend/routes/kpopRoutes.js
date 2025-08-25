import { Router } from "express";
import {
  getRandomFromKpop,
  refreshKpop,
} from "../controllers/kpopController.js";

// Express routes for K-pop API endpoints
const router = Router();

/**
 * GET /api/kpop?count=50
 * Returns N random previewable tracks from Deezer's K-Pop chart (cached).
 */
router.get("/", getRandomFromKpop);

/**
 * POST /api/kpop/refresh
 * Clears the cache and refetches the chart pages - randomises order of cached songs.
 */
router.post("/refresh", refreshKpop);

export default router;
