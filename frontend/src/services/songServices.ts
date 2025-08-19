import { type Song } from "../types/song";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

type SongDTO = {
  id: string | number;
  name: string;
  artists?: string[];
  preview_url?: string;
  image?: string;
  external_url?: string;
};

export default class SongService {
  public baseUrl: string;
  public cachedSongs: Song[] = []; // optional in-frontend cache

  constructor() {
    this.baseUrl = `${API_BASE}/api/kpop`;
    this.cachedSongs = []; // optional in-frontend cache
  }

  // 1. Fetch random Kpop songs
  async fetchRandomKpop(): Promise<Song[]> {
    const res = await axios.get(this.baseUrl);

    const data = res.data;

    // Transform backend tracks into Song objects
    this.cachedSongs = ((data.tracks ?? []) as SongDTO[]).map(
      (track: SongDTO) => ({
        id: String(track.id),
        title: track.name,
        artist:
          track.artists && track.artists.length > 0
            ? track.artists.join(", ")
            : "Unknown",
        previewUrl: track.preview_url ?? "",
        imageUrl: track.image ?? "",
        externalUrl: track.external_url ?? "",
      })
    );
    return this.cachedSongs;
  }

  // 2. Refresh cache (forces backend to re-shuffle songs)
  async refreshKpop() {
    const res = await axios.post(`${this.baseUrl}/refresh`);
    const data = res.data;

    // Transform backend tracks into Song objects
    this.cachedSongs = ((data.tracks ?? []) as SongDTO[]).map(
      (track: SongDTO) => ({
        id: String(track.id),
        title: track.name,
        artist:
          track.artists && track.artists.length > 0
            ? track.artists.join(", ")
            : "Unknown",
        previewUrl: track.preview_url ?? "",
        imageUrl: track.image ?? "",
        externalUrl: track.external_url ?? "",
      })
    );
    return this.cachedSongs;
  }

  // 3. Getter for already cached songs in frontend
  getCachedSongs() {
    return this.cachedSongs;
  }
}
