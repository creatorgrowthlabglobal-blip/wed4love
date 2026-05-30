export interface MusicPreset {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export const MUSIC_PRESETS: MusicPreset[] = [
  { id: "ivy", title: "Ivy", artist: "Frank Ocean", url: "/music/ivy.mp3" },
  { id: "birds-of-a-feather", title: "Birds of a Feather", artist: "Billie Eilish", url: "/music/birds-of-a-feather.mp3" },
  { id: "my-love-mine-all-mine", title: "My Love Mine All Mine", artist: "Mitski", url: "/music/my-love-mine-all-mine.mp3" },
  { id: "no-one-noticed", title: "No One Noticed", artist: "The Marías", url: "/music/no-one-noticed.mp3" },
];

export const getPresetById = (id: string | null | undefined): MusicPreset | undefined =>
  MUSIC_PRESETS.find((m) => m.id === id);
