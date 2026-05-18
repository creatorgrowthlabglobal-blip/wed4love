import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { sounds } from "@/lib/sounds";

/* Lavender garden mailbox — illustrated SVG inspired by the reference photo.
   Front-facing rounded mailbox on a weathered wooden post, flap hanging open
   to reveal a stack of decorative envelopes. A gold bird perches on the roof
   and a small bluebird sits beside it. Stylized flower / foliage band runs
   along the base. Click → flap swings open, letters fan out, bird flies. */

type MailboxState = "idle" | "opening" | "delivered";

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const INK = "#2a2230";

/* ───────────────────── Defs ───────────────────── */

const Defs = () => (
  <defs>
    {/* Lavender body — front-lit, soft top highlight, deeper bottom */}
    <linearGradient id="bodyLav" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#D7C7F0" />
      <stop offset="35%" stopColor="#C2AEE6" />
      <stop offset="100%" stopColor="#9A85C9" />
    </linearGradient>
    <linearGradient id="bodyLavSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#A693D4" />
      <stop offset="100%" stopColor="#7D68B0" />
    </linearGradient>
    <radialGradient id="bodyShine" cx="0.35" cy="0.18" r="0.55">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>
    {/* Door (flap) — outside pale lavender, inside soft pink */}
    <linearGradient id="doorOuter" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#C8B6E8" />
      <stop offset="100%" stopColor="#A48DCE" />
    </linearGradient>
    <linearGradient id="doorInner" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FBD8E5" />
      <stop offset="100%" stopColor="#F3B6CD" />
    </linearGradient>
    {/* Interior cavity */}
    <radialGradient id="cavity" cx="0.5" cy="0.4" r="0.85">
      <stop offset="0%" stopColor="#9E8AC8" />
      <stop offset="60%" stopColor="#6A578E" />
      <stop offset="100%" stopColor="#382C50" />
    </radialGradient>
    {/* Wood post */}
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#8A6A4A" />
      <stop offset="50%" stopColor="#A88560" />
      <stop offset="100%" stopColor="#6E5238" />
    </linearGradient>
    <linearGradient id="woodTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#9C7A56" />
      <stop offset="100%" stopColor="#7A5C3F" />
    </linearGradient>
    {/* Gold bird body */}
    <radialGradient id="goldBird" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0%" stopColor="#F5DC8A" />
      <stop offset="60%" stopColor="#D9B14C" />
      <stop offset="100%" stopColor="#8E6A1F" />
    </radialGradient>
    {/* Brass plate */}
    <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F2D680" />
      <stop offset="50%" stopColor="#C9A24A" />
      <stop offset="100%" stopColor="#8C6E22" />
    </linearGradient>
    {/* Flag handle */}
    <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#EFEFEF" />
      <stop offset="50%" stopColor="#C0C0C8" />
      <stop offset="100%" stopColor="#8A8A95" />
    </linearGradient>
    {/* Soft ground glow / ambient */}
    <radialGradient id="ground" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
      <stop offset="100%" stopColor="#000" stopOpacity="0" />
    </radialGradient>
    {/* Envelope paper */}
    <linearGradient id="envCream" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FBF4E4" />
      <stop offset="100%" stopColor="#E8D9B6" />
    </linearGradient>
    <linearGradient id="envBlush" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FBE0EB" />
      <stop offset="100%" stopColor="#EFB8CE" />
    </linearGradient>
    <linearGradient id="envFloral" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F7E6D6" />
      <stop offset="100%" stopColor="#DEC09C" />
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
      <feOffset dy="3" />
      <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

/* ───────────────────── Garden band (simple foliage + flowers) ───────────────────── */

const Flower = ({ x, y, color, scale = 1 }: { x: number; y: number; color: string; scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse
        key={a}
        cx="0"
        cy="-5"
        rx="3.2"
        ry="5"
        fill={color}
        transform={`rotate(${a})`}
        opacity="0.95"
      />
    ))}
    <circle r="2" fill="#F5C24A" />
  </g>
);

