import honeymoonAvenue from "@/assets/honeymoon-avenue.mp3.asset.json";

export interface MusicPreset {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export const MUSIC_PRESETS: MusicPreset[] = [
  { id: "honeymoon-avenue", title: "Honeymoon Avenue (Live from London)", artist: "Ariana Grande", url: honeymoonAvenue.url },
  { id: "be-with-you", title: "Be with you", artist: "The Ridleys", url: "/music/be-with-you.mp3" },
  { id: "ivy", title: "Ivy", artist: "Frank Ocean", url: "/music/ivy.mp3" },
  { id: "birds-of-a-feather", title: "Birds of a Feather", artist: "Billie Eilish", url: "/music/birds-of-a-feather.mp3" },
  { id: "my-love-mine-all-mine", title: "My Love Mine All Mine", artist: "Mitski", url: "/music/my-love-mine-all-mine.mp3" },
  { id: "no-one-noticed", title: "No One Noticed", artist: "The Marías", url: "/music/no-one-noticed.mp3" },
  { id: "lovers-rock", title: "Lovers Rock", artist: "TV Girl", url: "/music/lovers-rock.mp3" },
  { id: "those-eyes", title: "Those Eyes", artist: "New West", url: "/music/those-eyes.mp3" },
  { id: "just-the-way-you-are", title: "Just The Way You Are", artist: "Bruno Mars", url: "/music/just-the-way-you-are.mp3" },
  { id: "da-kidds-story", title: "Da Kidd's Story", artist: "Da Kidd", url: "/music/da-kidds-story.mp3" },
  { id: "heavy", title: "Heavy", artist: "The Marías", url: "/music/heavy.mp3" },
  { id: "wgft", title: "wgft (feat. Burna Boy)", artist: "Gunna", url: "/music/wgft.mp3" },
];

export const getPresetById = (id: string | null | undefined): MusicPreset | undefined =>
  MUSIC_PRESETS.find((m) => m.id === id);

export const getRandomPresetUrl = (): string => {
  const idx = Math.floor(Math.random() * MUSIC_PRESETS.length);
  return MUSIC_PRESETS[idx].url;
};
