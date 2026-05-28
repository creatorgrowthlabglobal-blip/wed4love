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
      <FrameDecoration overlay={overlay} />
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
function FrameDecoration({ overlay = false }: { overlay?: boolean }) {
  const pink = "#E89AB4";
  const deepPink = "#C9628A";
  const softPink = "#F6C2D3";
  const gold = "#D9B25F";
  const lightGold = "#F2DCA0";
  const cream = "#FFF6F0";

  // Inset of the border from the viewport edge (responsive).
  const inset = "clamp(10px, 2.5vmin, 28px)";

  if (overlay) {
    // Hollow decorative ring — transparent center so underlying scene shows through.
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset,
          pointerEvents: "none",
          zIndex: 0,
          borderRadius: "clamp(18px, 3vmin, 36px)",
          boxShadow: [
            `inset 0 0 0 clamp(8px, 2vmin, 22px) ${pink}`,
            `inset 0 0 0 calc(clamp(8px, 2vmin, 22px) + 3px) ${lightGold}`,
            `inset 0 0 0 calc(clamp(8px, 2vmin, 22px) + 4px) ${gold}`,
            `inset 0 0 0 calc(clamp(8px, 2vmin, 22px) + 7px) ${cream}`,
          ].join(", "),
        }}
      >
        {[
          { top: 0, left: 0 },
          { top: 0, right: 0 },
          { bottom: 0, left: 0 },
          { bottom: 0, right: 0 },
        ].map((pos, i) => (
          <CornerOrnament key={i} style={pos} pink={deepPink} gold={gold} lightGold={lightGold} />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset,
        pointerEvents: "none",
        zIndex: 0,
        filter: "drop-shadow(0 28px 60px rgba(160,60,100,0.40))",
      }}
    >
      {/* Outer velvet pink band with soft sheen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "clamp(18px, 3vmin, 36px)",
          background: `
            radial-gradient(120% 80% at 30% 0%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%),
            linear-gradient(135deg, ${softPink} 0%, ${pink} 45%, ${deepPink} 100%)`,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5), inset 0 -10px 30px rgba(150,50,90,0.25)",
        }}
      />

      {/* Lace scallop trim hugging the outer rim */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="lace-scallop" x="0" y="0" width="3.2" height="3.2" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.05" fill="rgba(255,255,255,0.72)" />
            <circle cx="1.6" cy="1.6" r="0.42" fill="rgba(255,255,255,0.95)" />
          </pattern>
        </defs>
        <rect x="1.4" y="0.6" width="97.2" height="2.6" fill="url(#lace-scallop)" />
        <rect x="1.4" y="96.8" width="97.2" height="2.6" fill="url(#lace-scallop)" />
        <rect x="0.6" y="1.4" width="2.6" height="97.2" fill="url(#lace-scallop)" />
        <rect x="96.8" y="1.4" width="2.6" height="97.2" fill="url(#lace-scallop)" />
      </svg>

      {/* Gold ornamental band with pearl trim */}
      <div
        style={{
          position: "absolute",
          inset: "clamp(13px, 3.2vmin, 34px)",
          borderRadius: "clamp(12px, 2.2vmin, 26px)",
          background: `linear-gradient(135deg, ${lightGold}, ${gold} 55%, #B8923F)`,
          boxShadow: `inset 0 1px 2px rgba(255,255,255,0.6), inset 0 0 0 1px rgba(140,105,40,0.5)`,
        }}
      />

      {/* Pearl dots running along the gold band */}
      <svg
        style={{ position: "absolute", inset: "clamp(13px, 3.2vmin, 34px)", width: "auto", height: "auto", left: "clamp(13px, 3.2vmin, 34px)", right: "clamp(13px, 3.2vmin, 34px)", top: "clamp(13px, 3.2vmin, 34px)", bottom: "clamp(13px, 3.2vmin, 34px)" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="pearl-trim" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,250,235,0.9)" />
            <circle cx="1.6" cy="1.6" r="0.35" fill="rgba(255,255,255,1)" />
          </pattern>
        </defs>
        <rect x="2" y="1" width="96" height="2.5" fill="url(#pearl-trim)" />
        <rect x="2" y="96.5" width="96" height="2.5" fill="url(#pearl-trim)" />
        <rect x="1" y="2" width="2.5" height="96" fill="url(#pearl-trim)" />
        <rect x="96.5" y="2" width="2.5" height="96" fill="url(#pearl-trim)" />
      </svg>

      {/* Inner cream window — this is the "hole" you see through */}
      <div
        style={{
          position: "absolute",
          inset: "clamp(22px, 5.4vmin, 56px)",
          borderRadius: "clamp(8px, 1.6vmin, 20px)",
          background: cream,
          boxShadow: `inset 0 0 0 1.5px ${gold}, inset 0 2px 10px rgba(180,100,130,0.20)`,
        }}
      />

      {/* Ornate gilded corner medallions */}
      {[
        { top: 0, left: 0 },
        { top: 0, right: 0 },
        { bottom: 0, left: 0 },
        { bottom: 0, right: 0 },
      ].map((pos, i) => (
        <CornerOrnament key={i} style={pos} pink={deepPink} gold={gold} lightGold={lightGold} />
      ))}
    </div>
  );
}

function CornerOrnament({
  style,
  pink,
  gold,
  lightGold,
}: {
  style: React.CSSProperties;
  pink: string;
  gold: string;
  lightGold: string;
}) {
  const isRight = style.right !== undefined;
  const isBottom = style.bottom !== undefined;
  // Orient the SVG so the flourish always points inward.
  const rot = isBottom ? (isRight ? 180 : 270) : isRight ? 90 : 0;
  const tx = isRight ? "12%" : "-12%";
  const ty = isBottom ? "12%" : "-12%";
  const uid = `${rot}-${pink.slice(1)}`;

  return (
    <div
      style={{
        position: "absolute",
        width: "clamp(38px, 8vmin, 86px)",
        height: "clamp(38px, 8vmin, 86px)",
        transform: `translate(${tx}, ${ty})`,
        ...style,
      }}
    >
      <svg viewBox="0 0 48 48" width="100%" height="100%" style={{ transform: `rotate(${rot}deg)` }}>
        <defs>
          <radialGradient id={`heart-${uid}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFE0EA" />
            <stop offset="55%" stopColor={pink} />
            <stop offset="100%" stopColor="#9A4669" />
          </radialGradient>
          <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={lightGold} />
            <stop offset="100%" stopColor="#B8923F" />
          </linearGradient>
        </defs>
        {/* Gold filigree scrolls sweeping from the corner */}
        <path
          d="M4 4 C 20 4, 30 8, 33 20 M4 4 C 4 20, 8 30, 20 33"
          fill="none"
          stroke={`url(#gold-${uid})`}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M33 20 C 38 22, 40 16, 35 14 C 31 12.5, 31 18, 35 19"
          fill="none"
          stroke={`url(#gold-${uid})`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M20 33 C 22 38, 16 40, 14 35 C 12.5 31, 18 31, 19 35"
          fill="none"
          stroke={`url(#gold-${uid})`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Pearl accents */}
        <circle cx="33" cy="20" r="1.4" fill={lightGold} />
        <circle cx="20" cy="33" r="1.4" fill={lightGold} />
        {/* Corner heart gem */}
        <g transform="translate(6 6)">
          <path
            d="M9 16s-5.3-3.3-7.2-6.9C.7 6.5 2 4 4.6 4c1.5 0 2.4.8 3 1.7C8.3 4.8 9.2 4 10.7 4c2.6 0 3.9 2.5 2.6 5.3C11.3 12.7 9 16 9 16z"
            fill={`url(#heart-${uid})`}
            stroke={gold}
            strokeWidth="0.9"
          />
          <ellipse cx="6" cy="7" rx="1.6" ry="1" fill="rgba(255,255,255,0.55)" transform="rotate(-30 6 7)" />
        </g>
      </svg>
    </div>
  );
}