const Leaf = ({ x, y, rot = 0, color = "#5A8A4A", scale = 1 }: { x: number; y: number; rot?: number; color?: string; scale?: number }) => (
  <path
    d="M 0 0 Q 6 -10 14 -6 Q 6 0 0 0 Z"
    fill={color}
    transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}
    opacity="0.9"
  />
);

const GardenBand = () => (
  <g>
    {/* Soft ground gradient */}
    <ellipse cx="200" cy="430" rx="200" ry="40" fill="url(#ground)" />
    {/* Foliage clumps left */}
    <g>
      <ellipse cx="55" cy="420" rx="65" ry="22" fill="#4F7A42" />
      <ellipse cx="75" cy="408" rx="50" ry="18" fill="#629256" />
      <ellipse cx="40" cy="412" rx="35" ry="14" fill="#73A467" />
    </g>
    {/* Foliage clumps right */}
    <g>
      <ellipse cx="345" cy="420" rx="65" ry="22" fill="#4F7A42" />
      <ellipse cx="325" cy="408" rx="50" ry="18" fill="#629256" />
      <ellipse cx="360" cy="412" rx="35" ry="14" fill="#73A467" />
    </g>
    {/* Center mound under post */}
    <ellipse cx="200" cy="438" rx="90" ry="14" fill="#5C4030" opacity="0.55" />
    {/* Pebbles */}
    {[
      { x: 165, y: 438, r: 4 },
      { x: 180, y: 442, r: 3 },
      { x: 215, y: 440, r: 4.5 },
      { x: 232, y: 437, r: 3 },
      { x: 198, y: 444, r: 3.5 },
    ].map((p, i) => (
      <ellipse key={i} cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.65} fill="#9B8B78" />
    ))}
    {/* Flowers — pinks, purples, white */}
    <Flower x={25} y={408} color="#E58AB4" />
    <Flower x={48} y={420} color="#C58AD8" scale={0.9} />
    <Flower x={82} y={414} color="#FBE5F0" scale={0.85} />
    <Flower x={108} y={424} color="#D472C0" scale={0.95} />
    <Flower x={130} y={416} color="#A87CD8" scale={0.8} />
    <Flower x={265} y={418} color="#E58AB4" scale={0.9} />
    <Flower x={290} y={414} color="#C58AD8" />
    <Flower x={315} y={424} color="#FBE5F0" scale={0.85} />
    <Flower x={350} y={416} color="#D472C0" scale={0.95} />
    <Flower x={375} y={420} color="#A87CD8" scale={0.85} />
    {/* A succulent rosette center-front */}
    <g transform="translate(210 438)">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse
          key={a}
          cx="0"
          cy="-4"
          rx="3"
          ry="6"
          fill="#A6C8A0"
          stroke="#6E8E68"
          strokeWidth="0.5"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r="2" fill="#C9DFC0" />
    </g>
    {/* Leaves scattered */}
    <Leaf x={20} y={400} rot={-30} />
    <Leaf x={130} y={406} rot={20} color="#6FA058" />
    <Leaf x={270} y={406} rot={-15} />
    <Leaf x={378} y={404} rot={25} color="#6FA058" />
  </g>
);

/* ───────────────────── Post ───────────────────── */

const Post = () => (
  <g>
    {/* Top horizontal beam */}
    <rect x="138" y="288" width="124" height="14" fill="url(#woodTop)" stroke={INK} strokeWidth="1.6" rx="1.5" />
    <line x1="150" y1="291" x2="252" y2="291" stroke="#5A4028" strokeWidth="0.8" opacity="0.6" />
    {/* Vertical post */}
    <rect x="184" y="300" width="32" height="130" fill="url(#wood)" stroke={INK} strokeWidth="1.6" rx="1.5" />
    {/* Wood grain */}
    <line x1="192" y1="305" x2="192" y2="428" stroke="#5A4028" strokeWidth="0.6" opacity="0.5" />
    <line x1="200" y1="305" x2="200" y2="428" stroke="#6E5238" strokeWidth="0.5" opacity="0.4" />
    <line x1="208" y1="305" x2="208" y2="428" stroke="#5A4028" strokeWidth="0.6" opacity="0.5" />
  </g>
);

