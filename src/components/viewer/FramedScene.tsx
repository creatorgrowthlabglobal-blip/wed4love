import { ReactNode, CSSProperties } from "react";

interface FramedSceneProps {
  children?: ReactNode;
  /** When true, the cream center is transparent (children rendered elsewhere
   *  show through) and the area outside the cream window is filled with the
   *  decorative pink frame — clipping anything that bleeds past. */
  overlay?: boolean;
}

/**
 * A pure-CSS/SVG decorative pink hearts & lace frame.
 * Fully responsive — scales via clamp(). No image assets.
 */
export default function FramedScene({ children, overlay = false }: FramedSceneProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: overlay ? 200 : 50,
        // overlay must intercept nothing so the envelope underneath stays interactive
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
      <FrameDecoration overlay={overlay} />
      {!overlay && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            padding:
              "clamp(40px, 9vmin, 96px) clamp(34px, 8vmin, 88px)",
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

function FrameDecoration({ overlay }: { overlay: boolean }) {
  const pink = "#E48BA8";
  const deepPink = "#C9628A";
  const gold = "#E9C77B";
  const cream = "#FFF6F0";

  // Outer pink band inset from viewport edge — 0 in overlay so the frame fully
  // clips anything bleeding past it (mailbox/envelope zoom).
  const outerInset = overlay ? "0px" : "clamp(10px, 2.5vmin, 28px)";
  // Cream window inset from the outer pink band
  const windowInset = "clamp(20px, 5vmin, 52px)";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: outerInset,
        pointerEvents: "none",
        zIndex: 0,
        borderRadius: "clamp(18px, 3vmin, 36px)",
      }}
    >
      {/* Outer pink band (solid, so overlay mode hides anything underneath) */}
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

      {/* Lace dot/heart pattern along the four edges */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="lace-hearts" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <path
              d="M3 4.6 C 1.2 3.2, 1.2 1.4, 2.4 1.0 C 3.0 0.8, 3.0 1.5, 3 1.8 C 3 1.5, 3.0 0.8, 3.6 1.0 C 4.8 1.4, 4.8 3.2, 3 4.6 Z"
              fill="rgba(255,255,255,0.55)"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="6" fill="url(#lace-hearts)" />
        <rect x="0" y="94" width="100" height="6" fill="url(#lace-hearts)" />
        <rect x="0" y="0" width="4" height="100" fill="url(#lace-hearts)" />
        <rect x="96" y="0" width="4" height="100" fill="url(#lace-hearts)" />
      </svg>

      {/* Gold piping ring */}
      <div
        style={{
          position: "absolute",
          inset: "clamp(14px, 3.5vmin, 36px)",
          borderRadius: "clamp(12px, 2.2vmin, 26px)",
          border: `1.5px solid ${gold}`,
          boxShadow: `inset 0 0 0 4px ${cream}, inset 0 0 0 5px ${gold}`,
        }}
      />

      {/* Cream window: solid in default mode (children render on top via parent),
          transparent in overlay mode (envelope underneath shows through). */}
      <div
        style={{
          position: "absolute",
          inset: windowInset,
          borderRadius: "clamp(8px, 1.6vmin, 20px)",
          background: overlay ? "transparent" : cream,
          boxShadow: overlay
            ? `inset 0 0 0 1px ${gold}, inset 0 0 0 4px ${cream}, inset 0 0 0 5px ${gold}`
            : "inset 0 2px 8px rgba(180,100,130,0.18), 0 0 0 1px rgba(201,98,138,0.25)",
        }}
      />

      {/* Corner heart medallions — small */}
      <CornerHeart corner="tl" pink={deepPink} gold={gold} />
      <CornerHeart corner="tr" pink={deepPink} gold={gold} />
      <CornerHeart corner="bl" pink={deepPink} gold={gold} />
      <CornerHeart corner="br" pink={deepPink} gold={gold} />
    </div>
  );
}

function CornerHeart({
  corner,
  pink,
  gold,
}: {
  corner: "tl" | "tr" | "bl" | "br";
  pink: string;
  gold: string;
}) {
  // Small heart size
  const size = "clamp(18px, 3.2vmin, 34px)";

  const offsets: Record<typeof corner, CSSProperties> = {
    tl: { top: 0, left: 0, transform: "translate(-25%, -25%)" },
    tr: { top: 0, right: 0, transform: "translate(25%, -25%)" },
    bl: { bottom: 0, left: 0, transform: "translate(-25%, 25%)" },
    br: { bottom: 0, right: 0, transform: "translate(25%, 25%)" },
  };

  const gradId = `heart-grad-${corner}`;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        ...offsets[corner],
      }}
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFD6E2" />
            <stop offset="60%" stopColor={pink} />
            <stop offset="100%" stopColor="#9A4669" />
          </radialGradient>
        </defs>
        <path
          d="M12 21s-7-4.35-9.5-9.05C.9 8.6 2.6 5 6 5c2 0 3.2 1.1 4 2.3C10.8 6.1 12 5 14 5c3.4 0 5.1 3.6 3.5 6.95C19 16.65 12 21 12 21z"
          fill={`url(#${gradId})`}
          stroke={gold}
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

