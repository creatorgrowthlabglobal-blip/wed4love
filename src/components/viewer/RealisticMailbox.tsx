import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";
import { useIsMobile } from "@/hooks/use-mobile";
import mailboxClosed from "@/assets/mailbox-closed.jpg";
import mailboxOpen from "@/assets/mailbox-open.jpg";

/* Photoreal lavender garden mailbox.
   Two AI-rendered frames (closed / open) cross-fade on tap, then the scene
   gently scales while a shared-layout envelope rises out and hands off to
   EnvelopeReveal. */

type MailboxState = "idle" | "opening" | "delivered";

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const RealisticMailbox = ({ className, onContinue, senderName }: Props) => {
  const [state, setState] = useState<MailboxState>("idle");
  const [zoomed, setZoomed] = useState(false);
  const isMobile = useIsMobile();
  const imgFit = isMobile ? "contain" : "cover";
  const timersRef = useRef<number[]>([]);

  // Warm the browser cache for both frames as soon as the mailbox mounts,
  // so the "open" image is decoded and ready before the user taps.
  useEffect(() => {
    [mailboxClosed, mailboxOpen].forEach((src) => {
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
        whileHover={{ scale: open ? 1 : 1.025 }}
        whileTap={{ scale: open ? 1 : 0.97 }}
        animate={open ? { y: 0 } : { y: [0, -6, 0] }}
        transition={
          open
            ? { duration: 0.5 }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
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
          src={mailboxClosed}
          alt="Lavender mailbox in a cottage garden"
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
          src={mailboxOpen}
          alt="Lavender mailbox open with vintage letters inside"
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

        {/* Soft warm wash on hover */}
        <motion.div
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 50% at 50% 60%, rgba(255,220,235,0.08), transparent 70%)",
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
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(255, 250, 246, 0.78)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: "0 8px 24px rgba(90, 70, 120, 0.18)",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "#5A4870",
                }}
              >
                {senderName
                  ? `A letter from ${senderName} — tap to open`
                  : "Tap the mailbox to open your letter"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle vignette while opening, fades the scene before handoff */}
        <motion.div
          animate={{ opacity: delivered ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 55%, transparent 0%, rgba(239,201,214,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Shared-layout envelope handoff (unchanged) */}
      <AnimatePresence>
        {delivered && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(50%, 280px)",
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
    </div>
  );
};

export default RealisticMailbox;