/* ───────────────────── Mailbox body ───────────────────── */

const Body = () => (
  <g filter="url(#softShadow)">
    {/* Right side wall (depth) */}
    <path
      d="M 305 290 L 305 168 Q 305 110 290 95 L 295 92 Q 318 108 318 168 L 318 288 Z"
      fill="url(#bodyLavSide)"
      stroke={INK}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Main body — rounded arch */}
    <path
      d="M 88 290 L 88 170 Q 88 92 200 92 Q 305 92 305 170 L 305 290 Z"
      fill="url(#bodyLav)"
      stroke={INK}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Top highlight */}
    <path
      d="M 88 290 L 88 170 Q 88 92 200 92 Q 305 92 305 170 L 305 290 Z"
      fill="url(#bodyShine)"
      opacity="0.9"
    />
    {/* Water droplets */}
    {[
      { x: 130, y: 130, r: 1.6 },
      { x: 160, y: 115, r: 1.2 },
      { x: 220, y: 110, r: 1.4 },
      { x: 255, y: 130, r: 1.1 },
      { x: 275, y: 160, r: 1.3 },
    ].map((d, i) => (
      <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#FFFFFF" opacity="0.7" />
    ))}
    {/* Top arch shine line */}
    <path
      d="M 95 175 Q 100 100 200 100"
      fill="none"
      stroke="#F2EBFF"
      strokeWidth="1.2"
      opacity="0.7"
    />
  </g>
);

/* ───────────────────── Flag handle (right side) ───────────────────── */

const Flag = () => (
  <g>
    {/* Vertical post */}
    <rect x="312" y="170" width="5" height="50" fill="url(#silver)" stroke={INK} strokeWidth="1" rx="1" />
    {/* Horizontal arm */}
    <rect x="305" y="165" width="38" height="9" fill="url(#silver)" stroke={INK} strokeWidth="1.2" rx="2" />
    {/* Ball end */}
    <circle cx="343" cy="169.5" r="4.5" fill="url(#silver)" stroke={INK} strokeWidth="1" />
    <circle cx="342" cy="168" r="1.4" fill="#FFFFFF" opacity="0.8" />
  </g>
);

/* ───────────────────── Brass M plate ───────────────────── */

const Plate = () => (
  <g>
    <rect x="225" y="232" width="42" height="26" rx="3" fill="url(#brass)" stroke={INK} strokeWidth="1.4" />
    <rect x="227" y="234" width="38" height="22" rx="2" fill="none" stroke="#6A4F18" strokeWidth="0.6" opacity="0.7" />
    <text
      x="246"
      y="251"
      textAnchor="middle"
      fontFamily="serif"
      fontWeight="700"
      fontSize="14"
      fill="#5A3F12"
    >
      M
    </text>
    {/* Tiny brass screws */}
    <circle cx="229" cy="236" r="1" fill="#5A3F12" />
    <circle cx="263" cy="236" r="1" fill="#5A3F12" />
    <circle cx="229" cy="254" r="1" fill="#5A3F12" />
    <circle cx="263" cy="254" r="1" fill="#5A3F12" />
  </g>
);

/* ───────────────────── Interior cavity (revealed when open) ───────────────────── */

const Interior = () => (
  <g>
    <path
      d="M 100 285 L 100 175 Q 100 100 200 100 Q 295 100 295 175 L 295 285 Z"
      fill="url(#cavity)"
    />
    {/* Top inner rim shadow */}
    <path
      d="M 102 175 Q 105 105 200 105 Q 293 105 293 175"
      fill="none"
      stroke="#000"
      strokeWidth="6"
      opacity="0.4"
      strokeLinecap="round"
    />
    {/* Inner floor */}
    <ellipse cx="197" cy="283" rx="92" ry="6" fill="#2A1E3E" opacity="0.8" />
  </g>
);

