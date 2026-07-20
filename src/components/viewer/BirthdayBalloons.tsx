import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";
import frameImg from "@/assets/letter-frame.webp";

type Hue = "gold" | "rose" | "sky" | "lavender" | "coral" | "mint";
type ParticleShape = "circle" | "star" | "heart";

interface Particle {
  id: number;
  bx: number;
  by: number;
  angle: number;
  color: string;
  shape: ParticleShape;
  size: number;
}

interface Shockwave {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface Flash {
  id: number;
  color: string;
}

interface BdayConfetti {
  id: number;
  x: number;
  color: string;
  rotate: number;
  duration: number;
  delay: number;
  size: number;
  round: boolean;
}

interface Props {
  onComplete: () => void;
  letterText?: string;
  images?: string[];
  senderName?: string;
  receiverName?: string;
}

const PALETTE: Record<Hue, { top: string; bottom: string; shine: string; particle: string; string: string; glow: string }> = {
  gold:     { top: "#FFE566", bottom: "#D97706", shine: "#FFFDE7", particle: "#FCD34D", string: "#B45309",  glow: "rgba(255,229,102,0.55)" },
  rose:     { top: "#FB7185", bottom: "#9F1239", shine: "#FFE4E6", particle: "#F43F5E", string: "#881337",  glow: "rgba(251,113,133,0.55)" },
  sky:      { top: "#7DD3FC", bottom: "#1E40AF", shine: "#E0F2FE", particle: "#38BDF8", string: "#1D4ED8",  glow: "rgba(125,211,252,0.55)" },
  lavender: { top: "#D8B4FE", bottom: "#6D28D9", shine: "#F3E8FF", particle: "#C084FC", string: "#5B21B6",  glow: "rgba(216,180,254,0.55)" },
  coral:    { top: "#FDBA74", bottom: "#C2410C", shine: "#FFF7ED", particle: "#FB923C", string: "#9A3412",  glow: "rgba(253,186,116,0.55)" },
  mint:     { top: "#6EE7B7", bottom: "#065F46", shine: "#ECFDF5", particle: "#34D399", string: "#047857",  glow: "rgba(110,231,183,0.55)" },
};

const BALLOONS: {
  id: number; x: number; y: number; hue: Hue;
  bobDuration: number; bobDelay: number; enterDelay: number; rotate: number;
}[] = [
  { id: 0, x: 14, y: 33, hue: "gold",     bobDuration: 2.8, bobDelay: 0.0, enterDelay: 0.0,  rotate: -6 },
  { id: 1, x: 50, y: 30, hue: "rose",     bobDuration: 3.2, bobDelay: 0.5, enterDelay: 0.16, rotate:  3 },
  { id: 2, x: 82, y: 35, hue: "sky",      bobDuration: 2.6, bobDelay: 1.0, enterDelay: 0.32, rotate: -4 },
  { id: 3, x: 25, y: 62, hue: "lavender", bobDuration: 3.0, bobDelay: 0.3, enterDelay: 0.48, rotate:  7 },
  { id: 4, x: 61, y: 57, hue: "coral",    bobDuration: 2.9, bobDelay: 0.8, enterDelay: 0.64, rotate: -3 },
  { id: 5, x: 83, y: 70, hue: "mint",     bobDuration: 3.5, bobDelay: 0.2, enterDelay: 0.8,  rotate:  5 },
];

// Deterministic — no Math.random at render time
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: (i * 41.3 + 7) % 100,
  y: (i * 27.9 + 13) % 100,
  r: 0.5 + (i % 4) * 0.45,
  opacity: 0.25 + (i % 6) * 0.1,
  blinkDelay: (i % 9) * 0.4,
  blinkDuration: 1.4 + (i % 7) * 0.45,
  color: ["#FDE68A","#FCA5A5","#C4B5FD","#86EFAC","#7DD3FC","#FDA4AF","#FBBF24","#A78BFA"][i % 8],
}));

const BOKEH = [
  { x: 8,  y: 18, r: 130, color: "rgba(255,210,80,0.22)"  },
  { x: 52, y: 8,  r: 90,  color: "rgba(255,150,170,0.20)" },
  { x: 88, y: 28, r: 100, color: "rgba(192,132,252,0.15)" },
  { x: 18, y: 68, r: 110, color: "rgba(255,170,190,0.18)" },
  { x: 65, y: 62, r: 80,  color: "rgba(255,210,80,0.17)"  },
  { x: 92, y: 78, r: 70,  color: "rgba(253,186,116,0.22)" },
  { x: 42, y: 42, r: 120, color: "rgba(255,150,170,0.14)" },
];

