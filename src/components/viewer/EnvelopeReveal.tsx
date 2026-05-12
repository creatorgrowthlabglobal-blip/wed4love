import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface EnvelopeRevealProps {
  receiverName: string;
  onContinue: () => void;
}

const PAPER_BG = "#F9F7F2";
const ENVELOPE_BODY = "#E8E3D9";
const ENVELOPE_DARK = "#C9C1B0";
const FLAP_COLOR = "#DDD8CC";
const TEXT_DARK = "#2C2A25";
const TEXT_MID = "#6B6456";
const WAX_RED = "#8B2E2E";

type Phase = "idle" | "opening" | "open";

const SealSVG = ({ isOpen, initial }: { isOpen: boolean; initial?: string }) => (
  <motion.div
    style={{
      position: "absolute",
      bottom: -14,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20,
      width: 32,
      height: 32,
      pointerEvents: "none",
    }}
    animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.4 : 1 }}
    transition={{ duration: 0.25, ease: "easeIn" }}
  >
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill={WAX_RED} />
      <circle cx="16" cy="16" r="10" fill="none" stroke="#C0392B" strokeWidth="0.8" opacity="0.6" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#F5E6E6"
        fontSize="13"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontWeight="600"
      >
        {(initial || "♥").slice(0, 1).toUpperCase()}
      </text>
    </svg>
  </motion.div>
);

const EnvelopeFlap = ({ isOpen }: { isOpen: boolean }) => (
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
    animate={{ rotateX: isOpen ? -172 : 0 }}
    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
  >
    <svg
      viewBox="0 0 360 180"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={FLAP_COLOR} />
          <stop offset="100%" stopColor={ENVELOPE_DARK} />
        </linearGradient>
      </defs>
      <polygon points="0,0 360,0 180,160" fill="url(#flapGrad)" stroke={ENVELOPE_DARK} strokeWidth="0.5" />
    </svg>
  </motion.div>
);

const EnvelopeReveal = ({ receiverName, onContinue }: EnvelopeRevealProps) => {
  const [phase, setPhase] = useState<Phase>("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    sounds.envelopeOpen();
    setPhase("opening");
    setTimeout(() => setPhase("open"), 1500);
  };

  const isOpen = phase === "open" || phase === "opening";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "#F2EFE8",
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "2rem",
        overflow: "hidden",
      }}
    >
      {/* Subtle grain overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px",
          pointerEvents: "none",
        }}
      />

      <AnimatePresence mode="wait">
        {phase !== "open" ? (
          <motion.div
            key="envelope-scene"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
          >
            <motion.p
              style={{
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: TEXT_MID,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                marginBottom: "0.5rem",
              }}
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {phase === "idle" ? `For ${receiverName}` : "Opening…"}
            </motion.p>

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
              <div
                style={{
                  position: "absolute",
                  inset: "8px 12px -12px 12px",
                  borderRadius: 6,
                  background: "rgba(120,110,90,0.18)",
                  filter: "blur(16px)",
                  zIndex: 0,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 6,
                  background: ENVELOPE_BODY,
                  border: `1px solid ${ENVELOPE_DARK}`,
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
                  <line x1="0" y1="240" x2="180" y2="130" stroke={ENVELOPE_DARK} strokeWidth="1" opacity="0.5" />
                  <line x1="360" y1="240" x2="180" y2="130" stroke={ENVELOPE_DARK} strokeWidth="1" opacity="0.5" />
                </svg>
              </div>

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
                    borderRadius: 3,
                    zIndex: 5,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: 16, textAlign: "center" }}>
                    <div style={{ width: 60, height: 3, background: TEXT_MID, opacity: 0.2, borderRadius: 2, margin: "0 auto 8px" }} />
                    <div style={{ width: 80, height: 3, background: TEXT_MID, opacity: 0.15, borderRadius: 2, margin: "0 auto 8px" }} />
                    <div style={{ width: 50, height: 3, background: TEXT_MID, opacity: 0.1, borderRadius: 2, margin: "0 auto" }} />
                  </div>
                </motion.div>
              )}

              <div style={{ position: "absolute", inset: 0, zIndex: 10, perspective: "600px", transformStyle: "preserve-3d" }}>
                <EnvelopeFlap isOpen={isOpen} />
              </div>

              <SealSVG isOpen={isOpen} initial={receiverName} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="continue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
          >
            <p
              style={{
                fontSize: "clamp(20px, 3vw, 28px)",
                color: TEXT_DARK,
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              For {receiverName}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onContinue}
              style={{
                padding: "12px 28px",
                background: WAX_RED,
                color: "#F5E6E6",
                border: "none",
                borderRadius: 4,
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: 15,
                cursor: "pointer",
                letterSpacing: "0.05em",
                boxShadow: "0 4px 16px rgba(139,46,46,0.25)",
              }}
            >
              Read the letter →
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
          gap: 6,
          opacity: 0.35,
        }}
      >
        <Wand2 size={12} color={TEXT_MID} />
        <span style={{ fontSize: 11, color: TEXT_MID, fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.1em" }}>
          {phase === "idle" ? "click to open" : phase === "opening" ? "opening…" : "tap continue"}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default EnvelopeReveal;
