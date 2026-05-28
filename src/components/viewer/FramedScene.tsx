import { ReactNode } from "react";
import frameImg from "@/assets/letter-frame.png";

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
      }}
    >
      {/* Decorative watercolor frame */}
      <img
        src={frameImg}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
          zIndex: overlay ? 0 : 1,
          filter: overlay
            ? "drop-shadow(0 10px 24px rgba(160,80,110,0.18))"
            : "none",
        }}
      />

      {!overlay && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: "100%",
            // Inner safe area — keeps content inside the painted border.
            padding: "clamp(48px, 11vmin, 150px) clamp(40px, 9vmin, 150px)",
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
    </div>
  );
}