// Rising background sparkles
const FLOAT_DECOS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 13.7 + 5) % 88 + 6,
  delay: (i * 0.65) % 7,
  duration: 7 + (i % 6) * 1.8,
  char: ["✦","♥","✦","★","✦","♥","✦","⋆","♥","★","✦","♥","✦","★","✦","⋆","♥","★"][i],
  size: 9 + (i % 4) * 4,
  opacity: 0.08 + (i % 4) * 0.06,
}));

const CONFETTI_COLORS = [
  "#ff8fab","#f7c873","#a0d8ef","#e0bbe4","#ffb347",
  "#90ee90","#ff6b6b","#ffd700","#C084FC","#34D399",
];

const POP_COLORS = [
  "#FFE566","#FB7185","#7DD3FC","#D8B4FE","#FDBA74","#6EE7B7",
  "#FCD34D","#F43F5E","#38BDF8","#C084FC","#FB923C","#34D399",
  "#ffffff","#FFD6E7","#E0F2FE",
];

const STAR_CLIP =
  "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";

const BirthdayBalloons = ({ onComplete, letterText, images, senderName, receiverName }: Props) => {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [phase, setPhase] = useState<"game" | "countdown" | "birthday">("game");
  const [countdownNum, setCountdownNum] = useState(5);
  const [bdayConfetti, setBdayConfetti] = useState<BdayConfetti[]>([]);
  const nextId = useRef(0);
  const total = BALLOONS.length;

  const handlePop = (b: typeof BALLOONS[0]) => {
    if (popped.has(b.id) || phase !== "game") return;

    try { sounds.balloonPop(); } catch {}
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(60);

    const pal = PALETTE[b.hue];

    // 28 particles — circles, stars, hearts evenly spread
    const burst: Particle[] = Array.from({ length: 28 }, (_, i) => ({
      id: nextId.current++,
      bx: b.x,
      by: b.y,
      angle: (i / 28) * 360 + (Math.random() * 12 - 6),
      color: POP_COLORS[i % POP_COLORS.length],
      shape: (["circle", "star", "heart"] as ParticleShape[])[i % 3],
      size: 7 + (i % 5) * 3,
    }));
    setParticles(prev => [...prev, ...burst]);

    // Shockwave ring
    const sw: Shockwave = { id: nextId.current++, x: b.x, y: b.y, color: pal.particle };
    setShockwaves(prev => [...prev, sw]);

    // Full-screen flash
    const fl: Flash = { id: nextId.current++, color: pal.glow };
    setFlashes(prev => [...prev, fl]);

    setTimeout(() => {
      const ids = new Set(burst.map(p => p.id));
      setParticles(prev => prev.filter(p => !ids.has(p.id)));
    }, 1300);
    setTimeout(() => setShockwaves(prev => prev.filter(s => s.id !== sw.id)), 700);
    setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== fl.id)), 280);

    const next = new Set(popped);
    next.add(b.id);
    setPopped(next);

    if (next.size === total) {
      setPhase("countdown");
      let n = 5;
      setCountdownNum(n);
      const iv = setInterval(() => {
        n--;
        if (n === 0) {
          clearInterval(iv);
          const pieces: BdayConfetti[] = Array.from({ length: 90 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            rotate: Math.random() * 720 - 360,
            duration: 2.5 + Math.random() * 2.5,
            delay: Math.random() * 2,
            size: 6 + Math.random() * 10,
            round: Math.random() > 0.5,
          }));
          setBdayConfetti(pieces);
          setPhase("birthday");
          setTimeout(onComplete, 4500);
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
        zIndex: 200,
        overflow: "hidden",
        background: "linear-gradient(165deg, #FFFBEE 0%, #FFF6D6 35%, #FFF1E8 65%, #FFF8F2 100%)",
      }}
    >
      {/* Animated bokeh orbs */}
      {BOKEH.map((bk, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -24, 0], scale: [1, 1.18, 1] }}
          transition={{ repeat: Infinity, duration: 7 + i * 1.2, ease: "easeInOut", delay: i * 0.9 }}
          style={{
            position: "absolute",
            left: `${bk.x}%`,
            top: `${bk.y}%`,
            width: bk.r * 2,
            height: bk.r * 2,
            borderRadius: "50%",
            background: bk.color,
            transform: "translate(-50%, -50%)",
            filter: "blur(55px)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Twinkling star field — hidden on light background */}
      <svg
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, display: "none" }}
      >
        {STARS.map(s => (
          <motion.circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={s.color}
            animate={{ opacity: [s.opacity * 0.25, s.opacity * 1.6, s.opacity * 0.25], r: [s.r, s.r * 1.35, s.r] }}
            transition={{ repeat: Infinity, duration: s.blinkDuration, ease: "easeInOut", delay: s.blinkDelay }}
          />
        ))}
      </svg>

      {/* Floating rising sparkles */}
      {FLOAT_DECOS.map(d => (
        <motion.span
          key={d.id}
          initial={{ y: "108vh", opacity: 0 }}
          animate={{ y: "-8vh", opacity: [0, d.opacity, d.opacity, 0] }}
          transition={{
            repeat: Infinity,
            duration: d.duration,
            delay: d.delay,
            ease: "linear",
            opacity: { times: [0, 0.12, 0.88, 1], ease: "linear" },
          }}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            color: "#C8952A",
            fontSize: d.size,
            pointerEvents: "none",
            zIndex: 2,
            lineHeight: 1,
          }}
        >
          {d.char}
        </motion.span>
      ))}

      {/* ── Header ── */}
      <div style={{ position: "relative", zIndex: 30, textAlign: "center", paddingTop: "clamp(14px,3.5vh,34px)", display: phase === "game" ? undefined : "none" }}>
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p style={{
            fontFamily: "'Pinyon Script', cursive",
            fontSize: "clamp(26px, 6.5vw, 50px)",
            color: "#8B2252",
            textShadow: "0 2px 12px rgba(184,48,106,0.18)",
            margin: 0,
            lineHeight: 1.1,
          }}>
            Pop the Balloons!
          </p>
          <p style={{
            margin: "4px 0 0",
            fontFamily: "sans-serif",
            fontSize: "clamp(9px, 2.2vw, 12px)",
            color: "rgba(139,34,82,0.55)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            ✦ tap each one ✦
          </p>
        </motion.div>

        {/* Coloured progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(7px,2.2vw,14px)",
            marginTop: "clamp(8px,2vh,14px)",
          }}
        >
          {BALLOONS.map(b => {
            const pal = PALETTE[b.hue];
            return (
              <motion.div
                key={b.id}
                animate={{
                  background: popped.has(b.id) ? pal.particle : "rgba(139,34,82,0.10)",
                  scale: popped.has(b.id) ? [1, 1.7, 1] : 1,
                  boxShadow: popped.has(b.id) ? `0 0 10px 2px ${pal.particle}` : "none",
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: "clamp(9px,2.8vw,14px)",
                  height: "clamp(9px,2.8vw,14px)",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(139,34,82,0.22)",
                }}
              />
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: "clamp(4px,1vh,8px)",
            fontFamily: "sans-serif",
            fontSize: "clamp(10px, 2.5vw, 13px)",
            color: "rgba(139,34,82,0.50)",
          }}
        >
          {popped.size} of {total} popped ✨
        </motion.p>
      </div>

      {/* ── Balloons ── */}
      {phase === "game" && BALLOONS.map(b => {
        const pal = PALETTE[b.hue];
        const isPopped = popped.has(b.id);
        const gId = `grad-${b.id}`;
        const sId = `shine-${b.id}`;
        const sdId = `sdw-${b.id}`;

        return (
          <AnimatePresence key={b.id}>
            {!isPopped && (
              <motion.div
                initial={{ y: "115vh", opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ scale: 2.4, opacity: 0, filter: "blur(10px)" }}
                transition={{
                  y: { type: "spring", stiffness: 48, damping: 11, delay: b.enterDelay },
                  opacity: { duration: 0.28, delay: b.enterDelay },
                  scale: { type: "spring", stiffness: 80, delay: b.enterDelay },
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
                  WebkitUserSelect: "none",
                  touchAction: "manipulation",
                }}
                onClick={() => handlePop(b)}
              >
                {/* Glow halo */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.75, 0.45] }}
                  transition={{ repeat: Infinity, duration: b.bobDuration, ease: "easeInOut", delay: b.bobDelay }}
                  style={{
                    position: "absolute",
                    inset: "-18px",
                    borderRadius: "50%",
                    background: pal.glow,
                    filter: "blur(22px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Bob + sway wrapper */}
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    rotate: [b.rotate - 1.5, b.rotate + 1.5, b.rotate - 1.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: b.bobDuration,
                    ease: "easeInOut",
                    delay: b.bobDelay + b.enterDelay + 0.5,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.13 }}
                    whileTap={{ scale: 0.82 }}
                  >
                    {/* Responsive container — SVG fills it */}
                    <div style={{
                      width: "clamp(70px, 18vmin, 108px)",
                      height: "clamp(100px, 26vmin, 157px)",
                    }}>
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 92 133"
                        style={{ overflow: "visible", display: "block" }}
                      >
                        <defs>
                          <radialGradient id={gId} cx="37%" cy="31%" r="64%">
                            <stop offset="0%"   stopColor={pal.shine}  stopOpacity="0.95" />
                            <stop offset="32%"  stopColor={pal.top} />
                            <stop offset="100%" stopColor={pal.bottom} />
                          </radialGradient>
                          <radialGradient id={sId} cx="28%" cy="24%" r="36%">
                            <stop offset="0%"   stopColor="white" stopOpacity="0.72" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                          </radialGradient>
                          <filter id={sdId} x="-30%" y="-20%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="7" stdDeviation="9" floodColor={pal.bottom} floodOpacity="0.65" />
                          </filter>
                        </defs>

                        {/* Balloon body */}
                        <ellipse cx="46" cy="48" rx="42" ry="46" fill={`url(#${gId})`} filter={`url(#${sdId})`} />

                        {/* Primary specular shine */}
                        <ellipse cx="33" cy="26" rx="15" ry="19" fill={`url(#${sId})`} />

                        {/* Secondary small shine */}
                        <ellipse cx="59" cy="38" rx="5" ry="7" fill="white" opacity="0.22" />

                        {/* Bottom tonal shadow */}
                        <ellipse cx="46" cy="82" rx="17" ry="7" fill={pal.bottom} opacity="0.22" />

                        {/* Knot */}
                        <path
                          d="M42,93 Q46,104 50,93"
                          fill="none"
                          stroke={pal.bottom}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* String */}
                        <path
                          d={`M46,104 Q${46 + (b.rotate > 0 ? 8 : -8)},119 ${46 + (b.rotate > 0 ? 3 : -3)},133`}
                          fill="none"
                          stroke={pal.string}
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          opacity="0.85"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}

      {/* ── Pop particles ── */}
      {particles.map(p => {
        const spread = 18; // percent of viewport
        const tx = p.bx + Math.cos((p.angle * Math.PI) / 180) * spread;
        const ty = p.by + Math.sin((p.angle * Math.PI) / 180) * spread * 1.25;
        return (
          <motion.div
            key={p.id}
            initial={{ left: `${p.bx}%`, top: `${p.by}%`, scale: 1.1, opacity: 1, rotate: 0 }}
            animate={{
              left: `${tx}%`,
              top: `${ty}%`,
              scale: 0,
              opacity: 0,
              rotate: p.shape === "star" ? 200 : p.shape === "heart" ? -120 : 30,
            }}
            transition={{ duration: 0.85 + Math.random() * 0.35, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "heart" ? "50% 50% 50% 0" : "2px",
              clipPath: p.shape === "star" ? STAR_CLIP : "none",
              background: p.color,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 35,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        );
      })}

      {/* ── Shockwave rings ── */}
      {shockwaves.map(sw => (
        <motion.div
          key={sw.id}
          initial={{
            left: `${sw.x}%`,
            top: `${sw.y}%`,
            width: 16,
            height: 16,
            opacity: 0.9,
          }}
          animate={{ width: 220, height: 220, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            position: "absolute",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `3px solid ${sw.color}`,
            boxShadow: `0 0 16px ${sw.color}, inset 0 0 10px ${sw.color}40`,
            pointerEvents: "none",
            zIndex: 34,
          }}
        />
      ))}

      {/* ── Screen flash ── */}
      <AnimatePresence>
        {flashes.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0.38 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
            style={{
              position: "absolute",
              inset: 0,
              background: f.color,
              pointerEvents: "none",
              zIndex: 36,
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Countdown overlay ── */}
      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 40,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(165deg, #FFFBEE 0%, #FFF6D6 35%, #FFF1E8 65%, #FFF8F2 100%)",
            }}
          >
            {/* Central warm glow — gold outer, rose inner */}
            <div style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none" }}>
              <motion.div
                animate={{ scale: [1, 1.28, 1], opacity: [0.55, 0.85, 0.55] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  width: 420, height: 420,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(200,149,42,0.18) 0%, transparent 68%)",
                  transform: "translate(-50%, -50%)",
                  filter: "blur(28px)",
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.75, 0.45] }}
                transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut", delay: 0.35 }}
                style={{
                  position: "absolute",
                  width: 210, height: 210,
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(200,48,90,0.16) 0%, transparent 70%)",
                  transform: "translate(-50%, -50%)",
                  filter: "blur(18px)",
                }}
              />
            </div>

            {/* Gold radiating rings */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [0.28, 2.7], opacity: [0.7, 0] }}
                transition={{ repeat: Infinity, duration: 1.9, delay: i * 0.63, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: 148, height: 148,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(200,149,42,0.55)",
                  boxShadow: "0 0 14px rgba(200,149,42,0.20), inset 0 0 8px rgba(200,149,42,0.10)",
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Orbiting sparkles — deterministic circle */}
            {([
              { angle: 0,   dist: 118, char: "✦", size: 18, color: "#C8952A", dur: 1.6, dy: -14 },
              { angle: 45,  dist:  98, char: "♥", size: 13, color: "#E05070", dur: 1.4, dy: -10 },
              { angle: 90,  dist: 122, char: "★", size: 16, color: "#9333EA", dur: 1.8, dy: -16 },
              { angle: 135, dist:  96, char: "✦", size: 12, color: "#D97706", dur: 1.5, dy: -11 },
              { angle: 180, dist: 115, char: "⋆", size: 20, color: "#059669", dur: 1.7, dy: -15 },
              { angle: 225, dist:  98, char: "♥", size: 13, color: "#0284C7", dur: 1.6, dy: -12 },
              { angle: 270, dist: 112, char: "✦", size: 17, color: "#C8952A", dur: 1.9, dy: -14 },
              { angle: 315, dist:  94, char: "★", size: 14, color: "#E05070", dur: 1.5, dy: -10 },
            ] as { angle: number; dist: number; char: string; size: number; color: string; dur: number; dy: number }[]).map((sp, i) => {
              const rad = (sp.angle * Math.PI) / 180;
              const sx = Math.cos(rad) * sp.dist;
              const sy = Math.sin(rad) * sp.dist;
              return (
                <motion.span
                  key={i}
                  animate={{ y: [sy, sy + sp.dy, sy], opacity: [0.45, 1, 0.45], scale: [0.88, 1.28, 0.88] }}
                  transition={{ repeat: Infinity, duration: sp.dur, delay: i * 0.19, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${sx}px)`,
                    top: `calc(50% + ${sy}px)`,
                    transform: "translate(-50%, -50%)",
                    fontSize: sp.size,
                    color: sp.color,
                    textShadow: `0 0 10px ${sp.color}`,
                    pointerEvents: "none",
                    lineHeight: 1,
                    zIndex: 1,
                  }}
                >
                  {sp.char}
                </motion.span>
              );
            })}

            {/* "Get Ready..." heading */}
            <motion.p
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              style={{
                fontFamily: "'Pinyon Script', cursive",
                fontSize: "clamp(24px, 5.5vw, 38px)",
                color: "#C8952A",
                textShadow: "0 2px 12px rgba(200,149,42,0.22)",
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: "0.02em",
                position: "relative",
                zIndex: 2,
              }}
            >
              Get Ready...
            </motion.p>

            {/* Countdown number */}
            <AnimatePresence mode="wait">
              <motion.p
                key={countdownNum}
                initial={{ scale: 3, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.1, opacity: 0, rotate: 12 }}
                transition={{ duration: 0.38, ease: "backOut" }}
                style={{
                  fontFamily: "'Pinyon Script', cursive",
                  fontSize: "clamp(110px, 26vw, 190px)",
                  lineHeight: 1.3,
                  margin: 0,
                  padding: "0.1em 0.2em",
                  background: "linear-gradient(135deg, #C8952A 0%, #E06040 38%, #C8305A 68%, #7C3ACA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 2px 12px rgba(200,149,42,0.30)) drop-shadow(0 4px 24px rgba(200,48,90,0.22))",
                  userSelect: "none",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {countdownNum}
              </motion.p>
            </AnimatePresence>

            {/* Subtitle */}
            <motion.p
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.7 }}
              style={{
                marginTop: "clamp(4px,1.2vh,12px)",
                fontFamily: "sans-serif",
                fontSize: "clamp(8px, 2vw, 11px)",
                color: "rgba(139,34,82,0.60)",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                position: "relative",
                zIndex: 2,
              }}
            >
              ✦ your birthday letter awaits ✦
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Happy Birthday reveal ── */}
      <AnimatePresence>
        {phase === "birthday" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 40, overflow: "hidden",
              background: "linear-gradient(165deg, #FFFBEE 0%, #FFF6D6 35%, #FFF1E8 65%, #FFF8F2 100%)",
            }}
          >
            {/* Ambient gold & rose bokeh */}
            {([
              { x: 8,  y: 12, r: 200, c: "rgba(255,210,80,0.15)"  },
              { x: 88, y: 8,  r: 160, c: "rgba(255,150,170,0.14)" },
              { x: 50, y: 48, r: 240, c: "rgba(255,225,130,0.09)" },
              { x: 10, y: 82, r: 140, c: "rgba(255,170,190,0.13)" },
              { x: 92, y: 80, r: 150, c: "rgba(255,210,80,0.11)"  },
            ] as { x: number; y: number; r: number; c: string }[]).map((bk, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -22, 0], scale: [1, 1.14, 1] }}
                transition={{ repeat: Infinity, duration: 7 + i * 1.4, ease: "easeInOut", delay: i * 0.7 }}
                style={{
                  position: "absolute",
                  left: `${bk.x}%`, top: `${bk.y}%`,
                  width: bk.r * 2, height: bk.r * 2,
                  borderRadius: "50%",
                  background: bk.c,
                  transform: "translate(-50%, -50%)",
                  filter: "blur(65px)",
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Falling confetti */}
            {bdayConfetti.map(c => (
              <motion.div
                key={c.id}
                initial={{ y: "-5vh", x: `${c.x}vw`, opacity: 1, rotate: 0 }}
                animate={{ y: "110vh", opacity: 0.88, rotate: c.rotate }}
                transition={{ duration: c.duration, delay: c.delay, ease: "linear" }}
                style={{
                  position: "absolute", top: 0, left: 0,
                  background: c.color,
                  width: c.size,
                  height: c.round ? c.size : c.size * 0.55,
                  borderRadius: c.round ? "50%" : 2,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            ))}

            {/* ── Wall: top bunting pennants (non-scrolling) ── */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              height: "clamp(44px,8vh,58px)",
              zIndex: 10, pointerEvents: "none", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 10, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, rgba(140,90,20,0.45) 5%, rgba(140,90,20,0.45) 95%, transparent)",
              }} />
              <div style={{
                display: "flex", justifyContent: "center", alignItems: "flex-start",
                paddingTop: 11, gap: 2, overflow: "hidden",
              }}>
                {Array.from({ length: 24 }, (_, i) => {
                  const c = ["#FFD54F","#FF8A80","#80D8FF","#CE93D8","#A5D6A7","#FFCC80"][i % 6];
                  return (
                    <div key={i} style={{
                      width: 0, height: 0,
                      borderLeft: "clamp(11px,2.8vw,17px) solid transparent",
                      borderRight: "clamp(11px,2.8vw,17px) solid transparent",
                      borderTop: `clamp(20px,5vw,32px) solid ${c}`,
                      flexShrink: 0,
                      opacity: 0.88,
                      filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.10))",
                    }} />
                  );
                })}
              </div>
            </div>

            {/* Scrollable letter */}
            <div style={{ position: "relative", zIndex: 2, height: "100%", overflowY: "auto" }}>
              <div style={{
                minHeight: "100%",
                display: "flex", flexDirection: "column", alignItems: "center",
                paddingTop: "calc(env(safe-area-inset-top, 0px) + clamp(58px,10vh,78px))",
                paddingLeft: "clamp(20px,5vw,40px)",
                paddingRight: "clamp(20px,5vw,40px)",
                paddingBottom: "clamp(40px,8vmin,70px)",
                gap: 30,
              }}>

                {/* ── Wall Banner Heading ── */}
                <div style={{ width: "100%", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(14px,3vh,22px)" }}>

                  {/* Banner rows — catenary string + hanging letter boxes */}
                  {(() => {
                    const SAG = 20, CTOP = 5, TH = 12;
                    const svgH = CTOP + SAG + TH;

                    const catY = (x: number, w: number) =>
                      CTOP + SAG * 4 * (x / w) * (1 - x / w);

                    const renderRow = (
                      chars: string[],
                      pal: { bg: string; bd: string; tx: string }[],
                      lw: number, lh: number, gp: number,
                      rots: number[], fs: string, delay: number,
                    ) => {
                      const n = chars.length;
                      const totalW = n * lw + (n - 1) * gp;
                      const xs = chars.map((_, i) => i * (lw + gp) + lw / 2);
                      return (
                        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
                          {/* Curved catenary + individual threads */}
                          <svg
                            viewBox={`0 0 ${totalW} ${svgH}`}
                            style={{
                              position: "absolute", top: 0,
                              left: "50%", transform: "translateX(-50%)",
                              width: totalW, maxWidth: "100%", height: svgH,
                              overflow: "visible", pointerEvents: "none",
                            }}
                          >
                            {/* Main catenary curve — gravity sag */}
                            <path
                              d={`M 0 ${CTOP} Q ${totalW / 2} ${CTOP + SAG} ${totalW} ${CTOP}`}
                              fill="none"
                              stroke="rgba(100,58,8,0.55)"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                            {/* Per-letter hanging thread */}
                            {xs.map((x, i) => {
                              const y1 = catY(x, totalW);
                              return (
                                <line key={i}
                                  x1={x} y1={y1} x2={x} y2={y1 + TH}
                                  stroke="rgba(100,58,8,0.4)" strokeWidth="0.8"
                                />
                              );
                            })}
                          </svg>
                          {/* Letter boxes — positioned by catenary height */}
                          <div style={{ display: "flex", alignItems: "flex-start", gap: `${gp}px` }}>
                            {chars.map((ch, i) => {
                              const lp = pal[i % pal.length];
                              const mt = catY(xs[i], totalW) + TH;
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ y: -30, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1, rotate: rots[i] ?? 0 }}
                                  transition={{ delay: delay + i * 0.07, type: "spring", stiffness: 300, damping: 18 }}
                                  style={{
                                    marginTop: mt,
                                    width: lw, height: lh, flexShrink: 0,
                                    background: lp.bg, border: `2px solid ${lp.bd}`,
                                    borderRadius: Math.round(lw * 0.14),
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "'Arial Black', Impact, sans-serif",
                                    fontWeight: 900, fontSize: fs, color: lp.tx,
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
                                    position: "relative", userSelect: "none",
                                  }}
                                >
                                  {/* String-hole dot at top */}
                                  <div style={{
                                    position: "absolute", top: -3, left: "50%",
                                    transform: "translateX(-50%)",
                                    width: 4, height: 4, borderRadius: "50%",
                                    background: lp.bd, opacity: 0.65,
                                  }} />
                                  {ch}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <>
                        {renderRow(
                          ["H","A","P","P","Y"],
                          [
                            { bg: "#FFD54F", bd: "#E5A800", tx: "#5A3500" },
                            { bg: "#FF8A80", bd: "#C62828", tx: "#5C0000" },
                            { bg: "#80D8FF", bd: "#0277BD", tx: "#01375A" },
                            { bg: "#CE93D8", bd: "#7B1FA2", tx: "#2A0042" },
                            { bg: "#A5D6A7", bd: "#2E7D32", tx: "#0A2E0C" },
                          ],
                          38, 44, 5, [-2, 1.5, -1.5, 2, -1], "22px", 0.15,
                        )}
                        {renderRow(
                          ["B","I","R","T","H","D","A","Y"],
                          [
                            { bg: "#A5D6A7", bd: "#2E7D32", tx: "#0A2E0C" },
                            { bg: "#FFD54F", bd: "#E5A800", tx: "#5A3500" },
                            { bg: "#FF8A80", bd: "#C62828", tx: "#5C0000" },
                            { bg: "#80D8FF", bd: "#0277BD", tx: "#01375A" },
                            { bg: "#CE93D8", bd: "#7B1FA2", tx: "#2A0042" },
                            { bg: "#FFCC80", bd: "#E65100", tx: "#5A1A00" },
                            { bg: "#FFD54F", bd: "#E5A800", tx: "#5A3500" },
                            { bg: "#FF8A80", bd: "#C62828", tx: "#5C0000" },
                          ],
                          30, 36, 4, [1.5, -2, 1, -1.5, 2, -1, 1.5, -2], "18px", 0.52,
                        )}
                      </>
                    );
                  })()}

                  {/* Gold ornament rule */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <div style={{ height: 1, width: 44, background: "linear-gradient(90deg, transparent, rgba(200,150,40,0.55))" }} />
                    <span style={{ color: "#C8952A", fontSize: 13, letterSpacing: 4 }}>✦</span>
                    <div style={{ height: 1, width: 44, background: "linear-gradient(90deg, rgba(200,150,40,0.55), transparent)" }} />
                  </div>

                </div>

                {/* ── Polaroids — adapts to photo count ── */}
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34 }}
                  style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: 390 }}
                >
                  {(() => {
                    const photoCount = images?.filter(Boolean).length ?? 0;
                    const polaroidStyle = (rot: number): React.CSSProperties => ({
                      background: "#fff",
                      padding: "7px 7px 28px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.14), 0 3px 10px rgba(0,0,0,0.07)",
                      borderRadius: 3,
                      border: "1px solid rgba(0,0,0,0.05)",
                    });

                    if (photoCount === 0) {
                      return null;
                    }

                    if (photoCount === 1) {
                      return (
                        <motion.div
                          initial={{ scale: 0, rotate: -5, opacity: 0 }}
                          animate={{ scale: 1, rotate: -2, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.5 }}
                          style={{ ...polaroidStyle(-2), maxWidth: 210 }}
                        >
                          <img src={images![0]} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} alt="" />
                        </motion.div>
                      );
                    }

                    if (photoCount === 2) {
                      return (
                        <div style={{ display: "flex", gap: "clamp(10px,3vw,20px)", justifyContent: "center", width: "100%" }}>
                          {([-6, 5] as const).map((rot, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, rotate: rot * 3, opacity: 0 }}
                              animate={{ scale: 1, rotate: rot, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.5 + i * 0.15 }}
                              style={{ ...polaroidStyle(rot), flex: "1 1 0", maxWidth: 160 }}
                            >
                              <img src={images![i]} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} alt="" />
                            </motion.div>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: "flex", gap: "clamp(8px,3vw,18px)", justifyContent: "center", width: "100%" }}>
                        {([-7, 5, -3] as const).map((rot, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, rotate: rot * 3, opacity: 0 }}
                            animate={{ scale: 1, rotate: rot, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.5 + i * 0.15 }}
                            style={{ ...polaroidStyle(rot), flex: "1 1 0", maxWidth: 118 }}
                          >
                            <img src={images![i]} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} alt="" />
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>

                {/* ── Letter text ── */}
                {letterText && (
                  <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.95 }}
                    style={{ width: "100%", maxWidth: 380 }}
                  >
                    {/* Vintage paper letter */}
                    <div style={{ position: "relative", transform: "rotate(-0.6deg)" }}>
                      {/* Paper base — warm parchment with aged tones */}
                      <div style={{
                        position: "relative",
                        background: "linear-gradient(160deg, #f9eed3 0%, #f3e4b9 30%, #f8eccc 60%, #faf2dc 100%)",
                        borderRadius: 2,
                        padding: "clamp(22px,5.5vw,32px) clamp(18px,4.5vw,28px)",
                        boxShadow:
                          "0 1px 2px rgba(0,0,0,0.05), " +
                          "0 6px 24px rgba(100,60,10,0.18), " +
                          "0 18px 48px rgba(80,45,5,0.10), " +
                          "inset 0 0 80px rgba(150,90,20,0.05)",
                        overflow: "hidden",
                      }}>
                        {/* Faint horizontal ruled lines */}
                        <div style={{
                          position: "absolute", inset: 0, pointerEvents: "none",
                          backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(140,90,20,0.07) 27px, rgba(140,90,20,0.07) 28px)",
                        }} />
                        {/* Aged corner darkening */}
                        <div style={{
                          position: "absolute", inset: 0, pointerEvents: "none",
                          background:
                            "radial-gradient(ellipse at 0% 0%,   rgba(110,65,10,0.09) 0%, transparent 45%), " +
                            "radial-gradient(ellipse at 100% 0%,  rgba(110,65,10,0.08) 0%, transparent 40%), " +
                            "radial-gradient(ellipse at 0% 100%,  rgba(110,65,10,0.08) 0%, transparent 40%), " +
                            "radial-gradient(ellipse at 100% 100%,rgba(110,65,10,0.09) 0%, transparent 45%)",
                        }} />
                        {/* Subtle centre fade to lighten mid-paper */}
                        <div style={{
                          position: "absolute", inset: 0, pointerEvents: "none",
                          background: "radial-gradient(ellipse at 50% 45%, rgba(255,248,220,0.28) 0%, transparent 70%)",
                        }} />

                        {/* Letter text */}
                        <p style={{
                          position: "relative", zIndex: 1,
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          fontSize: "clamp(13px,3.5vw,15px)",
                          color: "#3a1e0c",
                          lineHeight: 2.1,
                          whiteSpace: "pre-wrap",
                          fontStyle: "italic",
                          textAlign: "center",
                          margin: 0,
                          letterSpacing: "0.015em",
                        }}>
                          {letterText}
                        </p>
                      </div>
                      {/* Drop shadow beneath paper edge */}
                      <div style={{
                        position: "absolute", bottom: -6, left: "4%", right: "4%", height: 8,
                        background: "rgba(80,45,5,0.12)",
                        filter: "blur(6px)",
                        borderRadius: "0 0 4px 4px",
                        pointerEvents: "none",
                      }} />
                    </div>
                  </motion.div>
                )}

                {/* ── Signature ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: letterText ? 1.15 : 0.8 }}
                  style={{ textAlign: "center" }}
                >
                  <p style={{
                    fontFamily: "sans-serif",
                    fontSize: "clamp(9px, 2.2vw, 11px)",
                    color: "rgba(100,55,30,0.48)",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    margin: "0 0 4px",
                  }}>
                    With all my love,
                  </p>
                  <p style={{
                    fontFamily: "'Pinyon Script', cursive",
                    fontSize: "clamp(32px, 8vw, 50px)",
                    background: "linear-gradient(135deg, #B8751A 0%, #D4A843 50%, #B8751A 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    margin: 0,
                    lineHeight: 1.2,
                    filter: "drop-shadow(0 1px 6px rgba(180,120,20,0.2))",
                  }}>
                    {senderName || "Someone Special"}
                  </p>
                </motion.div>

                {/* ── Closing ornament ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, transparent, rgba(200,150,40,0.4))" }} />
                    <span style={{ color: "#D4A843", fontSize: 12 }}>✦</span>
                    <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, rgba(200,150,40,0.4), transparent)" }} />
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BirthdayBalloons;
