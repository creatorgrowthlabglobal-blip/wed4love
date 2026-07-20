import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<any> | null = null;

/** Loads the YouTube IFrame API script once and resolves with `window.YT`. */
const loadYouTubeApi = (): Promise<any> => {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });
  return apiPromise;
};

/**
 * Plays a YouTube video as background audio via the official IFrame Player
 * (visually hidden — we only care about the audio track). Using the real
 * embedded player keeps this within YouTube's terms; we never touch or
 * extract the underlying media file.
 *
 * `play()`/`pause()` are safe to call before the player is ready — the
 * intent is queued and applied as soon as it is.
 */
export function useYouTubeAudio(videoId: string | null, volume = 0.3) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingPlayRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(container);
    containerRef.current = container;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(container, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (e: any) => {
            if (cancelled) return;
            e.target.setVolume(Math.round(volume * 100));
            setReady(true);
            if (pendingPlayRef.current) e.target.playVideo();
          },
          onStateChange: (e: any) => {
            // Manual loop fallback in case the loop/playlist params don't
            // catch (some browsers/embeds are inconsistent about this).
            if (e.data === YT.PlayerState.ENDED) {
              e.target.seekTo(0);
              e.target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      container.remove();
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const play = () => {
    if (!videoId) return;
    pendingPlayRef.current = true;
    playerRef.current?.playVideo?.();
  };

  const pause = () => {
    pendingPlayRef.current = false;
    playerRef.current?.pauseVideo?.();
  };

  const isPaused = () => {
    if (!playerRef.current?.getPlayerState) return true;
    return playerRef.current.getPlayerState() !== window.YT?.PlayerState?.PLAYING;
  };

  return { play, pause, isPaused, ready };
}
