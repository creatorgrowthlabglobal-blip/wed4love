import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  voiceMessageUrl?: string | null;
  showWatermark?: boolean;
  onContinue: () => void;
  onLetterOpen?: () => void;
}

const PAPER_BG = "#FDF8EC";
const ENVELOPE_BASE = "#F7F0D8";    // warm ivory face
const ENV_LEFT = "#C9A455";         // left fold panel — champagne gold
const ENV_RIGHT = "#D4B870";        // right fold panel — lighter champagne
const ENV_BOTTOM = "#B89030";       // bottom fold panel — deep champagne
const ENVELOPE_MID = "#D4AF72";     // flap / compat
const ENVELOPE_DARK = "#1a1a1a";
const FLAP_COLOR = "#D4AF72";
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
      bottom: "clamp(-36px, -5vw, -22px)",
      left: "50%",
      transform: "translateX(-50%)",
      width: "clamp(44px, 10vw, 72px)",
      height: "clamp(44px, 10vw, 72px)",
      pointerEvents: "none",
      filter: "drop-shadow(0 5px 12px rgba(60,40,5,0.50)) drop-shadow(0 2px 4px rgba(0,0,0,0.28))",
    }}
  >
    <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="sealGold" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F0D080" />
          <stop offset="50%" stopColor="#C9A030" />
          <stop offset="100%" stopColor="#8B6A10" />
        </radialGradient>
        <radialGradient id="sealInner" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#D4A828" />
          <stop offset="100%" stopColor="#7A5508" />
        </radialGradient>
      </defs>
      {/* Sunburst outer ring — 20 short rays */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i * 360) / 20;
        const r1 = 33, r2 = 36;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const x1 = 36 + r1 * Math.cos(toRad(a)), y1 = 36 + r1 * Math.sin(toRad(a));
        const x2 = 36 + r2 * Math.cos(toRad(a - 4)), y2 = 36 + r2 * Math.sin(toRad(a - 4));
        const x3 = 36 + r2 * Math.cos(toRad(a + 4)), y3 = 36 + r2 * Math.sin(toRad(a + 4));
        return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="#8B6A10" />;
      })}
      {/* Outer disc */}
      <circle cx="36" cy="36" r="32" fill="url(#sealGold)" />
      {/* Mid ring — thin dark separator */}
      <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(90,60,5,0.5)" strokeWidth="1.2" />
      {/* Thin cream ring */}
      <circle cx="36" cy="36" r="25" fill="none" stroke="rgba(255,245,200,0.55)" strokeWidth="1" />
      {/* Inner disc */}
      <circle cx="36" cy="36" r="23" fill="url(#sealInner)" />
      {/* Fine inner border */}
      <circle cx="36" cy="36" r="20" fill="none" stroke="rgba(255,240,180,0.35)" strokeWidth="0.7" />
      {/* Heart — deep burgundy on gold */}
      <path
        d="M36 50 C 24 41, 20 33, 23 26.5 C 25.5 21.5, 31 21, 36 26 C 41 21, 46.5 21.5, 49 26.5 C 52 33, 48 41, 36 50 Z"
        fill="#6B1228"
      />
      {/* Heart shine */}
      <ellipse cx="30" cy="30" rx="4" ry="2.5" fill="white" opacity="0.18" transform="rotate(-25 30 30)" />
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
            <stop offset="0%" stopColor="#F5EDD5" />
            <stop offset="60%" stopColor="#D8B560" />
            <stop offset="100%" stopColor="#C09030" />
          </linearGradient>
        </defs>
        <path
          d="M 0,0 L 180,180 L 360,0"
          fill="url(#flapGrad)"
          stroke="rgba(130,95,15,0.55)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <SealSVG />
    </motion.div>
  );
};

type Phase = "idle" | "opening" | "open";

