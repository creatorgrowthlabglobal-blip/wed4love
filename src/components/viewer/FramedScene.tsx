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

  // The frame artwork is rendered via CSS `border-image` so the four painted
  // edges stretch independently to fill any viewport (portrait phone, square
  // tablet, ultra-wide desktop) without ever squeezing the decoration itself.
  // Slice value = thickness of the painted band in source pixels (image is
  // 1600x1067; the floral edge occupies ~260px on each side).
  const borderImageSlice = 260;

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
        overflow: "clip",
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

      {/* Decorative painted frame — uses border-image so the four edges
          stretch to fill the full viewport without distorting the artwork. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderStyle: "solid",
          borderColor: "transparent",
          borderWidth: "clamp(68px, 15.5vmin, 210px)",
          borderImageSource: `url(${frameImg})`,
          borderImageSlice: borderImageSlice,
          borderImageRepeat: "stretch",
          borderImageWidth: 1,
          pointerEvents: "none",
          zIndex: overlay ? 0 : 1,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.6s ease-out",
          filter: overlay
            ? "drop-shadow(0 10px 24px rgba(160,80,110,0.18))"
            : "none",
        }}
      />

      {/* Hidden image used purely to fire onLoad for the shimmer fade-out */}
      <img
        src={frameImg}
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        onLoad={handleLoad}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />

      {!overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            // Keep children inside the painted border — matches border width.
            padding: "clamp(72px, 16.5vmin, 220px) clamp(68px, 15.5vmin, 210px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {children}
          </div>
        </div>
      )}

      {/* Shimmer keyframes */}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

