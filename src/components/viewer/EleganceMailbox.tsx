import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import eleganceMailboxClosed from "@/assets/elegance-mailbox-closed.jpeg";
import eleganceMailboxOpen from "@/assets/elegance-mailbox-open.jpeg";

type MailboxState = "idle" | "opening" | "delivered";

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const EleganceMailbox = ({ className, onContinue }: Props) => {
  const [state, setState] = useState<MailboxState>("idle");
  const isMobile = useIsMobile();
  const imgFit = isMobile ? "contain" : "cover";
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    [eleganceMailboxClosed, eleganceMailboxOpen].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  const handleClick = () => {
    if (state !== "idle") return;
    setState("opening");
    timersRef.current = [
      window.setTimeout(() => setState("delivered"), 2200),
      window.setTimeout(() => onContinue?.(), 3000),
    ];
  };

  const open = state !== "idle";
  const delivered = state === "delivered";

  return (
    <div
      className={className}
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <motion.div
        onClick={handleClick}
        whileHover={{ scale: open ? 1 : 1.025 }}
        whileTap={{ scale: open ? 1 : 0.97 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          cursor: open ? "default" : "pointer",
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: "0px",
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        {/* Closed frame */}
        <motion.img
          src={eleganceMailboxClosed}
          alt="Elegance mailbox closed"
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
          // @ts-expect-error - valid HTML attribute not yet in React types
          fetchpriority="high"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: imgFit,
            objectPosition: "center",
            display: "block",
          }}
        />

        {/* Open frame */}
        <motion.img
          src={eleganceMailboxOpen}
          alt="Elegance mailbox open"
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{
            opacity: open ? 1 : 0,
            scale: delivered ? 1.06 : open ? 1 : 1.02,
          }}
          transition={{
            opacity: { duration: 0.8, ease: "easeInOut" },
            scale: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: imgFit,
            objectPosition: "center",
            display: "block",
          }}
        />

        {/* Soft rose glow on idle */}
        <motion.div
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 50% at 62% 55%, rgba(255,180,200,0.10), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Caption */}
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                position: "absolute",
                bottom: 18,
                left: 0,
                right: 0,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: "clamp(32px, 6vw, 48px)",
                  color: "#B8446A",
                  letterSpacing: "0.02em",
                  textShadow: "0 2px 8px rgba(184,68,106,0.25)",
                }}
              >
                Click Me
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vignette on delivered state */}
        <motion.div
          animate={{ opacity: delivered ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 60% 50%, transparent 0%, rgba(255,200,215,0.35) 100%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

    </div>
  );
};

export default EleganceMailbox;
