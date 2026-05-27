import { ReactNode } from "react";

interface FramedSceneProps {
  children?: ReactNode;
  /** When true, renders only the decorative frame border as an overlay
   *  (transparent center) — use on top of an existing full-screen scene. */
  overlay?: boolean;
}

/**
 * A pure-CSS/SVG decorative pink hearts & lace frame.
 * No image assets — fully responsive, crisp on any screen size.
 *
 * Two modes:
 *  - default: full background + inner safe area that hosts children
 *  - overlay: just the border decoration, transparent center, pointer-events none
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
        padding: "clamp(8px, 2.5vmin, 28px)",
        overflow: "hidden",
      }}
    >
      <FrameDecoration />
      {!overlay && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            // Inner safe area — keeps content away from the lace border.
            padding: "clamp(28px, 7vmin, 84px) clamp(22px, 6vmin, 72px)",
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

/** The decorative border itself — absolutely positioned, purely CSS + SVG. */
function FrameDecoration() {
  const pink = "#E48BA8";
  const deepPink = "#C9628A";
  const gold = "#E9C77B";
  const cream = "#FFF6F0";

  // Inset of the border from the viewport edge (responsive).
  const inset = "clamp(10px, 2.5vmin, 28px)";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Outer scalloped pink band */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "clamp(18px, 3vmin, 36px)",
          background: `linear-gradient(135deg, ${pink} 0%, #F2A5BD 50%, ${deepPink} 100%)`,
          boxShadow:
            "0 24px 60px -20px rgba(160,60,100,0.45), inset 0 0 0 1px rgba(255,255,255,0.4)",
        }}
      />

      {/* Scalloped hearts outline — repeating SVG along the border */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="lace-hearts"
            x="0"
            y="0"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            {/* Small heart centered in a 5x5 cell with padding around it */}
            <path
              d="M2.5 3.4 C 1.65 2.7, 1.65 1.85, 2.2 1.65 C 2.5 1.57, 2.5 1.88, 2.5 2.03 C 2.5 1.88, 2.5 1.57, 2.8 1.65 C 3.35 1.85, 3.35 2.7, 2.5 3.4 Z"
              fill="rgba(255,255,255,0.6)"
            />
          </pattern>
        </defs>
        {/* Top & bottom bands — inset from edges so hearts don't touch frame */}
        <rect x="2" y="1.2" width="96" height="3.2" fill="url(#lace-hearts)" />
        <rect x="2" y="95.6" width="96" height="3.2" fill="url(#lace-hearts)" />
        {/* Left & right bands */}
        <rect x="1.2" y="2" width="2.4" height="96" fill="url(#lace-hearts)" />
        <rect x="96.4" y="2" width="2.4" height="96" fill="url(#lace-hearts)" />
      </svg>

      {/* Gold piping */}
      <div
        style={{
          position: "absolute",
          inset: "clamp(14px, 3.5vmin, 36px)",
          borderRadius: "clamp(12px, 2.2vmin, 26px)",
          border: `1.5px solid ${gold}`,
          boxShadow: `inset 0 0 0 4px ${cream}, inset 0 0 0 5px ${gold}`,
        }}
      />

      {/* Inner cream window — this is the "hole" you see through */}
      <div
        style={{
          position: "absolute",
          inset: "clamp(20px, 5vmin, 52px)",
          borderRadius: "clamp(8px, 1.6vmin, 20px)",
          background: cream,
          boxShadow:
            "inset 0 2px 8px rgba(180,100,130,0.18), 0 0 0 1px rgba(201,98,138,0.25)",
        }}
      />

      {/* Corner heart medallions */}
      {[
        { top: 0, left: 0 },
        { top: 0, right: 0 },
        { bottom: 0, left: 0 },
        { bottom: 0, right: 0 },
      ].map((pos, i) => (
        <CornerHeart key={i} style={pos} pink={deepPink} gold={gold} />
      ))}
    </div>
  );
}

function CornerHeart({
  style,
  pink,
  gold,
}: {
  style: React.CSSProperties;
  pink: string;
  gold: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: "clamp(28px, 6vmin, 64px)",
        height: "clamp(28px, 6vmin, 64px)",
        transform: "translate(-15%, -15%)",
        ...style,
        ...(style.right !== undefined ? { transform: "translate(15%, -15%)" } : {}),
        ...(style.bottom !== undefined && style.left !== undefined
          ? { transform: "translate(-15%, 15%)" }
          : {}),
        ...(style.bottom !== undefined && style.right !== undefined
          ? { transform: "translate(15%, 15%)" }
          : {}),
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <defs>
          <radialGradient id={`heart-grad-${pink.slice(1)}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFD6E2" />
            <stop offset="60%" stopColor={pink} />
            <stop offset="100%" stopColor="#9A4669" />
          </radialGradient>
        </defs>
        <path
          d="M12 21s-7-4.35-9.5-9.05C.9 8.6 2.6 5 6 5c2 0 3.2 1.1 4 2.3C10.8 6.1 12 5 14 5c3.4 0 5.1 3.6 3.5 6.95C19 16.65 12 21 12 21z"
          fill={`url(#heart-grad-${pink.slice(1)})`}
          stroke={gold}
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}
