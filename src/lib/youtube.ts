export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export const searchYouTubeMusic = async (query: string): Promise<YouTubeSearchResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.functions.invoke("search-youtube-music", {
    body: { query: trimmed },
  });
  if (error) {
    console.error("[searchYouTubeMusic] error", error);
    return [];
  }
  return (data?.results as YouTubeSearchResult[]) || [];
};
