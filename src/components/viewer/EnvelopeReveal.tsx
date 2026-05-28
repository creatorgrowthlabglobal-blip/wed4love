import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import { sounds } from "@/lib/sounds";
import photo1 from "@/assets/photo1.jpg";
import photo2 from "@/assets/photo2.jpg";
import photo3 from "@/assets/photo3.jpg";
import pearlBow from "@/assets/pearl-bow.png";
import silverFrameRect from "@/assets/silver-frame-rect.png";
import silverFrameOval from "@/assets/silver-frame-oval.png";
import rosePetal from "@/assets/rose-petal.png";
import goldSeal from "@/assets/gold-seal.png";

interface EnvelopeRevealProps {
  receiverName: string;
  senderName?: string;
  letterText?: string;
  images?: string[];
  onContinue: () => void;
  onLetterOpen?: () => void;
}

const PAPER_BG = "#FDF6F0";
const ENVELOPE_BASE = "#FFF0F4";    // warm ivory-blush face
const ENV_LEFT = "#EAB8CE";         // left fold panel
const ENV_RIGHT = "#F5D2E4";        // right fold panel
const ENV_BOTTOM = "#E3AECA";       // bottom fold panel
const ENVELOPE_MID = "#F5C9DA";     // flap / compat
const ENVELOPE_DARK = "#1a1a1a";
const FLAP_COLOR = "#F4CADB";
const TEXT_DARK = "#2C2A25";
const TEXT_MID = "#6B6456";

const PHOTOS = [photo1, photo2, photo3];

const letterContent = {
  greeting: "My Dearest,",
  paragraphs: [
    "There are mornings when the light falls through the window at exactly the right angle, and I think of you before I've even fully woken — the way a song you haven't heard in years will suddenly surface, whole and unhurried.",
    "I've been trying to write this for weeks. Not because I didn't know what to say, but because some things feel too real to press into words without losing something in the translation. Still, here I am, trying.",
    "What I know is this: the world is quieter and more interesting when you're in it. You make ordinary afternoons feel like something worth remembering.",
  ],
  closing: "Yours, always —",
  signature: "E.",
};

const SealSVG = () => (
  <div
    style={{
      position: "absolute",
      bottom: -36,
      left: "50%",
      width: 72,
      height: 72,
      marginLeft: -36,
      pointerEvents: "none",
      filter: "drop-shadow(0 5px 10px rgba(70,10,35,0.40)) drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
    }}
  >
    <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* Sunburst outer ring — 16 short rays */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * 360) / 16;
        const r1 = 33, r2 = 36;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const x1 = 36 + r1 * Math.cos(toRad(a)), y1 = 36 + r1 * Math.sin(toRad(a));
        const x2 = 36 + r2 * Math.cos(toRad(a - 5)), y2 = 36 + r2 * Math.sin(toRad(a - 5));
        const x3 = 36 + r2 * Math.cos(toRad(a + 5)), y3 = 36 + r2 * Math.sin(toRad(a + 5));
        return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="#7A1535" />;
      })}
      {/* Outer disc */}
      <circle cx="36" cy="36" r="32" fill="#8B1A40" />
      {/* Mid ring */}
      <circle cx="36" cy="36" r="28" fill="#9E2550" />
      {/* Thin cream ring */}
      <circle cx="36" cy="36" r="25" fill="none" stroke="#F8D8E8" strokeWidth="1" opacity="0.55" />
      {/* Inner disc */}
      <circle cx="36" cy="36" r="23" fill="#7A1535" />
      {/* Heart */}
      <path
        d="M36 50 C 24 41, 20 33, 23 26.5 C 25.5 21.5, 31 21, 36 26 C 41 21, 46.5 21.5, 49 26.5 C 52 33, 48 41, 36 50 Z"
        fill="#FFE4EF"
      />
      {/* Highlight on heart */}
      <ellipse cx="30" cy="30" rx="4" ry="2.5" fill="white" opacity="0.22" transform="rotate(-25 30 30)" />
    </svg>
  </div>
);

const EnvelopeFlap = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "50%",
        transformOrigin: "top center",
        transformStyle: "preserve-3d",
        zIndex: 10,
      }}
      animate={{
        rotateX: isOpen ? 172 : 0,
      }}
      transition={{
        duration: 1.4,
        ease: [0.76, 0, 0.24, 1],
        delay: 0,
      }}
    >
      <svg
        viewBox="0 0 360 180"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flapGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F8DDE8" />
            <stop offset="100%" stopColor="#EDB8CE" />
          </linearGradient>
        </defs>
        <path
          d="M 0,0 L 180,180 L 360,0"
          fill="url(#flapGrad)"
          stroke="rgba(140,70,100,0.45)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <SealSVG />
    </motion.div>
  );
};

