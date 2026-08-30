export interface MusicPreset {
  id: string;
  title: string;
  artist: string;
  url: string;
}

// Wedding music library — populate here as tracks are added.
export const MUSIC_PRESETS: MusicPreset[] = [];

export const getPresetById = (id: string | null | undefined): MusicPreset | undefined =>
  MUSIC_PRESETS.find((m) => m.id === id);

export const getRandomPresetUrl = (): string => {
  if (MUSIC_PRESETS.length === 0) return "";
  const idx = Math.floor(Math.random() * MUSIC_PRESETS.length);
  return MUSIC_PRESETS[idx].url;
};

export type PlaybackSource = { type: "youtube"; videoId: string } | { type: "url"; url: string };

/** A pasted YouTube link always wins over a curated preset when both are somehow set. */
export const resolvePlaybackSource = (letter: {
  selectedMusic: string | null;
  youtubeVideoId?: string | null;
  customMusicData?: string | null;
}): PlaybackSource => {
  if (letter.youtubeVideoId) return { type: "youtube", videoId: letter.youtubeVideoId };
  const preset = getPresetById(letter.selectedMusic);
  if (preset) return { type: "url", url: preset.url };
  if (letter.customMusicData) return { type: "url", url: letter.customMusicData };
  return { type: "url", url: getRandomPresetUrl() };
};
