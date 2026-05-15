import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface EnvelopeRevealProps {
  receiverName: string;
  onContinue: () => void;
}

const PAPER_BG = "#F9F7F2";
const ENVELOPE_BODY = "#EDB6CC";   // base pink (left-shaded)
const ENVELOPE_MID = "#F5C9DA";    // mid pink (bottom fold)
const ENVELOPE_LIGHT = "#FBE3EC";  // lighter pink highlight
const ENVELOPE_DARK = "#1a1a1a";   // ink outline
const FLAP_COLOR = "#F4CADB";      // top flap pink
const TEXT_DARK = "#2C2A25";
const TEXT_MID = "#6B6456";
const HEART_OUTER = "#F1A9C2";
const HEART_INNER = "#E87FA3";

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
      bottom: -32,
      left: "50%",
      width: 64,
      height: 64,
      marginLeft: -32,
      pointerEvents: "none",
      filter: "drop-shadow(0 3px 5px rgba(80,30,50,0.28)) drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
    }}
  >
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      <circle cx="32" cy="32" r="24" fill="#C76486" />
      <path
        d="M32 44 C 22 36, 19 30, 22 25 C 24.5 21, 29.5 22, 32 26 C 34.5 22, 39.5 21, 42 25 C 45 30, 42 36, 32 44 Z"
        fill="#FFE8F0"
      />
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
        delay: 0.1,
      }}
    >
      <svg
        viewBox="0 0 360 180"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <polygon
          points="0,0 360,0 180,180"
          fill={ENVELOPE_MID}
          stroke={ENVELOPE_DARK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <SealSVG />
    </motion.div>
  );
};

type Phase = "idle" | "opening" | "open";

export default function EnvelopeReveal({ receiverName, onContinue }: EnvelopeRevealProps) {
  const [phase, setPhase] = useState<Phase>("idle");

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
        background: "#F2EFE8",
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
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              style={{
                position: "absolute",
                inset: 0,
                cursor: "pointer",
                pointerEvents: "auto",
                transformOrigin: "50% 50%",
              }}
            >
              {/* Drop shadow */}
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

              {/* Envelope body */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "6px",
                  background: ENVELOPE_MID,
                  border: `2.5px solid ${ENVELOPE_DARK}`,
                  overflow: "hidden",
                  zIndex: 10,
                }}
              >
                <svg
                  viewBox="0 0 360 240"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  preserveAspectRatio="none"
                />

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

              {/* 3D flap — z:20 while opening (above body), drops to z:0 once flap finishes so letter can rise above it */}
              <motion.div
                initial={{ zIndex: 20 }}
                animate={{ zIndex: isOpen ? 0 : 20 }}
                transition={{ zIndex: { delay: isOpen ? 1.5 : 0, duration: 0 } }}
                style={{ position: "absolute", inset: 0, perspective: "600px", transformStyle: "preserve-3d" }}
              >
                <EnvelopeFlap isOpen={isOpen} />
              </motion.div>

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
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                fontSize: "12px",
                color: TEXT_MID,
                opacity: 0.65,
                fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
                fontStyle: "normal",
                letterSpacing: "0.08em",
                marginBottom: "2rem",
                textAlign: "right",
              }}
            >
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                fontSize: "clamp(17px, 2.5vw, 20px)",
                color: TEXT_DARK,
                marginBottom: "1.5rem",
                fontStyle: "italic",
                lineHeight: 1.5,
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
                  fontSize: "clamp(14px, 2vw, 16px)",
                  color: TEXT_DARK,
                  lineHeight: 1.85,
                  marginBottom: i < letterContent.paragraphs.length - 1 ? "1.2rem" : "2rem",
                  opacity: 0.88,
                }}
              >
                {p}
              </motion.p>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              style={{ marginTop: "1rem" }}
            >
              <p style={{ fontSize: "15px", color: TEXT_DARK, fontStyle: "italic", marginBottom: "0.4rem", opacity: 0.8 }}>
                {letterContent.closing}
              </p>
              <p
                style={{
                  fontSize: "clamp(22px, 4vw, 28px)",
                  color: TEXT_DARK,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  marginLeft: "8px",
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
