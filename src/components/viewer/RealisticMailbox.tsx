import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation, type Variants } from "framer-motion";

/* Premium brushed-metal lavender mailbox — modular animatable parts.
   Each visual element is its own motion.g with isolated variants & transform-origin
   so future animations (shake, bird fly-off, slot glow, etc.) can be orchestrated
   independently from the parent <RealisticMailbox /> via the `state` prop. */

type MailboxState = "idle" | "opening" | "delivered";

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const STROKE = "#1a1a1a";

/* ───────────────────── Sub-parts ───────────────────── */

const Defs = () => (
  <defs>
    <linearGradient id="lavMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#A99BD8" />
      <stop offset="22%" stopColor="#D4C8F2" />
      <stop offset="50%" stopColor="#BDAEE7" />
      <stop offset="78%" stopColor="#D8CCF4" />
      <stop offset="100%" stopColor="#9C8DCC" />
    </linearGradient>
    <linearGradient id="lavMetalDark" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0%" stopColor="#7E6FB3" />
      <stop offset="35%" stopColor="#A395D1" />
      <stop offset="65%" stopColor="#8B7CC2" />
      <stop offset="100%" stopColor="#6E5FA3" />
    </linearGradient>
    <linearGradient id="lavRoofShine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#EFE7FF" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#EFE7FF" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="slotGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stopColor="#FFE9B0" stopOpacity="0.95" />
      <stop offset="60%" stopColor="#E0995A" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#1a1a1a" stopOpacity="1" />
    </radialGradient>
    {/* Inner cavity gradient — empty mailbox interior */}
    <radialGradient id="cavity" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0%" stopColor="#3a2f4d" />
      <stop offset="55%" stopColor="#1a1424" />
      <stop offset="100%" stopColor="#0a0610" />
    </radialGradient>
    {/* Subtle floor plate inside cavity */}
    <linearGradient id="cavityFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2a2238" />
      <stop offset="100%" stopColor="#0a0610" />
    </linearGradient>
    <filter id="brushed" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.9 0.04" numOctaves="2" seed="7" />
      <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.18 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="bodyShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
      <feOffset dy="4" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.35" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <clipPath id="frontClip">
      <path d="M 110 270 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 270 Z" />
    </clipPath>
    <clipPath id="doorClip">
      <path d="M 110 266 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 266 Z" />
    </clipPath>
    <clipPath id="roofClip">
      <path d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z" />
    </clipPath>
  </defs>
);

const GroundShadow = () => (
  <motion.g
    variants={{
      idle: { opacity: 1, scale: 1 },
      opening: { opacity: 0.85, scale: 1.05 },
      delivered: { opacity: 1, scale: 1 },
    }}
    style={{ transformOrigin: "200px 418px" }}
  >
    <ellipse cx="200" cy="418" rx="150" ry="14" fill="#000" opacity="0.18" />
    <ellipse cx="200" cy="416" rx="110" ry="6" fill="#000" opacity="0.25" />
  </motion.g>
);

const Post = () => (
  <motion.g
    variants={{
      idle: { y: 0 },
      opening: { y: 0 },
      delivered: { y: 0 },
    }}
  >
    <polygon
      points="188,270 212,270 212,410 188,410"
      fill="#EFEAFB"
      stroke={STROKE}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <polygon
      points="212,270 224,262 224,402 212,410"
      fill="#BBA8F0"
      stroke={STROKE}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </motion.g>
);

const Roof = () => (
  <motion.g
    variants={{
      idle: { rotate: 0 },
      opening: { rotate: [0, -1.2, 1.2, 0] },
      delivered: { rotate: 0 },
    }}
    transition={{ duration: 0.5 }}
    style={{ transformOrigin: "217px 170px" }}
  >
    <path
      d="M 155 152 Q 155 67 240 67 Q 325 67 325 152 L 325 252 L 280 270 L 280 170 Q 280 85 195 85 Q 110 85 110 170 Z"
      fill="url(#lavMetalDark)"
      stroke={STROKE}
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <g clipPath="url(#roofClip)" opacity="0.55">
      <rect x="100" y="60" width="240" height="220" fill="#fff" filter="url(#brushed)" />
    </g>
    <path
      d="M 158 150 Q 160 70 240 70 Q 322 70 324 150"
      fill="none"
      stroke="#EAE0FA"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.85"
    />
  </motion.g>
);

