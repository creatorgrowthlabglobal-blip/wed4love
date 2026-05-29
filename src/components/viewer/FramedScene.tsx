import { ReactNode, useState, useCallback, useEffect } from "react";
import frameImg from "@/assets/letter-frame.webp";

interface FramedSceneProps {
  children?: ReactNode;
  /** When true, renders only the decorative frame border as an overlay
   *  (transparent center) — use on top of an existing full-screen scene. */
  overlay?: boolean;
}

/**
 * Watercolor hand-painted floral frame (PNG with transparent center).
 * Fully responsive — stretches to cover the viewport with the scene
 * showing through the empty middle.
 *
 * Two modes:
 *  - default: soft pink background + frame + inner safe area for children
 *  - overlay: just the frame artwork on top of an existing scene
 */
export default function FramedScene({ children, overlay = false }: FramedSceneProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);

  // Safety fallback — reveal the frame even if onLoad never fires (some
  // mobile browsers skip the event when an image is served from cache).
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Frame artwork natural aspect ratio (1600 x 1067 ≈ 3:2 landscape).
  const FRAME_ASPECT = 1600 / 1067;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: overlay ? 200 : 50,
        pointerEvents: overlay ? "none" : "auto",
        background: overlay
          ? "transparent"
          : "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "clamp(8px, 2.5vmin, 24px)",
      }}
    >
      {/* Skeleton shimmer placeholder while frame loads */}
      {!loaded && !overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #FDF1F5 25%, #FCE8EF 50%, #FDF1F5 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
            zIndex: 0,
          }}
        />
      )}

      {/* Aspect-locked stage — keeps the frame from being squeezed on
          portrait phones while still using the viewport as much as possible. */}
      <div
        style={{
          position: "relative",
          width: "min(100%, calc(100vh * " + FRAME_ASPECT + "))",
          aspectRatio: `${FRAME_ASPECT}`,
          maxHeight: "100%",
          pointerEvents: overlay ? "none" : "auto",
        }}
      >
        {/* Decorative watercolor frame */}
        <img
          src={frameImg}
          alt=""
          aria-hidden
          loading="eager"
          decoding="async"
          onLoad={handleLoad}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            zIndex: overlay ? 0 : 1,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.6s ease-out",
            filter: overlay
              ? "drop-shadow(0 10px 24px rgba(160,80,110,0.18))"
              : "none",
          }}
        />

        {!overlay && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              // Inner safe area — keeps content inside the painted border.
              padding: "clamp(32px, 7%, 110px) clamp(28px, 7%, 110px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {children}
            </div>
          </div>
        )}
      </div>

      {/* Shimmer keyframes */}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