export default function EnvelopeReveal({ receiverName, senderName, letterText, images, voiceMessageUrl, showWatermark = true, onContinue, onLetterOpen }: EnvelopeRevealProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [flapBehind, setFlapBehind] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const voiceAudioRef = useMemo(() => (voiceMessageUrl ? new Audio(voiceMessageUrl) : null), [voiceMessageUrl]);

  useEffect(() => {
    return () => voiceAudioRef?.pause();
  }, [voiceAudioRef]);

  const toggleVoice = () => {
    if (!voiceAudioRef) return;
    if (voicePlaying) {
      voiceAudioRef.pause();
      setVoicePlaying(false);
    } else {
      voiceAudioRef.onended = () => setVoicePlaying(false);
      voiceAudioRef.play().catch(() => setVoicePlaying(false));
      setVoicePlaying(true);
    }
  };
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const envelopeSceneSize = "min(280px, 52vw, calc(100% - 2rem))";

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

  // ── Derived text values (must be above the effects that reference them) ──
  const isUserLetter = Boolean(letterText?.trim());
  const closing = "Yours, always —";
  const signature = senderName || letterContent.signature;

  const userImages = images?.filter(Boolean) ?? [];
  const displayPhotos: string[] = isUserLetter ? userImages : [photo2, photo1];

  const bodyText = isUserLetter
    ? (letterText?.trim() ?? "")
    : [letterContent.paragraphs[0], letterContent.paragraphs[1], letterContent.paragraphs[2]].join(" ");

  // Split text at the midpoint so image 2 is interleaved further down the flow
  const bodyWords = bodyText.split(/\s+/).filter(Boolean);
  const mid = Math.floor(bodyWords.length / 2);
  const textSeg0 = displayPhotos.length >= 2 ? bodyWords.slice(0, mid).join(" ") : bodyText;
  const textSeg1 = displayPhotos.length >= 2 ? bodyWords.slice(mid).join(" ") : "";

  // Reset typewriter whenever the envelope is closed
  useEffect(() => {
    if (phase === "idle") {
      setVisibleCount(0);
      setTypingDone(false);
    }
  }, [phase]);

  // RAF-based typewriter: time-driven so it always finishes within the cap.
  // Starts 0.8 s after the letter slides in (the slide-in takes ~0.7 s).
  useEffect(() => {
    if (phase !== "open" || typingDone) return;
    const totalChars = bodyText.length;
    if (totalChars === 0) { setTypingDone(true); return; }
    // 20 ms/char, but never longer than 3.5 s for a full reveal
    const duration = Math.min(3500, totalChars * 20);
    let startTime: number | null = null;
    let rafId: number;
    const delay = setTimeout(() => {
      const tick = (now: number) => {
        if (startTime === null) startTime = now;
        const chars = Math.min(totalChars, Math.floor(((now - startTime) / duration) * totalChars));
        setVisibleCount(chars);
        if (chars < totalChars) {
          rafId = requestAnimationFrame(tick);
        } else {
          setTypingDone(true);
        }
      };
      rafId = requestAnimationFrame(tick);
    }, 800);
    return () => { clearTimeout(delay); cancelAnimationFrame(rafId); };
  }, [phase, bodyText, typingDone]);

  // Typewriter rendering helpers — split each segment into visible + transparent tail.
  // Keeping the full text in the DOM at all times prevents any layout reflow while typing.
  const seg0Shown = Math.min(textSeg0.length, visibleCount);
  const seg1Shown = Math.max(0, visibleCount - textSeg0.length - 1); // -1 for the joining space
  const seg0Typing = !typingDone && phase === "open" && visibleCount <= textSeg0.length;
  const seg1Typing = !typingDone && phase === "open" && visibleCount > textSeg0.length;
  const CURSOR_WRAP: React.CSSProperties = {
    display: "inline-block", width: 0, height: "1.1em",
    verticalAlign: "text-bottom", position: "relative",
  };
  const CURSOR_BAR: React.CSSProperties = {
    position: "absolute", left: 0, top: 0, width: 2, height: "1.1em",
    background: TEXT_DARK,
    animation: "typewriter-cursor 0.7s step-end infinite",
  };
  const TEXT_STYLE: React.CSSProperties = {
    fontSize: "clamp(18px, 2.6vw, 22px)",
    color: TEXT_DARK,
    lineHeight: 1.8,
    fontFamily: "'Caveat', 'Dancing Script', cursive",
    textDecoration: "underline",
    textDecorationColor: "rgba(160,120,70,0.35)",
    textDecorationThickness: "1px",
    textUnderlineOffset: "6px",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };
  const skipTyping = () => { setVisibleCount(bodyText.length); setTypingDone(true); };

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
        position: "absolute",
        inset: 0,
        zIndex: 50,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: phase === "open" ? "flex-start" : "center",
        background: "transparent",
        borderRadius: 0,
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "2rem",
        overflowY: phase === "open" ? "auto" : "hidden",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        isolation: "isolate",
      }}
    >
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
                top: "clamp(120px, 22%, 160px)",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "clamp(36px, 7vw, 56px)",
                fontFamily: "'Pinyon Script', cursive",
                color: "#8B6510",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                zIndex: 2,
                margin: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "idle" ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Click Me
            </motion.p>

            {/* Envelope — fixed/centered wrapper (never animated) so the
                envelope stays exactly at viewport center across all
                breakpoints, zoom levels, and hover/tap states. */}
            <div
              style={{
                position: "absolute",
                top: "55%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: envelopeSceneSize,
                maxWidth: "100%",
                maxHeight: "100%",
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
                  border: `2px solid rgba(160,120,30,0.65)`,
                  overflow: "hidden",
                  zIndex: 10,
                  boxShadow: "inset 0 0 0 1px rgba(255,248,210,0.7), 0 32px 56px rgba(60,45,5,0.30), 0 8px 20px rgba(60,45,5,0.18)",
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
                      <stop offset="0%" stopColor="#A87E20" />
                      <stop offset="100%" stopColor="#D4B060" />
                    </linearGradient>
                    <linearGradient id="lgRight" x1="100%" y1="50%" x2="0%" y2="50%">
                      <stop offset="0%" stopColor="#A87E20" />
                      <stop offset="100%" stopColor="#C9A850" />
                    </linearGradient>
                    {/* Shadow strips along side seams */}
                    <linearGradient id="seamShadowL" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(60,40,5,0.22)" />
                      <stop offset="100%" stopColor="rgba(60,40,5,0)" />
                    </linearGradient>
                    <linearGradient id="seamShadowR" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="rgba(60,40,5,0.22)" />
                      <stop offset="100%" stopColor="rgba(60,40,5,0)" />
                    </linearGradient>
                    <linearGradient id="lgBottom" x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="#8B6510" />
                      <stop offset="100%" stopColor="#C9A040" />
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
                  <line x1="0" y1="0" x2="180" y2="120" stroke="rgba(120,88,12,0.40)" strokeWidth="1.2" />
                  <line x1="360" y1="0" x2="180" y2="120" stroke="rgba(120,88,12,0.40)" strokeWidth="1.2" />

                  {/* Decorative inner border — double gold rule */}
                  <rect x="8" y="8" width="344" height="224" fill="none" stroke="rgba(170,128,30,0.60)" strokeWidth="1.0" rx="3" />
                  <rect x="13" y="13" width="334" height="214" fill="none" stroke="rgba(200,165,60,0.35)" strokeWidth="0.6" rx="2" />

                  {/* Postage stamp — top right, ivory & gold */}
                  <g transform="translate(280, 16)">
                    <rect width="60" height="70" fill="#FBF5E0" stroke="rgba(150,115,20,0.75)" strokeWidth="1.2" rx="2" />
                    {/* Perforated dashed inner frame */}
                    <rect x="5" y="5" width="50" height="60" fill="none" stroke="rgba(160,125,25,0.50)" strokeWidth="0.7" strokeDasharray="2.5,2" rx="1" />
                    {/* Crown motif inside stamp */}
                    <path d="M15 46 L15 42 L20 36 L25 42 L30 34 L35 42 L40 36 L45 42 L45 46 Z" fill="none" stroke="rgba(140,100,15,0.75)" strokeWidth="1.1" strokeLinejoin="round" />
                    <rect x="14" y="46" width="32" height="3" rx="1" fill="rgba(140,100,15,0.55)" />
                    {/* Stamp denomination line */}
                    <rect x="10" y="57" width="40" height="4" rx="1" fill="rgba(150,115,20,0.18)" />
                  </g>

                  {/* Bottom-left gold filigree ornament */}
                  <g transform="translate(26, 216)" opacity="0.75">
                    <path d="M0,-10 L2.5,-2.5 L10,0 L2.5,2.5 L0,10 L-2.5,2.5 L-10,0 L-2.5,-2.5 Z" fill="#C9A030" />
                    <circle cx="0" cy="0" r="2.5" fill="#E8C84A" />
                    <circle cx="0" cy="0" r="1" fill="#8B6510" />
                  </g>
                  {/* Bottom-right gold filigree ornament */}
                  <g transform="translate(334, 216)" opacity="0.75">
                    <path d="M0,-10 L2.5,-2.5 L10,0 L2.5,2.5 L0,10 L-2.5,2.5 L-10,0 L-2.5,-2.5 Z" fill="#C9A030" />
                    <circle cx="0" cy="0" r="2.5" fill="#E8C84A" />
                    <circle cx="0" cy="0" r="1" fill="#8B6510" />
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
                    overflow: "visible",
                  }}
                >
                  <div style={{ padding: "14px 22px 0 18px", textAlign: "center", overflow: "visible" }}>
                    <span style={{
                      fontFamily: "'Caveat', 'Dancing Script', cursive",
                      fontSize: "clamp(16px, 4.5vw, 21px)",
                      color: TEXT_DARK,
                      opacity: 0.75,
                      letterSpacing: "0.03em",
                      paddingRight: "8px",
                      display: "inline-block",
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
            key="letter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "clamp(10px, 2.5vw, 24px)",
            }}
          >
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "100%",
              maxWidth: "560px",
              minHeight: "calc(100vh - 20px)",
              flexShrink: 0,
              background: "radial-gradient(ellipse at 50% 0%, #FBF3E6 0%, #F4E8D2 60%, #ECDCC0 100%)",
              padding: "clamp(2.5rem, 7vw, 4.5rem) clamp(1.5rem, 5vw, 3rem) clamp(6rem, 12vw, 8rem)",
              position: "relative",
              margin: "0 auto",
              overflow: "visible",
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

            {/* Top photo row — first 2 photos sit at the top of the paper */}
            {displayPhotos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: displayPhotos.length >= 2 ? "1fr 1fr" : "1fr",
                  justifyItems: "center",
                  alignItems: "start",
                  gap: "clamp(10px, 2.5vw, 24px)",
                  marginBottom: "1.5rem",
                  width: "100%",
                }}
              >
                {displayPhotos.slice(0, 2).map((src, i) => {
                  const isRect = i === 0;
                  return (
                    <motion.div
                      key={`top-${i}`}
                      initial={{ opacity: 0, scale: 0.92, rotate: 0 }}
                      animate={{ opacity: 1, scale: 1, rotate: i === 0 ? -3 : 3 }}
                      transition={{ delay: 0.35 + i * 0.1, duration: 0.7 }}
                      style={{
                        width: "100%",
                        maxWidth: "240px",
                        aspectRatio: "4 / 5",
                        position: "relative",
                        filter: "drop-shadow(0 10px 18px rgba(60,40,80,0.30))",
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        ...(isRect
                          ? { top: "25%", left: "23.5%", right: "23.5%", bottom: "17.5%", borderRadius: "3px" }
                          : { top: "20.5%", left: "21.75%", right: "21.75%", bottom: "19.75%", borderRadius: "999px", clipPath: "ellipse(50% 50% at 50% 50%)" }),
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.35)",
                      }}>
                        <img src={src} alt="Memory" decoding="async"
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                      </div>
                      <img src={isRect ? silverFrameRect : silverFrameOval} alt="" aria-hidden
                        style={{ position: "relative", width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ fontSize: "clamp(22px, 3.4vw, 28px)", color: TEXT_DARK, marginBottom: "1rem", fontFamily: "'Caveat', 'Dancing Script', cursive", lineHeight: 1.6, textDecoration: "underline", textDecorationColor: "rgba(160,120,70,0.35)", textDecorationThickness: "1px", textUnderlineOffset: "6px" }}
            >
              My Dearest,
            </motion.p>

            {/* Letter body — full text flowing below the top photos */}
            <div
              className="break-words [word-break:break-word] [overflow-wrap:anywhere]"
              style={{ position: "relative", zIndex: 2 }}
            >
              <span style={TEXT_STYLE}>
                {bodyText.slice(0, visibleCount)}
                {!typingDone && phase === "open" && <span style={CURSOR_WRAP}><span style={CURSOR_BAR} /></span>}
                <span style={{ color: "transparent" }}>{bodyText.slice(visibleCount)}</span>
              </span>
            </div>

            {/* Extra photos (3rd onward) — grid below the letter body */}
            {displayPhotos.length > 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                style={{
                  marginTop: "2rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "clamp(10px, 2.5vw, 18px)",
                  width: "100%",
                }}
              >
                {displayPhotos.slice(2).map((src, i) => (
                  <motion.div
                    key={`extra-${i}`}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -2 : 2 }}
                    transition={{ delay: 0.7 + i * 0.08, duration: 0.55 }}
                    style={{
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      borderRadius: "4px",
                      background: "#FFF",
                      padding: "8px 8px 28px",
                      boxShadow: "0 8px 16px rgba(60,40,80,0.22)",
                    }}
                  >
                    <img src={src} alt="Memory" decoding="async"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </motion.div>
                ))}
              </motion.div>
            )}


            {/* Skip button — visible only while typewriter is in progress */}
            {!typingDone && phase === "open" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                style={{ textAlign: "right", marginTop: "0.75rem" }}
              >
                <button
                  onClick={skipTyping}
                  style={{
                    background: "rgba(160,120,70,0.08)",
                    border: "1px solid rgba(160,120,70,0.35)",
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontFamily: "'Caveat', 'Dancing Script', cursive",
                    fontSize: "clamp(14px, 2vw, 16px)",
                    color: TEXT_MID,
                    cursor: "pointer",
                    letterSpacing: "0.03em",
                  }}
                >
                  Skip ▶
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.5 }}
              style={{ marginTop: "2.5rem", textAlign: "right" }}
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

            {showWatermark && typingDone && (
              <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "11px", color: TEXT_MID, opacity: 0.55, fontFamily: "'Inter', sans-serif" }}>
                Sent with Wish4Love 💌
              </p>
            )}

            {/* Voice message — only appears once the letter has finished "writing" itself */}
            {typingDone && voiceAudioRef && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ marginTop: "2rem", textAlign: "center" }}
              >
                <button
                  onClick={toggleVoice}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(200,80,120,0.1)",
                    border: "1px solid rgba(200,80,120,0.35)",
                    borderRadius: "24px",
                    padding: "10px 24px",
                    fontFamily: "'Caveat', 'Dancing Script', cursive",
                    fontSize: "clamp(18px, 2.6vw, 22px)",
                    color: TEXT_DARK,
                    cursor: "pointer",
                    letterSpacing: "0.03em",
                  }}
                >
                  {voicePlaying ? "⏸" : "▶"} Hear their voice
                </button>
              </motion.div>
            )}


          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
