import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface EnvelopeRevealProps {
  receiverName: string;
  onContinue: () => void;
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
        <polygon
          points="0,0 360,0 180,180"
          fill="url(#flapGrad)"
          stroke="rgba(140,70,100,0.45)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Subtle inner highlight near top edge */}
        <line x1="20" y1="4" x2="340" y2="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      </svg>
      <SealSVG />
    </motion.div>
  );
};

type Phase = "idle" | "opening" | "open";

export default function EnvelopeReveal({ receiverName, onContinue }: EnvelopeRevealProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [flapBehind, setFlapBehind] = useState(false);

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

  const handleClick = () => {
    if (phase === "idle") {
      sounds.envelopeOpen();
      setPhase("opening");
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
        position: "fixed",
        inset: 0,
        zIndex: 50,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 40%, #F5EDF2 0%, #EDE5EA 100%)",
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "2rem",
        overflow: "hidden",
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
              {phase === "idle" ? `For ${receiverName}` : "Click to read the letter"}
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

                {/* Recipient name — centered on envelope body (below the flap crease) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: "30%",
                    gap: "4px",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Dancing Script', cursive",
                      fontSize: "clamp(26px, 8vw, 42px)",
                      color: "#5C1832",
                      letterSpacing: "0.02em",
                      lineHeight: 1.1,
                      textShadow: "0 1px 6px rgba(92,24,50,0.20)",
                    }}
                  >
                    {receiverName}
                  </span>
                  {/* Decorative underline flourish */}
                  <svg viewBox="0 0 120 12" style={{ width: "clamp(80px, 22vw, 120px)", marginTop: "2px", opacity: 0.35 }}>
                    <path d="M10 6 Q 30 2, 60 6 Q 90 10, 110 6" fill="none" stroke="#9B5570" strokeWidth="1" />
                    <circle cx="4" cy="6" r="2" fill="#9B5570" />
                    <circle cx="116" cy="6" r="2" fill="#9B5570" />
                  </svg>
                </div>
              </div>

              {/* Letter peeking while opening */}
              {phase === "opening" && (
                <motion.div
                  initial={{ y: 0, zIndex: 0 }}
                  animate={{ y: -90, zIndex: 5 }}
                  transition={{
                    y: { delay: 1.6, duration: 1.0, ease: [0.22, 1, 0.36, 1] },
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
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ width: 60, height: 3, background: TEXT_MID, opacity: 0.2, borderRadius: 2, margin: "0 auto 8px" }} />
                    <div style={{ width: 80, height: 3, background: TEXT_MID, opacity: 0.15, borderRadius: 2, margin: "0 auto 8px" }} />
                    <div style={{ width: 50, height: 3, background: TEXT_MID, opacity: 0.1, borderRadius: 2, margin: "0 auto" }} />
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
              width: "min(520px, 92vw)",
              background: PAPER_BG,
              borderRadius: "4px",
              padding: "clamp(2rem, 6vw, 3.5rem)",
              boxShadow: "0 8px 48px rgba(100,90,70,0.15), 0 2px 8px rgba(100,90,70,0.1)",
              position: "relative",
              border: `1px solid rgba(180,165,140,0.35)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(180,165,140,0.12) 27px, rgba(180,165,140,0.12) 28px)",
                backgroundPositionY: "64px",
                borderRadius: "4px",
                pointerEvents: "none",
              }}
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                fontSize: "clamp(26px, 4vw, 32px)",
                color: TEXT_DARK,
                marginBottom: "1.5rem",
                fontFamily: "'Dancing Script', cursive",
                lineHeight: 1.3,
              }}
            >
              {letterContent.greeting}
            </motion.p>

            {letterContent.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.55, ease: "easeOut" }}
                style={{
                  fontSize: "clamp(20px, 2.8vw, 24px)",
                  color: TEXT_DARK,
                  lineHeight: 1.6,
                  marginBottom: i < letterContent.paragraphs.length - 1 ? "1.2rem" : "2rem",
                  fontFamily: "'Dancing Script', cursive",
                  opacity: 0.92,
                }}
              >
                {p}
              </motion.p>
            ))}

            {/* Photo placeholders */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                margin: "1.5rem 0 2rem",
              }}
            >
              {["Photo 1", "Photo 2", "Photo 3"].map((label, i) => (
                <div
                  key={label}
                  style={{
                    aspectRatio: "3 / 4",
                    background: "linear-gradient(160deg, #F5EBDC, #E8D9C3)",
                    border: "1px dashed rgba(120,95,60,0.5)",
                    borderRadius: "2px",
                    boxShadow: "0 4px 10px rgba(80,60,30,0.12), inset 0 0 20px rgba(180,150,110,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `rotate(${(i - 1) * 2}deg)`,
                    fontFamily: "'Dancing Script', cursive",
                    fontSize: "clamp(16px, 2vw, 20px)",
                    color: TEXT_MID,
                  }}
                >
                  {label}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.5 }}
              style={{ marginTop: "1rem" }}
            >
              <p style={{ fontSize: "clamp(20px, 2.6vw, 22px)", color: TEXT_DARK, fontFamily: "'Dancing Script', cursive", marginBottom: "0.4rem", opacity: 0.85 }}>
                {letterContent.closing}
              </p>
              <p
                style={{
                  fontSize: "clamp(32px, 5vw, 40px)",
                  color: TEXT_DARK,
                  fontFamily: "'Dancing Script', cursive",
                  marginLeft: "8px",
                  lineHeight: 1.1,
                }}
              >
                {letterContent.signature}
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "1.2rem",
                right: "1.2rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: TEXT_MID,
                opacity: 0.45,
                fontSize: "20px",
                lineHeight: 1,
                padding: "4px 8px",
                fontFamily: "sans-serif",
                transition: "opacity 0.2s",
                borderRadius: "3px",
              }}
              whileHover={{ opacity: 0.9 }}
              aria-label="Close letter"
            >
              ×
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}
            >
              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: `1px solid ${TEXT_DARK}`,
                  color: TEXT_DARK,
                  padding: "10px 28px",
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  cursor: "pointer",
                  borderRadius: "2px",
                  transition: "background 0.25s, color 0.25s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = TEXT_DARK; e.currentTarget.style.color = PAPER_BG; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = TEXT_DARK; }}
              >
                Continue
              </button>
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