/* Empty interior cavity — visible when FrontFace falls open */
const Interior = () => (
  <g clipPath="url(#frontClip)">
    {/* deep cavity background */}
    <rect x="100" y="80" width="200" height="200" fill="url(#cavity)" />
    {/* top inner shadow rim (under arch) */}
    <path
      d="M 110 170 Q 110 90 195 90 Q 280 90 280 170"
      fill="none"
      stroke="#000"
      strokeWidth="10"
      opacity="0.55"
      strokeLinecap="round"
    />
    {/* faint side wall highlights for depth */}
    <path d="M 122 170 L 122 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35" />
    <path d="M 268 170 L 268 262" stroke="#5a4a78" strokeWidth="1" opacity="0.35" />
    {/* floor line */}
    <line x1="115" y1="262" x2="275" y2="262" stroke="#000" strokeWidth="1.5" opacity="0.7" />
    {/* tiny ambient glow from above to suggest open-air emptiness */}
    <ellipse cx="195" cy="155" rx="60" ry="22" fill="#fff" opacity="0.04" />
  </g>
);

/* FrontFace, mail slot, and lower lip hinge move as one rigid door assembly.
   The mailbox face is already drawn in a left-leaning isometric projection, so
   the flap must stay on that same skewed plane while swinging from the bottom
   edge like a real hinge. */
const HingeSill = () => (
  <g>
    <rect x="105" y="265" width="180" height="14" rx="1" fill="url(#lavMetalDark)" stroke={STROKE} strokeWidth="2.5" />
    <rect x="105" y="265" width="180" height="2.5" fill="#EAE0FA" opacity="0.8" />
    <rect x="107" y="277" width="176" height="2" fill="#000" opacity="0.35" />
  </g>
);

const FrontFace = () => (
  <motion.g
    initial={{ rotate: -4, skewX: -6 }}
    variants={{
      idle: { rotate: -4, skewX: -6 },
      opening: { rotate: -4, skewX: -6 },
      delivered: { rotate: -4, skewX: -6 },
    }}
    style={{
      transformOrigin: "195px 270px",
      transformBox: "view-box" as any,
      transformStyle: "preserve-3d" as any,
      willChange: "transform",
    }}
  >
    {/* Inner motion.g performs only the hinge rotation so the base stays glued. */}
    <motion.g
      variants={{
        idle: { rotateX: 0, rotateY: -4, z: 10 },
        opening: {
          rotateX: 90,
          rotateY: -4,
          z: 10,
          transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.3 },
        },
        delivered: { rotateX: 90, rotateY: -4, z: 10 },
      }}
      style={{
        transformOrigin: "195px 270px",
        transformBox: "fill-box" as any,
        transformPerspective: 1200,
        transformStyle: "preserve-3d" as any,
        willChange: "transform",
      }}
    >
      {/* lavender front panel */}
      <path
        d="M 110 265 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 265 Z"
        fill="url(#lavMetal)"
        stroke={STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* brushed grain */}
      <g clipPath="url(#doorClip)" opacity="0.6">
        <rect x="100" y="80" width="200" height="200" fill="#fff" filter="url(#brushed)" />
      </g>
      {/* sheen */}
      <path
        d="M 110 265 L 110 170 Q 110 85 195 85 Q 280 85 280 170 L 280 265 Z"
        fill="url(#lavRoofShine)"
        opacity="0.5"
        clipPath="url(#doorClip)"
      />
      {/* edge rim */}
      <path
        d="M 113 264 L 113 170 Q 113 88 195 88 Q 277 88 277 170 L 277 264"
        fill="none"
        stroke="#F2EBFF"
        strokeWidth="1.2"
        opacity="0.85"
      />

      {/* ── Mail slot (integrated into front face) ── */}
      <rect x="138" y="186" width="104" height="17" rx="3" fill={STROKE} />
      <motion.rect
        x="141"
        y="189"
        width="98"
        height="11"
        rx="2"
        fill="url(#slotGlow)"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <line x1="141" y1="187.5" x2="239" y2="187.5" stroke="#F2EBFF" strokeWidth="1" opacity="0.9" />
    </motion.g>
  </motion.g>
);

