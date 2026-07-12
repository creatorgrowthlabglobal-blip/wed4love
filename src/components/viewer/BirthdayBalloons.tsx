import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import frameImg from "@/assets/letter-frame.webp";

interface Props {
  onComplete: () => void;
  letterText?: string;
  images?: string[];
  senderName?: string;
  receiverName?: string;
}

type Hue = "gold" | "rose" | "sky" | "lavender" | "coral" | "mint";

const PALETTE: Record<Hue, { top: string; bottom: string; shine: string; particle: string; string: string }> = {
  gold:     { top: "#FFE566", bottom: "#D97706", shine: "#FFFDE7", particle: "#FCD34D", string: "#B45309" },
  rose:     { top: "#FB7185", bottom: "#9F1239", shine: "#FFE4E6", particle: "#F43F5E", string: "#881337" },
  sky:      { top: "#7DD3FC", bottom: "#1E40AF", shine: "#E0F2FE", particle: "#38BDF8", string: "#1D4ED8" },
  lavender: { top: "#D8B4FE", bottom: "#6D28D9", shine: "#F3E8FF", particle: "#C084FC", string: "#5B21B6" },
  coral:    { top: "#FDBA74", bottom: "#C2410C", shine: "#FFF7ED", particle: "#FB923C", string: "#9A3412" },
  mint:     { top: "#6EE7B7", bottom: "#065F46", shine: "#ECFDF5", particle: "#34D399", string: "#047857" },
};

const BALLOONS: {
  id: number; x: number; y: number; hue: Hue;
  bobDuration: number; bobDelay: number; enterDelay: number; rotate: number;
}[] = [
  { id: 0, x: 14, y: 34, hue: "gold",     bobDuration: 2.8, bobDelay: 0.0, enterDelay: 0.0,  rotate: -6  },
  { id: 1, x: 50, y: 28, hue: "rose",     bobDuration: 3.2, bobDelay: 0.5, enterDelay: 0.18, rotate: 3   },
  { id: 2, x: 82, y: 36, hue: "sky",      bobDuration: 2.6, bobDelay: 1.0, enterDelay: 0.36, rotate: -4  },
  { id: 3, x: 26, y: 62, hue: "lavender", bobDuration: 3.0, bobDelay: 0.3, enterDelay: 0.54, rotate: 7   },
  { id: 4, x: 61, y: 55, hue: "coral",    bobDuration: 2.9, bobDelay: 0.8, enterDelay: 0.72, rotate: -3  },
  { id: 5, x: 84, y: 70, hue: "mint",     bobDuration: 3.5, bobDelay: 0.2, enterDelay: 0.9,  rotate: 5   },
];

const SIZE = 92;

// Deterministic star positions (avoids random on re-render)
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: (i * 41.3 + 7) % 100,
  y: (i * 27.9 + 13) % 100,
  r: 0.8 + (i % 3) * 0.6,
  opacity: 0.15 + (i % 6) * 0.1,
  blinkDelay: (i % 9) * 0.4,
}));

// Bokeh circles behind balloons
const BOKEH = [
  { x: 12, y: 40, r: 80,  color: "#FFE56640" },
  { x: 50, y: 10, r: 60,  color: "#FB718550" },
  { x: 82, y: 35, r: 70,  color: "#C084FC35" },
  { x: 30, y: 70, r: 90,  color: "#F9A8D430" },
  { x: 65, y: 65, r: 65,  color: "#FDBA7440" },
  { x: 88, y: 75, r: 55,  color: "#86EFAC35" },
];

interface Particle {
  id: number;
  bx: number;  // balloon x % (viewport)
  by: number;  // balloon y %
  angle: number;
  color: string;
}

const CONFETTI_COLORS = ["#ff8fab", "#f7c873", "#a0d8ef", "#e0bbe4", "#ffb347", "#90ee90", "#ff6b6b", "#ffd700"];

interface BdayConfetti {
  id: number; x: number; color: string; rotate: number; duration: number; delay: number; size: number;
}

