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

const SealSVG = ({ isOpen }: { isOpen: boolean; initial?: string }) => (
  <motion.div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 20,
      width: 56,
      height: 56,
      cursor: "pointer",
      pointerEvents: "none",
    }}
    animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.4 : 1 }}
    transition={{ duration: 0.25, ease: "easeIn" }}
  >
    <svg viewBox="-15 -4.5 30 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <path
        d="M 0 8 m -9 -3 a 5.5 5.5 0 1 1 9 -3 a 5.5 5.5 0 1 1 9 3 q 0 6.5 -9 13 q -9 -6.5 -9 -13 z"
        fill={HEART_OUTER}
        stroke={ENVELOPE_DARK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M 0 11 m -5 -1.6 a 3 3 0 1 1 5 -1.6 a 3 3 0 1 1 5 1.6 q 0 3.5 -5 7.2 q -5 -3.7 -5 -7.2 z"
        fill={HEART_INNER}
      />
    </svg>
  </motion.div>
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
        rotateX: isOpen ? -172 : 0,
      }}
      transition={{
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
        delay: 0.05,
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
          fill={FLAP_COLOR}
          stroke={ENVELOPE_DARK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
};

type Phase = "idle" | "opening" | "open";

export default function EnvelopeReveal({ receiverName, onContinue }: EnvelopeRevealProps) {
  const [phase, setPhase] = useState<Phase>("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    sounds.envelopeOpen();
    setPhase("opening");
    setTimeout(() => setPhase("open"), 900);
  };

  const handleClose = () => {
    setPhase("idle");
    onContinue();
  };

  const isOpen = phase === "open" || phase === "opening";
  const initial = (receiverName || "♥").trim().slice(0, 1).toUpperCase();

  return (
    <div
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
          >
            {/* Hint text */}
            <motion.p
              style={{
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: TEXT_MID,
                opacity: 0.7,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontStyle: "normal",
                marginBottom: "0.5rem",
              }}
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {phase === "idle" ? `For ${receiverName}` : "Opening…"}
            </motion.p>

            {/* Envelope */}
            <motion.div
              onClick={handleClick}
              whileHover={phase === "idle" ? { scale: 1.015, y: -4 } : {}}
              whileTap={phase === "idle" ? { scale: 0.98 } : {}}
              style={{
                position: "relative",
                width: "min(360px, 90vw)",
                aspectRatio: "360 / 240",
                cursor: phase === "idle" ? "pointer" : "default",
                perspective: "800px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Drop shadow */}
              <div
                style={{
                  position: "absolute",
                  inset: "8px 12px -12px 12px",
                  borderRadius: "6px",
                  background: "rgba(120,110,90,0.18)",
                  filter: "blur(16px)",
                  zIndex: 0,
                }}
              />

              {/* Envelope body */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "6px",
                  background: ENVELOPE_BODY,
                  border: `2.5px solid ${ENVELOPE_DARK}`,
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                <svg
                  viewBox="0 0 360 240"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  preserveAspectRatio="none"
                >
                  {/* Bottom-right panel — lighter (light from right) */}
                  <path d="M 360 240 L 180 120 L 360 0 Z" fill={ENVELOPE_LIGHT} />
                  {/* Bottom-left panel — base shaded pink */}
                  <path d="M 0 240 L 180 120 L 0 0 Z" fill={ENVELOPE_BODY} />
                  {/* Bottom V fold seam — two panels meeting at center */}
                  <path
                    d="M 0 240 L 180 120 L 360 240"
                    fill="none"
                    stroke={ENVELOPE_DARK}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Letter peeking while opening */}
              {phase === "opening" && (
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: -90 }}
                  transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    top: "20%",
                    left: "10%",
                    right: "10%",
                    height: "75%",
                    background: PAPER_BG,
                    borderRadius: "3px",
                    zIndex: 5,
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

              {/* 3D flap */}
              <div style={{ position: "absolute", inset: 0, zIndex: 10, perspective: "600px", transformStyle: "preserve-3d" }}>
                <EnvelopeFlap isOpen={isOpen} />
              </div>

              {/* Wax seal */}
              <SealSVG isOpen={isOpen} initial={initial} />
            </motion.div>
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
    </div>
  );
}