/* ───────────────────── Letters inside ───────────────────── */

const FloralEnvelope = ({ rot = 0 }: { rot?: number }) => (
  <g transform={`rotate(${rot})`}>
    <rect x="-32" y="-22" width="64" height="44" rx="2" fill="url(#envFloral)" stroke={INK} strokeWidth="1.2" />
    {/* Floral pattern */}
    {[
      { x: -22, y: -10, c: "#D472A0" },
      { x: -8, y: 4, c: "#A87CD8" },
      { x: 8, y: -8, c: "#E58AB4" },
      { x: 22, y: 6, c: "#7BA86A" },
      { x: -16, y: 10, c: "#7BA86A" },
      { x: 16, y: -14, c: "#A87CD8" },
    ].map((f, i) => (
      <circle key={i} cx={f.x} cy={f.y} r="2.2" fill={f.c} opacity="0.85" />
    ))}
  </g>
);

const BlushEnvelope = ({ rot = 0 }: { rot?: number }) => (
  <g transform={`rotate(${rot})`}>
    <rect x="-30" y="-21" width="60" height="42" rx="2" fill="url(#envBlush)" stroke={INK} strokeWidth="1.2" />
    {/* Bluebird motif */}
    <ellipse cx="-4" cy="0" rx="9" ry="6" fill="#7DB8D8" stroke={INK} strokeWidth="0.8" />
    <circle cx="-12" cy="-3" r="4.5" fill="#7DB8D8" stroke={INK} strokeWidth="0.8" />
    <circle cx="-13" cy="-4" r="0.8" fill={INK} />
    <path d="M -16 -3 L -19 -2 L -16 -1 Z" fill="#E5A45A" stroke={INK} strokeWidth="0.5" />
    {/* Tiny floral branch */}
    <path d="M 8 6 Q 14 2 22 6" stroke="#7BA86A" strokeWidth="1" fill="none" />
    <circle cx="14" cy="4" r="1.5" fill="#E58AB4" />
    <circle cx="20" cy="6" r="1.4" fill="#A87CD8" />
  </g>
);

const CreamEnvelope = ({ rot = 0 }: { rot?: number }) => (
  <g transform={`rotate(${rot})`}>
    <rect x="-28" y="-20" width="56" height="40" rx="2" fill="url(#envCream)" stroke={INK} strokeWidth="1.2" />
    {/* Flap (back-of-envelope V) */}
    <path d="M -28 -20 L 0 0 L 28 -20" fill="none" stroke={INK} strokeWidth="1" opacity="0.5" />
  </g>
);

const LettersInside = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.g
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <g transform="translate(160 235)" filter="url(#softShadow)">
          <CreamEnvelope rot={-8} />
        </g>
        <g transform="translate(185 225)" filter="url(#softShadow)">
          <FloralEnvelope rot={-3} />
        </g>
        <g transform="translate(215 230)" filter="url(#softShadow)">
          <BlushEnvelope rot={6} />
        </g>
      </motion.g>
    )}
  </AnimatePresence>
);

/* ───────────────────── Door / flap ───────────────────── */

const Door = ({ open }: { open: boolean }) => (
  <motion.g
    initial={false}
    animate={{ rotateX: open ? -160 : 0 }}
    transition={{ duration: 1.1, ease: [0.34, 1.3, 0.4, 1] }}
    style={{ transformOrigin: "200px 288px", transformBox: "fill-box" }}
  >
    {/* Door outer */}
    <path
      d="M 100 288 L 100 175 Q 100 102 200 102 Q 295 102 295 175 L 295 288 Z"
      fill="url(#doorOuter)"
      stroke={INK}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Door inner panel (pink) */}
    <path
      d="M 110 285 L 110 178 Q 110 112 200 112 Q 285 112 285 178 L 285 285 Z"
      fill="url(#doorInner)"
      opacity="0.85"
    />
    {/* Tiny handle on door (bottom) */}
    <rect x="190" y="276" width="20" height="4" rx="1.5" fill="url(#silver)" stroke={INK} strokeWidth="0.8" />
    {/* Two rivets */}
    <circle cx="118" cy="280" r="1.6" fill="#7A6499" />
    <circle cx="278" cy="280" r="1.6" fill="#7A6499" />
  </motion.g>
);