type Phase = "idle" | "opening" | "open";

export default function EnvelopeReveal({ receiverName, senderName, letterText, images, onContinue, onLetterOpen }: EnvelopeRevealProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [flapBehind, setFlapBehind] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const HEART_DIRS = [
    { x: -158, y: -272 },  // upper-left
    { x:    0, y: -312 },  // upper-center
    { x:  158, y: -272 },  // upper-right
    { x: -158, y:  158 },  // lower-left
    { x:    0, y:  172 },  // lower-center
    { x:  158, y:  158 },  // lower-right
  ];

  const HEART_STROKE = "#C9607A";
  const HEART_FILL   = "#F4CADB";

  // Once the flap finishes rotating open (~1.5s after click), drop it behind
  // the body so the letter can rise above it. Driven by a real timeout so the
  // z-index swap is reliable (Framer's zero-duration zIndex transitions snap
  // immediately and ignore `delay`).
  useEffect(() => {
    if (phase === "opening") {
      const t = setTimeout(() => setFlapBehind(true), 1500);
      return () => clearTimeout(t);
    }
    if (phase === "idle") setFlapBehind(false);
  }, [phase]);

  useEffect(() => {
    if (phase === "open") onLetterOpen?.();
  }, [phase]);

  const isUserLetter = Boolean(letterText?.trim());
  const paragraphs = isUserLetter
    ? letterText!.split(/\n/).map(p => p.trim()).filter(Boolean)
    : [letterContent.paragraphs[0], letterContent.paragraphs[1], letterContent.paragraphs[2]];
  const para0 = paragraphs[0] ?? "";
  const para1 = paragraphs[1] ?? "";
  const tailParas = isUserLetter ? paragraphs.slice(2) : [letterContent.paragraphs[2]];
  const closing = "Yours, always —";
  const signature = senderName || letterContent.signature;
  const frameImg0 = images?.[0] ?? photo2;
  const frameImg1 = images?.[1] ?? photo1;

  const handleClick = () => {
    if (phase === "idle") {
      setHeartBurst(true);
      // Wait for all hearts to land before opening the envelope
      setTimeout(() => {
        sounds.envelopeOpen();
        setPhase("opening");
      }, 1000);
      return;
    }
    if (phase === "opening") {
      setPhase("open");
    }
  };

  const handleClose = () => {
    setPhase("idle");
    onContinue();
  };

  const isOpen = phase === "open" || phase === "opening";
  const initial = (receiverName || "♥").trim().slice(0, 1).toUpperCase();

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: phase === "open" ? "flex-start" : "center",
        background: "radial-gradient(ellipse at 50% 30%, #DCCFE6 0%, #C4B3D6 100%)",
        borderRadius: "12px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "2rem",
        overflowY: phase === "open" ? "auto" : "hidden",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Subtle grain overlay */}
      <svg style={{ position: "fixed", width: 0, height: 0 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves={3} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </svg>
      <div
        style={{
          position: "fixed", inset: 0, opacity: 0.025,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
          pointerEvents: "none",
        }}
      />

      {/* Envelope scene */}
      <AnimatePresence mode="wait">
        {phase !== "open" && (
          <motion.div
            key="envelope-scene"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {/* Hint text — positioned ABOVE the centered envelope so it
                doesn't push the envelope off viewport center. */}
            <motion.p
              style={{
                position: "absolute",
                top: "calc(50% - min(360px, 90vw) * (240 / 360) / 2 - 2.5rem)",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: TEXT_MID,
                opacity: 0.7,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontStyle: "normal",
                whiteSpace: "nowrap",
              }}
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {phase === "idle" ? "A letter for you" : "Click to read the letter"}
            </motion.p>

            {/* Envelope — fixed/centered wrapper (never animated) so the
                envelope stays exactly at viewport center across all
                breakpoints, zoom levels, and hover/tap states. */}
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
              onClick={handleClick}
              whileHover={phase === "idle" ? { scale: 1.015 } : {}}
              whileTap={phase === "idle" ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                position: "absolute",
                inset: 0,
                cursor: "pointer",
                pointerEvents: "auto",
                transformOrigin: "50% 50%",
              }}
            >
              {/* Heart burst on click */}
              {heartBurst && HEART_DIRS.map((dir, i) => (
                <motion.div
                  key={`hb-${i}`}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                  animate={{ opacity: 1, x: dir.x, y: dir.y, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    marginTop: -14, marginLeft: -14,
                    width: 28, height: 28,
                    pointerEvents: "none",
                    zIndex: 50,
                  }}
                >
                  <svg viewBox="0 0 28 28" width="28" height="28" style={{ display: "block" }}>
                    <path
                      d="M14 24 C14 24 3 16.5 3 9.5 C3 6.4 5.4 4 8.5 4 C10.5 4 12.2 5.1 13.1 6.7 C13.5 7.4 14.5 7.4 14.9 6.7 C15.8 5.1 17.5 4 19.5 4 C22.6 4 25 6.4 25 9.5 C25 16.5 14 24 14 24 Z"
                      fill={HEART_FILL}
                      stroke={HEART_STROKE}
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
              ))}

              {/* Envelope body */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "6px",
                  background: ENVELOPE_BASE,
                  border: `2px solid rgba(160,80,110,0.55)`,
                  overflow: "hidden",
                  zIndex: 10,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6), 0 28px 48px rgba(100,40,70,0.28), 0 8px 16px rgba(100,40,70,0.16)",
                }}
              >
                {/* Fold panels + decorative details */}
                <svg
                  viewBox="0 0 360 240"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="lgLeft" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#E0A8C0" />
                      <stop offset="100%" stopColor="#F0CAD8" />
                    </linearGradient>
                    <linearGradient id="lgRight" x1="100%" y1="50%" x2="0%" y2="50%">
                      <stop offset="0%" stopColor="#E0A8C0" />
                      <stop offset="100%" stopColor="#F5D5E5" />
                    </linearGradient>
                    {/* Shadow strips along side seams */}
                    <linearGradient id="seamShadowL" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(100,30,60,0.18)" />
                      <stop offset="100%" stopColor="rgba(100,30,60,0)" />
                    </linearGradient>
                    <linearGradient id="seamShadowR" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="rgba(100,30,60,0.18)" />
                      <stop offset="100%" stopColor="rgba(100,30,60,0)" />
                    </linearGradient>
                    <linearGradient id="lgBottom" x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="#D9A0BC" />
                      <stop offset="100%" stopColor="#EDB8CE" />
                    </linearGradient>
                  </defs>

                  {/* Bottom fold panel */}
                  <polygon points="0,240 360,240 180,120" fill="url(#lgBottom)" />
                  {/* Side fold panels */}
                  <polygon points="0,0 0,240 180,120" fill="url(#lgLeft)" />
                  <polygon points="360,0 360,240 180,120" fill="url(#lgRight)" />

                  {/* Seam shadow strips — sides only */}
                  <polygon points="0,0 0,240 22,218 22,22" fill="url(#seamShadowL)" opacity="0.7" />
                  <polygon points="360,0 360,240 338,218 338,22" fill="url(#seamShadowR)" opacity="0.7" />

                  {/* V-shaped flap crease lines — top corners to center only */}
                  <line x1="0" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.2" />
                  <line x1="360" y1="0" x2="180" y2="120" stroke="rgba(140,70,100,0.35)" strokeWidth="1.2" />

                  {/* Decorative inner border */}
                  <rect x="8" y="8" width="344" height="224" fill="none" stroke="rgba(190,120,150,0.50)" strokeWidth="0.9" rx="3" />
                  <rect x="12" y="12" width="336" height="216" fill="none" stroke="rgba(220,165,185,0.35)" strokeWidth="0.6" rx="2" />

                  {/* Postage stamp — top right */}
                  <g transform="translate(280, 16)">
                    <rect width="60" height="70" fill="#FFF8F2" stroke="rgba(180,110,140,0.70)" strokeWidth="1.2" rx="2" />
                    {/* Perforated dashed inner frame */}
                    <rect x="5" y="5" width="50" height="60" fill="none" stroke="rgba(200,140,160,0.55)" strokeWidth="0.7" strokeDasharray="2.5,2" rx="1" />
                    {/* Heart illustration inside stamp */}
                    <path d="M30 51 C 22 43, 19 37, 21 31.5 C 23 27, 27.5 26.5, 30 30.5 C 32.5 26.5, 37 27, 39 31.5 C 41 37, 38 43, 30 51 Z" fill="#C0607A" opacity="0.80" />
                    {/* Small shine on stamp heart */}
                    <ellipse cx="26" cy="34" rx="2.5" ry="1.6" fill="white" opacity="0.30" transform="rotate(-20 26 34)" />
                    {/* Stamp denomination line */}
                    <rect x="10" y="57" width="40" height="4" rx="1" fill="rgba(180,110,140,0.20)" />
                  </g>

                  {/* Bottom-left corner rose */}
                  <g transform="translate(26, 210)">
                    <ellipse cx="0" cy="-8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" />
                    <ellipse cx="8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(90 8 0)" />
                    <ellipse cx="0" cy="8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" transform="rotate(180)" />
                    <ellipse cx="-8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(270 -8 0)" />
                    <circle cx="0" cy="0" r="4" fill="#F0C5D5" opacity="0.75" />
                    <circle cx="0" cy="0" r="1.8" fill="#C88090" opacity="0.60" />
                  </g>
                  {/* Bottom-right corner rose */}
                  <g transform="translate(334, 210)">
                    <ellipse cx="0" cy="-8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" />
                    <ellipse cx="8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(90 8 0)" />
                    <ellipse cx="0" cy="8" rx="3.5" ry="5" fill="#E8B0C8" opacity="0.55" transform="rotate(180)" />
                    <ellipse cx="-8" cy="0" rx="5" ry="3.5" fill="#E8B0C8" opacity="0.55" transform="rotate(270 -8 0)" />
                    <circle cx="0" cy="0" r="4" fill="#F0C5D5" opacity="0.75" />
                    <circle cx="0" cy="0" r="1.8" fill="#C88090" opacity="0.60" />
                  </g>
                </svg>

              </div>

              {/* Letter peeking while opening */}
              {phase === "opening" && (
                <motion.div
                  initial={{ y: 0, zIndex: 0 }}
                  animate={{ y: -155, zIndex: 5 }}
                  transition={{
                    y: { delay: 1.6, duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                    zIndex: { delay: 1.5, duration: 0 },
                  }}
                  style={{
                    position: "absolute",
                    top: "20%",
                    left: "10%",
                    right: "10%",
                    height: "75%",
                    background: PAPER_BG,
                    borderRadius: "3px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "14px 16px 0", textAlign: "center" }}>
                    <span style={{
                      fontFamily: "'Caveat', 'Dancing Script', cursive",
                      fontSize: "clamp(16px, 4.5vw, 21px)",
                      color: TEXT_DARK,
                      opacity: 0.75,
                      letterSpacing: "0.03em",
                    }}>
                      For my special person
                    </span>
                  </div>
                </motion.div>
              )}

              {/* 3D flap — stays at z:20 while opening (above body), drops to z:0 after flap finishes so letter can rise above it. State-driven swap so the timing is reliable. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  perspective: "600px",
                  transformStyle: "preserve-3d",
                  zIndex: flapBehind ? 0 : 20,
                }}
              >
                <EnvelopeFlap isOpen={isOpen} />
              </div>

            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full letter reveal */}
      <AnimatePresence>
        {phase === "open" && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "min(560px, 94vw)",
              background:
                "radial-gradient(ellipse at 50% 0%, #FBF3E6 0%, #F4E8D2 60%, #ECDCC0 100%)",
              padding: "clamp(2.5rem, 7vw, 4rem) clamp(1.75rem, 5vw, 3rem) clamp(2.5rem, 7vw, 4rem)",
              boxShadow:
                "0 24px 60px rgba(90,70,110,0.35), 0 8px 20px rgba(90,70,110,0.18), inset 0 0 80px rgba(220,195,150,0.25)",
              position: "relative",
              borderRadius: "6px",
            }}
          >
            {/* Decorative double border frame */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "12px",
                pointerEvents: "none",
                border: "2px solid rgba(160,120,70,0.7)",
                borderRadius: "4px",
                boxShadow: "inset 0 0 0 1px rgba(255,245,220,0.6)",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "20px",
                pointerEvents: "none",
                border: "1px solid rgba(160,120,70,0.5)",
                borderRadius: "2px",
              }}
            />

            {/* Ornamental corner flourishes */}
            {([
              { pos: { top: 4, left: 4 }, rotate: 0 },
              { pos: { top: 4, right: 4 }, rotate: 90 },
              { pos: { bottom: 4, right: 4 }, rotate: 180 },
              { pos: { bottom: 4, left: 4 }, rotate: 270 },
            ] as const).map((item, i) => (
              <svg
                key={i}
                aria-hidden
                width="36"
                height="36"
                viewBox="0 0 36 36"
                style={{
                  position: "absolute",
                  ...item.pos,
                  transform: `rotate(${item.rotate}deg)`,
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              >
                <path
                  d="M3 18 Q3 3 18 3 M3 11 Q11 11 11 3 M8 18 Q8 8 18 8"
                  fill="none"
                  stroke="rgba(160,120,70,0.9)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="7" cy="7" r="1.3" fill="rgba(160,120,70,0.9)" />
              </svg>
            ))}


            {/* Pearl ribbon bows — top corners */}
            <img
              src={pearlBow}
              alt=""
              aria-hidden
              loading="lazy"
              style={{
                position: "absolute",
                top: -18,
                left: -10,
                width: 110,
                height: 110,
                transform: "rotate(-18deg)",
                filter: "drop-shadow(0 4px 8px rgba(80,60,40,0.25))",
                pointerEvents: "none",
                zIndex: 4,
              }}
            />
            <img
              src={pearlBow}
              alt=""
              aria-hidden
              loading="lazy"
              style={{
                position: "absolute",
                top: -18,
                right: -10,
                width: 110,
                height: 110,
                transform: "scaleX(-1) rotate(-18deg)",
                filter: "drop-shadow(0 4px 8px rgba(80,60,40,0.25))",
                pointerEvents: "none",
                zIndex: 4,
              }}
            />

            {/* Scattered rose petals */}
            <img src={rosePetal} alt="" aria-hidden loading="lazy"
              style={{ position: "absolute", top: "22%", right: -14, width: 64, height: 64, transform: "rotate(35deg)", pointerEvents: "none", zIndex: 3, filter: "drop-shadow(0 3px 6px rgba(80,30,50,0.25))" }} />
            <img src={rosePetal} alt="" aria-hidden loading="lazy"
              style={{ position: "absolute", top: "34%", right: 18, width: 48, height: 48, transform: "rotate(-15deg)", pointerEvents: "none", zIndex: 3, opacity: 0.9 }} />
            <img src={rosePetal} alt="" aria-hidden loading="lazy"
              style={{ position: "absolute", bottom: "26%", left: -10, width: 56, height: 56, transform: "rotate(-40deg)", pointerEvents: "none", zIndex: 3, filter: "drop-shadow(0 3px 6px rgba(80,30,50,0.25))" }} />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{
                textAlign: "center",
                margin: "0 0 1.5rem",
                position: "relative",
                zIndex: 2,
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(48px, 8vw, 72px)",
                  fontFamily: "'Pinyon Script', 'Great Vibes', cursive",
                  fontStyle: "italic",
                  color: "#DC2626",
                  margin: 0,
                  lineHeight: 1.05,
                  letterSpacing: "1px",
                  textShadow: "0 1px 0 rgba(255,255,255,0.3)",
                }}
              >
                Love letter
              </h2>
              <div
                aria-hidden
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <span style={{ flex: "0 1 90px", height: "1px", background: "linear-gradient(to right, transparent, rgba(160,120,70,0.7), rgba(160,120,70,0.7))" }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(160,120,70,0.7)" }} />
                <span style={{ flex: "0 1 90px", height: "1px", background: "linear-gradient(to left, transparent, rgba(160,120,70,0.7), rgba(160,120,70,0.7))" }} />
              </div>
            </motion.div>

            {/* Top-right vintage silver frame with photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 6 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              style={{
                float: "right",
                width: "44%",
                maxWidth: 200,
                aspectRatio: "4 / 5",
                marginLeft: 16,
                marginBottom: 12,
                marginTop: 4,
                position: "relative",
                shapeOutside: "margin-box",
                filter: "drop-shadow(0 10px 18px rgba(60,40,80,0.30))",
                zIndex: 2,
              }}
            >
              <div style={{ position: "absolute", top: "25%", left: "23.5%", right: "23.5%", bottom: "17.5%", overflow: "hidden", borderRadius: "3px", zIndex: 0, background: "rgba(255,255,255,0.35)" }}>
                <img src={frameImg0} alt="Memory" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transform: "scale(0.985)", transformOrigin: "center" }} />
              </div>
              <img src={silverFrameRect} alt="" aria-hidden loading="lazy" style={{ position: "relative", width: "100%", height: "100%", display: "block", zIndex: 1, pointerEvents: "none" }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ fontSize: "clamp(22px, 3.4vw, 28px)", color: TEXT_DARK, marginBottom: "1rem", fontFamily: "'Caveat', 'Dancing Script', cursive", lineHeight: 1.6, position: "relative", zIndex: 2, textDecoration: "underline", textDecorationColor: "rgba(160,120,70,0.35)", textDecorationThickness: "1px", textUnderlineOffset: "6px" }}
            >
              My Dearest,
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.55 }}
              style={{ fontSize: "clamp(18px, 2.6vw, 22px)", color: TEXT_DARK, lineHeight: 1.8, marginBottom: "1.25rem", fontFamily: "'Caveat', 'Dancing Script', cursive", position: "relative", zIndex: 2, textDecoration: "underline", textDecorationColor: "rgba(160,120,70,0.35)", textDecorationThickness: "1px", textUnderlineOffset: "6px" }}
            >
              {para0}
            </motion.p>

            {/* Bottom-left oval silver frame with photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              style={{
                float: "left",
                width: "42%",
                maxWidth: 190,
                aspectRatio: "4 / 5",
                marginRight: 16,
                marginBottom: 12,
                marginTop: 8,
                position: "relative",
                shapeOutside: "margin-box",
                filter: "drop-shadow(0 10px 18px rgba(60,40,80,0.30))",
                zIndex: 2,
              }}
            >
              <div style={{ position: "absolute", top: "20.5%", left: "21.75%", right: "21.75%", bottom: "19.75%", overflow: "hidden", borderRadius: "999px", clipPath: "ellipse(50% 50% at 50% 50%)", zIndex: 0, background: "rgba(255,255,255,0.28)" }}>
                <img src={frameImg1} alt="Memory" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transform: "scale(0.985)", transformOrigin: "center" }} />
              </div>
              <img src={silverFrameOval} alt="" aria-hidden loading="lazy" style={{ position: "relative", width: "100%", height: "100%", display: "block", zIndex: 1, pointerEvents: "none" }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.55 }}
              style={{ fontSize: "clamp(18px, 2.6vw, 22px)", color: TEXT_DARK, lineHeight: 1.8, marginBottom: "1.25rem", fontFamily: "'Caveat', 'Dancing Script', cursive", position: "relative", zIndex: 2, textDecoration: "underline", textDecorationColor: "rgba(160,120,70,0.35)", textDecorationThickness: "1px", textUnderlineOffset: "6px" }}
            >
              {para1}
            </motion.p>

            {/* Remaining lines — clear floats, each line on its own */}
            {tailParas.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.55 }}
                style={{ fontSize: "clamp(18px, 2.6vw, 22px)", color: TEXT_DARK, lineHeight: 1.8, marginBottom: "1rem", fontFamily: "'Caveat', 'Dancing Script', cursive", clear: i === 0 ? "both" : undefined, position: "relative", zIndex: 2, textDecoration: "underline", textDecorationColor: "rgba(160,120,70,0.35)", textDecorationThickness: "1px", textUnderlineOffset: "6px" }}
              >
                {line}
              </motion.p>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.5 }}
              style={{ marginTop: "1rem", position: "relative", zIndex: 2, textAlign: "right" }}
            >
              <p style={{ fontSize: "clamp(20px, 2.6vw, 22px)", color: TEXT_DARK, fontFamily: "'Caveat', 'Dancing Script', cursive", marginBottom: "0.2rem", opacity: 0.85 }}>
                {closing}
              </p>
              <p
                style={{
                  fontSize: "clamp(32px, 5vw, 40px)",
                  color: TEXT_DARK,
                  fontFamily: "'Pinyon Script', 'Dancing Script', cursive",
                  fontStyle: "italic",
                  lineHeight: 1.1,
                }}
              >
                {signature}
              </p>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          opacity: 0.35,
        }}
      >
        <Wand2 size={12} color={TEXT_MID} />
        <span style={{
          fontSize: "11px",
          color: TEXT_MID,
          fontFamily: "'Helvetica Neue', sans-serif",
          letterSpacing: "0.1em",
        }}>
          click to open
        </span>
      </motion.div>
    </motion.div>
  );
}
