/**
 * Extract a YouTube video ID from any common URL shape:
 * watch?v=, youtu.be/, /shorts/, /embed/, music.youtube.com, with extra
 * query params (timestamps, playlists, etc.) stripped.
 */
export const extractYouTubeId = (url: string): string | null => {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").replace(/^music\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      const shortsMatch = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]{11})/);
      if (shortsMatch) return shortsMatch[2];
    }
    return null;
  } catch {
    return null;
  }
};

export const isValidYouTubeUrl = (url: string): boolean => extractYouTubeId(url) !== null;
