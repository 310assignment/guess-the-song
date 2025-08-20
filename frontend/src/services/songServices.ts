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
  private multiAudios: HTMLAudioElement[] = []; // For multiple simultaneous songs
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
        console.log("Playing single song:", song.title);
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
    this.multiAudios.forEach(audio => audio.pause());
  }

  stopSong() {
    // Stop single song
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    // Stop multi-song playback
    this.stopMultiSong();
  }

  // --- Multi-song controls (Simultaneous playback) ---
  async playMultiSong(songs: Song[]) {
    console.log("🎶 Starting simultaneous multi-song playback");
    console.log("Songs to play:", songs.map(s => `${s.title} - ${s.artist} (Preview: ${s.previewUrl ? 'YES' : 'NO'})`));

    this.stopMultiSong(); // Clear any existing playback

    // Filter songs with valid preview URLs
    const validSongs = songs.filter((s) => s.previewUrl && s.previewUrl.trim() !== "");

    if (validSongs.length === 0) {
      console.error("❌ No songs with valid preview URLs!");
      return;
    }

    console.log(`✅ Found ${validSongs.length} songs with valid previews`);

    // Create audio elements for each song
    this.multiAudios = validSongs.map((song, index) => {
      const audio = new Audio(song.previewUrl!);

      // Set different volumes to make them distinguishable but still mixed
      // Lower overall volume since we're playing multiple at once
      audio.volume = 0.3 + (index * 0.1); // 0.3, 0.4, 0.5

      // Add event listeners for debugging
      audio.addEventListener('canplaythrough', () => {
        console.log(`✅ Audio ${index + 1} ready: ${song.title}`);
      });

      audio.addEventListener('error', (e) => {
        console.error(`❌ Audio ${index + 1} error for ${song.title}:`, e);
      });

      audio.addEventListener('loadstart', () => {
        console.log(`🔄 Loading audio ${index + 1}: ${song.title}`);
      });

      return audio;
    });

    // Play all audio elements with slight delay to avoid browser blocking
    try {
      console.log("🎵 Attempting to play all audios...");

      for (let i = 0; i < this.multiAudios.length; i++) {
        const audio = this.multiAudios[i];
        const song = validSongs[i];

        // Add small delay between each audio start (helps with browser policies)
        setTimeout(async () => {
          try {
            await audio.play();
            console.log(`✅ Successfully started audio ${i + 1}: ${song.title}`);
          } catch (error) {
            console.error(`❌ Failed to play audio ${i + 1} (${song.title}):`, error);

            // If first audio fails, it might be an autoplay policy issue
            if (i === 0) {
              console.warn("🚫 Autoplay might be blocked. User interaction may be required.");
            }
          }
        }, i * 100); // 100ms delay between each
      }

    } catch (error) {
      console.error("❌ Multi-song playback failed:", error);
    }
  }

  stopMultiSong() {
    console.log("🛑 Stopping multi-song playback");
    this.multiAudios.forEach((audio, index) => {
      try {
        audio.pause();
        audio.currentTime = 0;
        console.log(`✅ Stopped audio ${index + 1}`);
      } catch (error) {
        console.error(`❌ Error stopping audio ${index + 1}:`, error);
      }
    });
    this.multiAudios = [];
  }

  // --- Debugging method ---
  getMultiAudioStatus() {
    return this.multiAudios.map((audio, index) => ({
      index: index + 1,
      paused: audio.paused,
      currentTime: audio.currentTime,
      duration: audio.duration,
      readyState: audio.readyState,
      error: audio.error
    }));
  }

  // --- Track change subscription ---
  setOnTrackChange(cb: (song: Song, index: number) => void) {
    this.onTrackChange = cb;
  }
}

export const songService = new SongService();