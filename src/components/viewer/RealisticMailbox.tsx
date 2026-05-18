import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { sounds } from "@/lib/sounds";
import mailboxClosed from "@/assets/mailbox-closed.jpg";
import mailboxOpen from "@/assets/mailbox-open.jpg";

type MailboxState = "idle" | "opening" | "delivered";

interface Props {
  className?: string;
  onContinue?: () => void;
  senderName?: string;
}

const RealisticMailbox = ({ className, onContinue, senderName }: Props) => {
  const [state, setState] = useState<MailboxState>("idle");
  const [zoomed, setZoomed] = useState(false);
  const timersRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax mouse tracking
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });
  const bgX = useTransform(sx, (v) => v * -8);
  const bgY = useTransform(sy, (v) => v * -6);
  const midX = useTransform(sx, (v) => v * -18);
  const midY = useTransform(sy, (v) => v * -10);
  const frontX = useTransform(sx, (v) => v * -32);
  const frontY = useTransform(sy, (v) => v * -16);

  // Preload both frames
  useEffect(() => {
    [mailboxClosed, mailboxOpen].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  useEffect(() => () => { timersRef.current.forEach((t) => window.clearTimeout(t)); }, []);

  const handleMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  const handleClick = () => {
    if (state !== "idle") return;
    sounds.birdsFly();
    setState("opening");
    timersRef.current = [
      window.setTimeout(() => { setState("delivered"); setZoomed(true); }, 2200),
      window.setTimeout(() => onContinue?.(), 3180),
    ];
  };

  const open = state !== "idle";
  const delivered = state === "delivered";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #faf3e7 0%, #f5ead6 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft background wash with parallax */}
      <motion.div
        style={{
          position: "absolute",
          inset: "-4%",
          x: bgX,
          y: bgY,
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(200,180,220,0.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        onClick={handleClick}
        whileHover={open ? undefined : { scale: 1.02 }}
        whileTap={open ? undefined : { scale: 0.985 }}
        animate={
          state === "opening"
            ? { x: [0, -6, 7, -5, 4, -2, 0], rotate: [0, -1.2, 1.4, -0.8, 0.4, 0] }
            : open
            ? { x: 0, rotate: 0 }
            : { y: [0, -6, 0] }
        }
        transition={
          state === "opening"
            ? { duration: 0.55, ease: "easeInOut" }
            : open
            ? { duration: 0.4 }
            : { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          cursor: open ? "default" : "pointer",
          width: "min(100vw, 100vh)",
          height: "min(100vw, 100vh)",
          maxWidth: "100%",
          maxHeight: "100%",
          position: "relative",
          x: midX,
          y: midY,
          transformStyle: "preserve-3d",
          perspective: 1400,
        }}
      >
        {/* Closed frame — shakes, then quickly fades under the open frame */}
        <motion.img
          src={mailboxClosed}
          alt="Lavender mailbox in a cottage garden"
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
          // @ts-expect-error valid html attr
          fetchpriority="high"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.22, ease: "easeOut", delay: open ? 0.42 : 0 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />

        {/* White flash mask that hides the swap moment */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? [0, 0.85, 0] : 0 }}
          transition={{ duration: 0.55, times: [0, 0.55, 1], delay: open ? 0.35 : 0 }}
          style={{
            position: "absolute",
            inset: "20% 22%",
            background:
              "radial-gradient(closest-side, rgba(255,250,235,0.95), rgba(255,240,210,0) 70%)",
            pointerEvents: "none",
            zIndex: 4,
            mixBlendMode: "screen",
          }}
        />

        {/* Open frame — pops in from the door area with a bouncy spring */}
        <motion.img
          src={mailboxOpen}
          alt="Lavender mailbox open with a letter inside"
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
          initial={{ opacity: 0, scale: 0.88, y: 18, rotateX: -22 }}
          animate={{
            opacity: open ? 1 : 0,
            scale: delivered ? 1.05 : open ? 1 : 0.88,
            y: open ? 0 : 18,
            rotateX: open ? 0 : -22,
          }}
          transition={{
            opacity: { duration: 0.35, ease: "easeOut", delay: open ? 0.4 : 0 },
            scale: open
              ? { type: "spring", stiffness: 280, damping: 14, mass: 0.9, delay: 0.4 }
              : { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
            y: { type: "spring", stiffness: 240, damping: 16, delay: open ? 0.4 : 0 },
            rotateX: { type: "spring", stiffness: 220, damping: 14, delay: open ? 0.4 : 0 },
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            transformOrigin: "50% 78%",
            zIndex: 3,
          }}
        />

        {/* Sparkle burst at the door */}
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.4, 1.8] }}
            transition={{ duration: 0.9, delay: 0.42, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: "50%",
              top: "58%",
              width: "26%",
              height: "26%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(closest-side, rgba(255,225,160,0.55), rgba(255,220,180,0) 70%)",
              pointerEvents: "none",
              zIndex: 5,
              mixBlendMode: "screen",
            }}
          />
        )}


        {/* Front parallax foliage shadow accent */}
        <motion.div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "8%",
            height: "12%",
            x: frontX,
            y: frontY,
            background:
              "radial-gradient(50% 60% at 50% 100%, rgba(90,70,40,0.18), transparent 70%)",
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
                bottom: "6%",
                left: 0,
                right: 0,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(15px, 1.6vw, 20px)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#5A4870",
                  textShadow: "0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                {senderName
                  ? `A letter from ${senderName} — tap to open`
                  : "Click the mailbox to continue"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle vignette during handoff */}
        <motion.div
          animate={{ opacity: delivered ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 55%, transparent 0%, rgba(40,28,55,0.45) 100%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Envelope handoff — zooms forward into a readable card */}
      <AnimatePresence>
        {delivered && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(420px, 92vw)",
              aspectRatio: "360 / 240",
              pointerEvents: "none",
              zIndex: 60,
            }}
          >
            <motion.div
              key="shared-envelope"
              initial={{ scale: 0.25, opacity: 0, y: 60 }}
              animate={{ scale: zoomed ? 1 : 0.25, opacity: 1, y: 0 }}
              transition={{
                scale: { type: "spring", stiffness: 90, damping: 16, mass: 1.1 },
                y: { type: "spring", stiffness: 90, damping: 16 },
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
                  inset: "10px 14px -14px 14px",
                  borderRadius: "8px",
                  background: "rgba(120,110,90,0.22)",
                  filter: "blur(2px)",
                  boxShadow: "0 30px 50px rgba(80,60,30,0.28)",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "8px",
                  background: "linear-gradient(180deg, #ffffff 0%, #f8f3ea 100%)",
                  border: "1px solid rgba(120,90,50,0.25)",
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
                    fill="#fbf6ec"
                    stroke="rgba(120,90,50,0.35)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* Gold wax seal */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 30%, #f5d98a, #c9a14a 60%, #8a6a2a)",
                  boxShadow: "0 4px 10px rgba(80,60,20,0.35)",
                  zIndex: 12,
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealisticMailbox;