const Envelope = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.g
        // Starts hidden inside the dark cavity, then slides forward toward viewer
        // only AFTER the door has fully swung open.
        initial={{ x: 0, y: -10, opacity: 0, scale: 0.7 }}
        animate={{ x: 0, y: 60, opacity: 1, scale: 1.05 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.0, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "195px 220px", transformBox: "fill-box" as any }}
      >
        <g transform="translate(150, 185)">
          <rect x="0" y="0" width="110" height="70" rx="3" fill="#ffffff" stroke={STROKE} strokeWidth="2.5" />
          <polyline points="0,0 55,38 110,0" fill="none" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d="M 55 50 m -8 -3 a 5 5 0 1 1 8 -3 a 5 5 0 1 1 8 3 q 0 6 -8 12 q -8 -6 -8 -12 z"
            fill="#FF6F85"
            stroke={STROKE}
            strokeWidth="1.5"
          />
        </g>
      </motion.g>
    )}
  </AnimatePresence>
);

/* Bird body: idle gentle hop, on click flies far off-screen in facing direction */
const birdBodyVariants = (dir: 1 | -1): Variants => ({
  idle: {
    y: [0, -2, 0],
    x: 0,
    opacity: 1,
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
  opening: {
    x: dir * 520,
    y: -220,
    opacity: [1, 1, 1, 0],
    rotate: dir * 10,
    transition: {
      duration: 4.5,
      ease: "easeOut",
      opacity: { duration: 4.5, times: [0, 0.7, 0.9, 1] },
    },
  },
  delivered: { opacity: 0 },
});

/* Wing flap: slow up/down idle, fast flap when flying */
const wingFlapVariants: Variants = {
  idle: {
    rotate: [-6, 10, -6],
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  opening: {
    rotate: [-30, 25, -30],
    transition: { duration: 0.22, repeat: Infinity, ease: "easeInOut" },
  },
  delivered: { rotate: 0 },
};

const BirdLeft = () => (
  <g transform="translate(170, 70)">
    <motion.g variants={birdBodyVariants(-1)} style={{ transformOrigin: "0 0" }}>
      {/* tail */}
      <path d="M 12 -2 Q 20 -8 22 -14" fill="none" stroke={STROKE} strokeWidth="1.4" />
      {/* body */}
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="#F4E6C9" stroke={STROKE} strokeWidth="1.6" />
      {/* feet */}
      <path d="M -2 9 L -4 14 M 2 9 L 1 14" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      {/* head — facing LEFT (outward) */}
      <circle cx="-10" cy="-6" r="7.5" fill="#F4E6C9" stroke={STROKE} strokeWidth="1.6" />
      <polygon points="-17,-6 -22,-4 -17,-2" fill="#E2A23C" stroke={STROKE} strokeWidth="1" />
      <circle cx="-12" cy="-7" r="1.3" fill={STROKE} />
      {/* wing — pivots from shoulder */}
      <motion.path
        d="M 1 -3 Q 6 -10 12 -6 Q 8 0 1 1 Z"
        fill="#E8D6A8"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
        variants={wingFlapVariants}
        style={{ transformOrigin: "1px -3px", transformBox: "fill-box" as any }}
      />
    </motion.g>
  </g>
);

const BirdRight = () => (
  <g transform="translate(240, 70)">
    <motion.g variants={birdBodyVariants(1)} style={{ transformOrigin: "0 0" }}>
      {/* tail */}
      <path d="M -12 -2 Q -20 -8 -22 -14" fill="none" stroke={STROKE} strokeWidth="1.4" />
      {/* body */}
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="#FAFAF6" stroke={STROKE} strokeWidth="1.6" />
      {/* feet */}
      <path d="M -2 9 L -4 14 M 2 9 L 1 14" stroke={STROKE} strokeWidth="1.4" strokeLinecap="round" />
      {/* head — facing RIGHT (outward) */}
      <circle cx="10" cy="-6" r="7.5" fill="#FAFAF6" stroke={STROKE} strokeWidth="1.6" />
      <polygon points="17,-6 22,-4 17,-2" fill="#E2A23C" stroke={STROKE} strokeWidth="1" />
      <circle cx="12" cy="-7" r="1.3" fill={STROKE} />
      {/* wing — pivots from shoulder */}
      <motion.path
        d="M -1 -3 Q -6 -10 -12 -6 Q -8 0 -1 1 Z"
        fill="#ECEAE3"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
        variants={wingFlapVariants}
        style={{ transformOrigin: "-1px -3px", transformBox: "fill-box" as any }}
      />
    </motion.g>
  </g>
);

const Caption = ({ senderName }: { senderName?: string }) => (
  <g>
    <motion.text
      x="200"
      y="450"
      textAnchor="middle"
      fontFamily="'Playfair Display', Georgia, serif"
      fontSize="18"
      fontWeight="600"
      fill="#4b3a6b"
      filter="url(#textGlow)"
      initial={{ opacity: 0, y: 460 }}
      animate={{ opacity: 1, y: 450 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      You've got a mail from {senderName?.trim() || "someone special"}
    </motion.text>
    <motion.text
      x="200"
      y="478"
      textAnchor="middle"
      fontFamily="'Inter', system-ui, sans-serif"
      fontSize="12"
      fontWeight="500"
      letterSpacing="2"
      fill="#8a7aae"
      filter="url(#textGlow)"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 1, 1, 0.5] }}
      transition={{ duration: 2.6, repeat: Infinity }}
    >
      CLICK THE MAILBOX TO CONTINUE
    </motion.text>
  </g>
);

/* ───────────────────── Root ───────────────────── */

const RealisticMailbox = ({ className, onContinue, senderName }: Props) => {
  const [state, setState] = useState<MailboxState>("idle");
  const controls = useAnimation();

  useEffect(() => {
    controls.start(state);
  }, [state, controls]);

  const handleClick = () => {
    if (state !== "idle") return;
    setState("opening");
    setTimeout(() => setState("delivered"), 2200);
    setTimeout(() => onContinue?.(), 3000);
  };

  const open = state !== "idle";

  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: open ? 1 : 1.02 }}
        whileTap={{ scale: open ? 1 : 0.98 }}
        animate={open ? { y: [0, -2, 0] } : { y: [0, -5, 0] }}
        transition={
          open ? { duration: 0.4 } : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          cursor: open ? "default" : "pointer",
          width: "min(520px, 90%)",
          aspectRatio: "1 / 1",
          position: "relative",
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        <svg
          viewBox="0 0 400 495"
          width="100%"
          height="100%"
          style={{ overflow: "visible", transformStyle: "preserve-3d" }}
        >
          <Defs />

          {/* Orchestrated parts share variants via parent animate controls */}
          <motion.g initial="idle" animate={controls}>
            <GroundShadow />
            <Post />

            <g filter="url(#bodyShadow)">
              {/* Right-side wall strip — sells the ~15° left rotation (we see object's right side) */}
              <g>
                <path
                  d="M 280 270 L 280 170 Q 280 85 195 85 L 200 78 Q 293 78 293 168 L 293 268 Z"
                  fill="url(#lavMetalDark)"
                  stroke={STROKE}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
                <path
                  d="M 281 170 Q 281 88 198 82"
                  fill="none"
                  stroke="#000"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
                <path
                  d="M 285 265 L 285 279 L 292 276 L 292 263 Z"
                  fill="url(#lavMetalDark)"
                  stroke={STROKE}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </g>
              <Roof />
              <Interior />
            </g>

            {/* Envelope and door MUST sit OUTSIDE the SVG filter — filters
                rasterize their contents and break CSS 3D transforms on children,
                which is why the door was disappearing. */}
            <Envelope show={open} />
            <HingeSill />
            <FrontFace />


            <BirdLeft />
            <BirdRight />
          </motion.g>
          {!open && <Caption senderName={senderName} />}
        </svg>
      </motion.div>
    </div>
  );
};

export default RealisticMailbox;