const BirthdayBalloons = ({ onComplete, letterText, images, senderName, receiverName }: Props) => {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [particles, setParticles] = useState<Particle[]>([]);
  const [phase, setPhase] = useState<"game" | "countdown" | "birthday">("game");
  const [countdownNum, setCountdownNum] = useState(5);
  const [bdayConfetti, setBdayConfetti] = useState<BdayConfetti[]>([]);
  const nextPId = useRef(0);

  const total = BALLOONS.length;

  const handlePop = (b: typeof BALLOONS[0]) => {
    if (popped.has(b.id) || phase !== "game") return;

    const color = PALETTE[b.hue].particle;
    const burst: Particle[] = Array.from({ length: 10 }, (_, i) => ({
      id: nextPId.current++,
      bx: b.x,
      by: b.y,
      angle: i * 36,
      color,
    }));
    setParticles(prev => [...prev, ...burst]);
    setTimeout(() => {
      const ids = new Set(burst.map(p => p.id));
      setParticles(prev => prev.filter(p => !ids.has(p.id)));
    }, 1000);

    const next = new Set(popped);
    next.add(b.id);
    setPopped(next);

    if (next.size === total) {
      setPhase("countdown");
      let n = 5;
      setCountdownNum(n);
      const interval = setInterval(() => {
        n--;
        if (n === 0) {
          clearInterval(interval);
          const pieces: BdayConfetti[] = Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            rotate: Math.random() * 720 - 360,
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1.5,
            size: 8 + Math.random() * 8,
          }));
          setBdayConfetti(pieces);
          setPhase("birthday");
          setTimeout(onComplete, 4000);
        } else {
          setCountdownNum(n);
        }
      }, 1000);
    }
  };

  return (
    <motion.div
      key="birthday-balloons"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        overflow: "hidden",
        background: "linear-gradient(160deg, #FDF1F5 0%, #F6D6E4 45%, #F0C4D8 100%)",
      }}
    >
      {/* Soft confetti dots */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {STARS.map((s, i) => (
          <motion.circle
            key={s.id}
            cx={`${s.x}%`} cy={`${s.y}%`}
            r={s.r + 0.5}
            fill={["#F9A8D4","#FDE68A","#C4B5FD","#86EFAC","#FDA4AF","#7DD3FC"][i % 6]}
            animate={{ opacity: [s.opacity * 0.5, s.opacity * 1.4, s.opacity * 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5 + s.blinkDelay, ease: "easeInOut", delay: s.blinkDelay }}
          />
        ))}
      </svg>

      {/* Bokeh glows */}
      {BOKEH.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: "50%",
            background: b.color,
            transform: "translate(-50%, -50%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Header */}
      <div style={{ position: "relative", zIndex: 30, textAlign: "center", paddingTop: "clamp(20px, 5vh, 40px)" }}>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontFamily: "'Pinyon Script', cursive",
            fontSize: "clamp(28px, 5vw, 42px)",
            color: "#C0396A",
            textShadow: "0 2px 12px rgba(192,57,106,0.2)",
            marginBottom: 4,
          }}
        >
          Pop the Balloons!
        </motion.p>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 8 }}
        >
          {BALLOONS.map(b => (
            <motion.div
              key={b.id}
              animate={{
                background: popped.has(b.id)
                  ? PALETTE[b.hue].particle
                  : "rgba(255,255,255,0.2)",
                scale: popped.has(b.id) ? [1, 1.4, 1] : 1,
              }}
              transition={{ duration: 0.35 }}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: 10,
            fontFamily: "sans-serif",
            fontSize: "clamp(12px, 3.5vw, 14px)",
            color: "rgba(120,60,80,0.6)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {popped.size} of {total} popped
        </motion.p>
      </div>

      {/* Balloons */}
      {BALLOONS.map(b => {
        const pal = PALETTE[b.hue];
        const isPopped = popped.has(b.id);
        const gradId = `grad-${b.id}`;
        const shineId = `shine-${b.id}`;

        return (
          <AnimatePresence key={b.id}>
            {!isPopped && (
              <motion.div
                initial={{ y: "110vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{
                  y: { type: "spring", stiffness: 55, damping: 14, delay: b.enterDelay },
                  opacity: { duration: 0.25, delay: b.enterDelay },
                  exit: { duration: 0.2 },
                }}
                style={{
                  position: "absolute",
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                  zIndex: 20,
                  userSelect: "none",
                }}
                onClick={() => handlePop(b)}
              >
                {/* Bob wrapper */}
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: b.bobDuration,
                    ease: "easeInOut",
                    delay: b.bobDelay + b.enterDelay + 0.8,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    style={{ rotate: b.rotate }}
                  >
                    <svg
                      width={SIZE}
                      height={SIZE * 1.45}
                      viewBox="0 0 92 133"
                      style={{ overflow: "visible", display: "block" }}
                    >
                      <defs>
                        <radialGradient id={gradId} cx="38%" cy="35%" r="62%">
                          <stop offset="0%" stopColor={pal.shine} stopOpacity="0.9" />
                          <stop offset="40%" stopColor={pal.top} />
                          <stop offset="100%" stopColor={pal.bottom} />
                        </radialGradient>
                        <radialGradient id={shineId} cx="30%" cy="28%" r="40%">
                          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
                          <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </radialGradient>
                        <filter id={`shadow-${b.id}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={pal.bottom} floodOpacity="0.5" />
                        </filter>
                      </defs>

                      {/* Balloon body */}
                      <ellipse
                        cx="46" cy="48" rx="42" ry="46"
                        fill={`url(#${gradId})`}
                        filter={`url(#shadow-${b.id})`}
                      />
                      {/* Shine */}
                      <ellipse
                        cx="34" cy="28" rx="18" ry="22"
                        fill={`url(#${shineId})`}
                      />
                      {/* Knot */}
                      <path
                        d="M42,93 Q46,102 50,93"
                        fill="none"
                        stroke={pal.bottom}
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* String */}
                      <path
                        d={`M46,103 Q${46 + (b.rotate > 0 ? 6 : -6)},118 46,133`}
                        fill="none"
                        stroke={pal.string}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity="0.7"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}

      {/* Particle bursts */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.bx}%`,
            top: `${p.by}%`,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            left: `${p.bx + Math.cos((p.angle * Math.PI) / 180) * 12}%`,
            top: `${p.by + Math.sin((p.angle * Math.PI) / 180) * 14}%`,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: p.color,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 30,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}

      {/* Countdown overlay */}
      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 40,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "rgba(253, 235, 243, 0.92)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={countdownNum}
                initial={{ scale: 2.5, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.3, opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: "clamp(100px, 20vw, 160px)",
                  lineHeight: 1,
                  color: "#C0396A",
                  textShadow: "0 4px 24px rgba(192,57,106,0.3)",
                  userSelect: "none",
                }}
              >
                {countdownNum}
              </motion.p>
            </AnimatePresence>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 16,
                fontFamily: "sans-serif",
                fontSize: "clamp(11px, 2vw, 14px)",
                color: "rgba(120,60,80,0.6)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Get ready...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Happy Birthday overlay */}
      <AnimatePresence>
        {phase === "birthday" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 40, overflow: "hidden",
              background: "#FFF9F2",
            }}
          >
            {/* Falling confetti layer */}
            {bdayConfetti.map(c => (
              <motion.div
                key={c.id}
                initial={{ y: "-5vh", x: `${c.x}vw`, opacity: 1, rotate: 0 }}
                animate={{ y: "110vh", opacity: 0.85, rotate: c.rotate }}
                transition={{ duration: c.duration, delay: c.delay, ease: "linear" }}
                style={{
                  position: "absolute", top: 0, left: 0,
                  background: c.color, width: c.size, height: c.size * 0.6,
                  borderRadius: 2, pointerEvents: "none", zIndex: 1,
                }}
              />
            ))}

            {/* Floral frame border — same asset as template 1 & 2 */}
            <div
              aria-hidden
              style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
                borderStyle: "solid", borderColor: "transparent",
                borderWidth: "clamp(68px, 15.5vmin, 210px)",
                borderImageSource: `url(${frameImg})`,
                borderImageSlice: 260,
                borderImageRepeat: "stretch",
                borderImageWidth: 1,
              }}
            />

            {/* Scrollable card content — padded to sit inside the frame */}
            <div style={{ position: "relative", zIndex: 2, height: "100%", overflowY: "auto", background: "rgba(255,249,242,0.97)" }}>
              <div style={{
                minHeight: "100%", display: "flex", flexDirection: "column",
                alignItems: "center",
                padding: "clamp(76px,17vmin,220px) clamp(72px,16vmin,215px) clamp(76px,17vmin,220px)",
                gap: 28,
              }}>

                {/* Heading */}
                <motion.div
                  initial={{ y: -24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 160 }}
                  style={{ textAlign: "center" }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    style={{ fontSize: "clamp(44px, 10vw, 68px)", lineHeight: 1, marginBottom: 6 }}
                  >
                    🎂
                  </motion.div>
                  <p style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: "clamp(38px, 9vw, 58px)",
                    color: "#C0396A",
                    textShadow: "0 2px 14px rgba(192,57,106,0.22)",
                    lineHeight: 1.1, margin: 0,
                  }}>
                    Happy Birthday
                  </p>
                  <p style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: "clamp(28px, 6vw, 42px)",
                    color: "#D4507A",
                    lineHeight: 1.2, margin: "2px 0 0",
                  }}>
                    {receiverName || "Beautiful"}! 🎉
                  </p>
                </motion.div>

                {/* 3 Polaroid photos */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  style={{
                    display: "flex", gap: "clamp(8px,3vw,16px)",
                    justifyContent: "center", width: "100%", maxWidth: 380,
                  }}
                >
                  {[
                    { rot: -6,  emoji: "🎈", bg: "linear-gradient(135deg,#FFB3C6,#FF8FAB)" },
                    { rot:  4,  emoji: "🎁", bg: "linear-gradient(135deg,#F7C873,#FBD38D)" },
                    { rot: -3,  emoji: "🎊", bg: "linear-gradient(135deg,#C4B5FD,#A78BFA)" },
                  ].map((slot, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: slot.rot * 2.5, opacity: 0 }}
                      animate={{ scale: 1, rotate: slot.rot, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.48 + i * 0.14 }}
                      style={{
                        flex: "1 1 0", maxWidth: 115,
                        background: "#fff",
                        padding: "7px 7px 26px",
                        boxShadow: "0 6px 28px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.07)",
                        borderRadius: 3,
                      }}
                    >
                      {images?.[i] ? (
                        <img
                          src={images[i]}
                          style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                          alt=""
                        />
                      ) : (
                        <div style={{
                          width: "100%", aspectRatio: "1",
                          background: slot.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "clamp(22px,5vw,32px)",
                        }}>
                          {slot.emoji}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Letter text */}
                {letterText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    style={{ width: "100%", maxWidth: 380 }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 14, fontSize: "1.1rem", letterSpacing: "0.35em", opacity: 0.7 }}>
                      🌸 ✨ 🌸
                    </div>
                    <p style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "clamp(13px, 3.5vw, 15px)",
                      color: "#5C3A3A",
                      lineHeight: 1.85,
                      whiteSpace: "pre-wrap",
                      fontStyle: "italic",
                      textAlign: "center",
                      margin: 0,
                    }}>
                      {letterText}
                    </p>
                    <div style={{ textAlign: "center", marginTop: 14, fontSize: "1.1rem", letterSpacing: "0.35em", opacity: 0.7 }}>
                      🌸 ✨ 🌸
                    </div>
                  </motion.div>
                )}

                {/* Signature */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: letterText ? 1.1 : 0.75 }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{
                    fontFamily: "sans-serif",
                    fontSize: "clamp(11px, 3vw, 13px)",
                    color: "rgba(120,60,80,0.55)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    margin: "0 0 4px",
                  }}>
                    With all my love,
                  </p>
                  <p style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: "clamp(30px, 7vw, 44px)",
                    color: "#C0396A",
                    margin: 0,
                    lineHeight: 1.2,
                  }}>
                    {senderName || "Someone Special"} 💕
                  </p>
                </motion.div>

                {/* Decorative footer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  style={{ fontSize: "clamp(18px,4vw,24px)", letterSpacing: "0.4em", margin: 0 }}
                >
                  🎈🎉🎊🎁🎂
                </motion.p>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BirthdayBalloons;
