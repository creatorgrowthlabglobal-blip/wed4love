import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  popped: boolean;
}

interface BdayConfetti {
  id: number;
  x: number;
  color: string;
  rotate: number;
  duration: number;
  delay: number;
  size: number;
}

interface BalloonGameProps {
  onComplete: () => void;
}

const COLORS = [
  "linear-gradient(180deg, #ff8fab 0%, #e05080 100%)",
  "linear-gradient(180deg, #ffb3c6 0%, #d06090 100%)",
  "linear-gradient(180deg, #ffd1dc 0%, #e88faa 100%)",
  "linear-gradient(180deg, #e0bbe4 0%, #b08cc0 100%)",
  "linear-gradient(180deg, #f7c873 0%, #d4a030 100%)",
  "linear-gradient(180deg, #a0d8ef 0%, #70b0d0 100%)",
];

const CONFETTI_COLORS = ["#ff8fab", "#f7c873", "#a0d8ef", "#e0bbe4", "#ffb347", "#90ee90", "#ff6b6b", "#ffd700"];

const BalloonGame = ({ onComplete }: BalloonGameProps) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [phase, setPhase] = useState<"game" | "countdown" | "birthday">("game");
  const [countdownNum, setCountdownNum] = useState(5);
  const [bdayConfetti, setBdayConfetti] = useState<BdayConfetti[]>([]);
  const target = 12;
  const nextId = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const spawnBalloon = useCallback(() => {
    if (phaseRef.current !== "game") return;
    const b: Balloon = {
      id: nextId.current++,
      x: 10 + Math.random() * 80,
      y: 110,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 50 + Math.random() * 20,
      speed: 1.5 + Math.random() * 2,
      popped: false,
    };
    setBalloons((prev) => [...prev.slice(-20), b]);
  }, []);

  useEffect(() => {
    const interval = setInterval(spawnBalloon, 800);
    return () => clearInterval(interval);
  }, [spawnBalloon]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (phaseRef.current !== "game") return;
      setBalloons((prev) => prev
        .map((b) => ({ ...b, y: b.popped ? b.y : b.y - b.speed * 0.5 }))
        .filter((b) => b.y > -20 || b.popped)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (score >= target && phase === "game") {
      setPhase("countdown");
      setBalloons([]);
      let n = 5;
      setCountdownNum(n);
      const interval = setInterval(() => {
        n--;
        if (n === 0) {
          clearInterval(interval);
          // Generate birthday confetti
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
      return () => clearInterval(interval);
    }
  }, [score, phase, onComplete]);

  const popBalloon = (b: Balloon) => {
    if (b.popped || phase !== "game") return;
    sounds.balloonPop();
    setBalloons((prev) => prev.map((bal) => bal.id === b.id ? { ...bal, popped: true } : bal));
    setScore((s) => s + 1);

    const newConfetti = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: b.x,
      y: b.y,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setConfetti((prev) => [...prev, ...newConfetti]);
    setTimeout(() => {
      setConfetti((prev) => prev.filter((c) => !newConfetti.find((nc) => nc.id === c.id)));
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #e8f4ff 0%, #ffeef2 50%, #fff3e8 100%)" }}
    >
      {/* Header */}
      <div className="relative z-20 pt-8 px-6 text-center">
        <p className="font-heading text-xs uppercase tracking-widest mb-1" style={{ color: "hsl(340 50% 60%)" }}>
          🎂 Birthday Surprise
        </p>
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "#4B2E2E" }}>
          Pop the Balloons!
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(200,160,180,0.3)",
        }}>
          <span className="font-heading text-sm font-semibold" style={{ color: "#4B2E2E" }}>
            🎈 {score} / {target}
          </span>
        </div>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(200,160,180,0.2)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #ff8fab, #f7c873)" }}
            animate={{ width: `${(score / target) * 100}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
      </div>

      {/* Balloons */}
      {phase === "game" && balloons.map((b) => (
        <AnimatePresence key={b.id}>
          {!b.popped ? (
            <motion.div
              initial={{ y: "100vh", scale: 0.5 }}
              animate={{ y: `${b.y}%`, scale: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ y: { duration: 0 }, scale: { duration: 0.3 } }}
              onClick={() => popBalloon(b)}
              className="absolute cursor-pointer"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size * 1.2,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-full h-full rounded-full relative" style={{
                background: b.color,
                boxShadow: "inset -5px -5px 15px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.1)",
              }}>
                <div className="absolute top-2 left-3 w-3 h-4 rounded-full" style={{
                  background: "rgba(255,255,255,0.4)",
                  transform: "rotate(-30deg)",
                }} />
              </div>
              <div className="absolute bottom-0 left-1/2 w-px h-6" style={{
                background: "rgba(180,140,160,0.5)",
                transform: "translateX(-50%)",
              }} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      ))}

      {/* Pop confetti */}
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          initial={{ x: `${c.x}%`, y: `${c.y}%`, scale: 1, opacity: 1 }}
          animate={{
            x: `${c.x + (Math.random() - 0.5) * 20}%`,
            y: `${c.y + 15}%`,
            scale: 0,
            opacity: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 0.8 }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ background: c.color }}
        />
      ))}

      {/* Countdown overlay */}
      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
            style={{ background: "rgba(255, 235, 245, 0.92)" }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={countdownNum}
                initial={{ scale: 2.5, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.3, opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="font-display font-bold select-none"
                style={{ fontSize: "10rem", lineHeight: 1, color: "#e05080", textShadow: "0 4px 24px rgba(224,80,128,0.3)" }}
              >
                {countdownNum}
              </motion.p>
            </AnimatePresence>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-heading text-sm uppercase tracking-widest mt-4"
              style={{ color: "hsl(340 50% 60%)" }}
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
            className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(180deg, #ffe0ec 0%, #fff8e1 50%, #e8f4ff 100%)" }}
          >
            {/* Falling confetti */}
            {bdayConfetti.map((c) => (
              <motion.div
                key={c.id}
                initial={{ y: "-5vh", x: `${c.x}vw`, opacity: 1, rotate: 0 }}
                animate={{ y: "110vh", opacity: 0.9, rotate: c.rotate }}
                transition={{ duration: c.duration, delay: c.delay, ease: "linear" }}
                className="absolute rounded-sm"
                style={{
                  background: c.color,
                  width: c.size,
                  height: c.size * 0.6,
                  top: 0,
                  left: 0,
                }}
              />
            ))}

            {/* Poppers */}
            {["🎉", "🎊"].map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: i === 0 ? -30 : 30, opacity: 0 }}
                animate={{ scale: [0, 1.4, 1], rotate: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.5, type: "spring" }}
                className="absolute text-6xl select-none"
                style={{ left: i === 0 ? "8%" : "auto", right: i === 1 ? "8%" : "auto", top: "30%" }}
              >
                {emoji}
              </motion.span>
            ))}

            <div className="relative z-10 text-center px-6">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                style={{ fontSize: "3.5rem", lineHeight: 1 }}
              >
                🎂
              </motion.div>

              <motion.h1
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 150 }}
                className="font-display font-bold mt-3"
                style={{ fontSize: "2.6rem", color: "#4B2E2E", textShadow: "0 2px 12px rgba(224,80,128,0.2)" }}
              >
                Happy Birthday!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="font-body mt-3 text-lg"
                style={{ color: "#8a6060" }}
              >
                🎈 Your surprise is ready! 🎈
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BalloonGame;