/* ───────────────────── Birds ───────────────────── */

const GoldBird = ({ flying }: { flying: boolean }) => (
  <motion.g
    initial={false}
    animate={
      flying
        ? { x: -180, y: -180, rotate: -18, opacity: 0 }
        : { x: 0, y: [0, -1.5, 0], rotate: 0, opacity: 1 }
    }
    transition={
      flying
        ? { duration: 2.4, ease: "easeOut", opacity: { duration: 2.4, times: [0, 0.7, 1] } }
        : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
    }
    style={{ transformOrigin: "215px 85px" }}
  >
    {/* Tail */}
    <path d="M 232 86 L 248 80 L 244 88 Z" fill="url(#goldBird)" stroke={INK} strokeWidth="1" />
    {/* Body */}
    <ellipse cx="218" cy="85" rx="14" ry="9" fill="url(#goldBird)" stroke={INK} strokeWidth="1.2" />
    {/* Wing */}
    <motion.path
      d="M 215 80 Q 225 78 228 88 Q 220 90 215 88 Z"
      fill="#B89238"
      stroke={INK}
      strokeWidth="1"
      animate={flying ? { rotate: [-20, 25, -20] } : { rotate: [-3, 5, -3] }}
      transition={{ duration: flying ? 0.18 : 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "220px 84px" }}
    />
    {/* Head */}
    <circle cx="208" cy="79" r="7" fill="url(#goldBird)" stroke={INK} strokeWidth="1.2" />
    {/* Eye */}
    <circle cx="205" cy="77" r="1.1" fill={INK} />
    <circle cx="204.5" cy="76.5" r="0.4" fill="#FFF" />
    {/* Beak */}
    <path d="M 202 79 L 198 80 L 202 81 Z" fill="#D89A3A" stroke={INK} strokeWidth="0.7" />
    {/* Feet */}
    <line x1="214" y1="93" x2="213" y2="96" stroke={INK} strokeWidth="1" strokeLinecap="round" />
    <line x1="220" y1="93" x2="221" y2="96" stroke={INK} strokeWidth="1" strokeLinecap="round" />
  </motion.g>
);

const BlueBird = ({ flying }: { flying: boolean }) => (
  <motion.g
    initial={false}
    animate={
      flying
        ? { x: 200, y: -160, rotate: 18, opacity: 0 }
        : { x: 0, y: [0, -1, 0], rotate: 0, opacity: 1 }
    }
    transition={
      flying
        ? { duration: 2.4, ease: "easeOut", opacity: { duration: 2.4, times: [0, 0.7, 1] } }
        : { duration: 3.1, repeat: Infinity, ease: "easeInOut" }
    }
    style={{ transformOrigin: "335px 230px" }}
  >
    {/* Tail */}
    <path d="M 346 232 L 354 228 L 350 234 Z" fill="#7DB8D8" stroke={INK} strokeWidth="0.8" />
    {/* Body */}
    <ellipse cx="338" cy="232" rx="9" ry="6" fill="#9CCDE5" stroke={INK} strokeWidth="1" />
    {/* Head */}
    <circle cx="332" cy="228" r="5" fill="#9CCDE5" stroke={INK} strokeWidth="1" />
    {/* Eye */}
    <circle cx="330" cy="227" r="0.8" fill={INK} />
    {/* Beak */}
    <path d="M 328 228 L 326 229 L 328 230 Z" fill="#D89A3A" stroke={INK} strokeWidth="0.5" />
    {/* Wing */}
    <path d="M 336 229 Q 342 228 344 234 Q 339 235 336 233 Z" fill="#6FA8C8" stroke={INK} strokeWidth="0.8" />
    {/* Feet */}
    <line x1="335" y1="238" x2="334" y2="241" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
    <line x1="339" y1="238" x2="340" y2="241" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
  </motion.g>
);

