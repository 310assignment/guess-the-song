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
  public cachedSongs: Song[] = [];

  private currentIndex = 0;
  private currentAudio: HTMLAudioElement | null = null;
  private multiAudios: HTMLAudioElement[] = []; // NEW: for multiple songs
  private onTrackChange?: (song: Song, index: number) => void;

  constructor() {
    this.baseUrl = `${API_BASE}/api/kpop`;
    this.cachedSongs = [];
  }

  // --- API calls ---
  async fetchRandomKpop(): Promise<Song[]> {
    const res = await axios.get(this.baseUrl);
    const data = res.data;

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

  async refreshKpop() {
    const res = await axios.post(`${this.baseUrl}/refresh`);
    const data = res.data;

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

  getCachedSongs() {
    return this.cachedSongs;
  }

  // --- Single-song controls ---
  playSong(index: number = this.currentIndex) {
    if (!this.cachedSongs.length) return;
    this.stopSong();

    this.currentIndex = index;
    const song = this.cachedSongs[this.currentIndex];
    if (!song.previewUrl) {
      console.warn("No preview available for:", song.title);
      return;
    }

    this.currentAudio = new Audio(song.previewUrl);
    this.currentAudio.volume = 0.6;
    this.currentAudio
      .play()
      .then(() => {
        if (this.onTrackChange) this.onTrackChange(song, this.currentIndex);
      })
      .catch((err) => console.error("Playback failed:", err));
  }

  playNextSong() {
    if (!this.cachedSongs.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.cachedSongs.length;
    this.playSong(this.currentIndex);
  }

  pauseSong() {
    this.currentAudio?.pause();
  }

  stopSong() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    // stop any multi-song playback too
    this.stopMultiSong();
  }

  // --- Multi-song controls (for MultipleChoice mode) ---
  playMultiSong(songs: Song[]) {
    this.stopMultiSong(); // clear old playback

    this.multiAudios = songs
      .filter((s) => s.previewUrl)
      .map((s) => {
        const audio = new Audio(s.previewUrl!);
        audio.volume = 0.6;
        audio
          .play()
          .catch((err) => console.error("Multi-song play failed:", err));
        return audio;
      });
  }

  stopMultiSong() {
    this.multiAudios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.multiAudios = [];
  }

  // --- Track change subscription ---
  setOnTrackChange(cb: (song: Song, index: number) => void) {
    this.onTrackChange = cb;
  }
}

export const songService = new SongService();
