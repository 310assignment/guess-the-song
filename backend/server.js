//entry point for the Express server
// This file sets up the server, handles routes, and integrates with the Spotify API client

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { searchTracks, getTrack } from "./spotifyClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// Search endpoint
app.get("/api/search", async (req, res) => {
  const { q, limit, market } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query parameter q" });

  try {
    const results = await searchTracks(q, limit || 5, market || "NZ");
    const previews = results.map((t) => ({
      id: t.id,
      name: t.name,
      artists: t.artists.map((a) => a.name),
      previewUrl: t.preview_url,
      externalUrl: t.external_urls.spotify,
      albumName: t.album.name,
      image: t.album.images[0]?.url || null,
      durationMs: t.duration_ms,
    }));
    res.json(previews);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(502).json({ error: "Spotify API error" });
  }
});

// Track by ID endpoint
app.get("/api/preview/:trackId", async (req, res) => {
  try {
    const track = await getTrack(req.params.trackId, req.query.market || "NZ");
    const preview = {
      id: track.id,
      name: track.name,
      artists: track.artists.map((a) => a.name),
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      albumName: track.album.name,
      image: track.album.images[0]?.url || null,
      durationMs: track.duration_ms,
    };
    res.json(preview);
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(502).json({ error: "Spotify API error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