/* ───────────────────── Caption ───────────────────── */

const Caption = ({ senderName }: { senderName?: string }) => (
  <motion.g
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.6 }}
  >
    <text
      x="200"
      y="475"
      textAnchor="middle"
      fontFamily="'Playfair Display', serif"
      fontStyle="italic"
      fontSize="15"
      fill="#5A4870"
    >
      {senderName ? `A letter from ${senderName}` : "Tap to open your letter"}
    </text>
  </motion.g>
);

/* ───────────────────── Root ───────────────────── */

const RealisticMailbox = ({ className, onContinue, senderName }: Props) => {
  const [state, setState] = useState<MailboxState>("idle");
  const [zoomed, setZoomed] = useState(false);
  const controls = useAnimation();
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    controls.start(state);
  }, [state, controls]);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  const handleClick = () => {
    if (state !== "idle") return;
    sounds.birdsFly();
    setState("opening");
    timersRef.current = [
      window.setTimeout(() => {
        setState("delivered");
        setZoomed(true);
      }, 2200),
      window.setTimeout(() => onContinue?.(), 3180),
    ];
  };

  const open = state !== "idle";
  const delivered = state === "delivered";

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
          open
            ? { duration: 0.4 }
            : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          cursor: open ? "default" : "pointer",
          width: "min(540px, 92%)",
          aspectRatio: "1 / 1",
          position: "relative",
          perspective: "1400px",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          animate={delivered ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: "100%", height: "100%", willChange: "opacity" }}
        >
          <svg
            viewBox="0 0 400 495"
            width="100%"
            height="100%"
            style={{ overflow: "visible" }}
          >
            <Defs />

            {/* Background warm wash */}
            <rect x="0" y="0" width="400" height="495" fill="transparent" />

            <Post />
            <Body />

            {/* Cavity revealed only when door open */}
            {open && <Interior />}
            <LettersInside show={open} />

            {/* Door swings open from bottom */}
            <Door open={open} />

            <Flag />
            <Plate />

            <GoldBird flying={open} />
            <BlueBird flying={open} />

            <GardenBand />

            {!open && <Caption senderName={senderName} />}
          </svg>
        </motion.div>

        {/* Shared layout overlay envelope — preserved zoom-into-letter handoff */}
        <AnimatePresence>
          {delivered && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "min(360px, 90vw)",
                aspectRatio: "360 / 240",
                pointerEvents: "none",
                zIndex: 60,
              }}
            >
              <motion.div
                key="shared-envelope"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: zoomed ? 1 : 0.4, opacity: 1 }}
                transition={{
                  scale: { type: "spring", stiffness: 100, damping: 20, mass: 1 },
                  opacity: { duration: 0.35, ease: "easeOut" },
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: "50% 50%",
                  perspective: "800px",
                  willChange: "transform",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "8px 12px -12px 12px",
                    borderRadius: "6px",
                    background: "rgba(120,110,90,0.18)",
                    boxShadow: "0 22px 34px rgba(120,110,90,0.22)",
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "6px",
                    background: "#F5C9DA",
                    border: "2.5px solid #1a1a1a",
                    overflow: "hidden",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "50%",
                    zIndex: 10,
                    transformOrigin: "top center",
                  }}
                >
                  <svg
                    viewBox="0 0 360 180"
                    style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
                    preserveAspectRatio="none"
                  >
                    <polygon
                      points="0,0 360,0 180,180"
                      fill="#F5C9DA"
                      stroke="#1a1a1a"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RealisticMailbox;
