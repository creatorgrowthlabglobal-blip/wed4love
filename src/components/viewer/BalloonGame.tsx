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

const BalloonGame = ({ onComplete }: BalloonGameProps) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const target = 12;
  const nextId = useRef(0);

  const spawnBalloon = useCallback(() => {
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
      setBalloons((prev) => prev
        .map((b) => ({ ...b, y: b.popped ? b.y : b.y - b.speed * 0.5 }))
        .filter((b) => b.y > -20 || b.popped)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (score >= target) {
      setTimeout(onComplete, 1500);
    }
  }, [score, onComplete]);

  const popBalloon = (b: Balloon) => {
    if (b.popped) return;
    sounds.balloonPop();
    setBalloons((prev) => prev.map((bal) => bal.id === b.id ? { ...bal, popped: true } : bal));
    setScore((s) => s + 1);

    // Add confetti
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
      <div className="relative z-10 pt-8 px-6 text-center">
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
      {balloons.map((b) => (
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
                {/* Shine */}
                <div className="absolute top-2 left-3 w-3 h-4 rounded-full" style={{
                  background: "rgba(255,255,255,0.4)",
                  transform: "rotate(-30deg)",
                }} />
              </div>
              {/* String */}
              <div className="absolute bottom-0 left-1/2 w-px h-6" style={{
                background: "rgba(180,140,160,0.5)",
                transform: "translateX(-50%)",
              }} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      ))}

      {/* Confetti */}
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

      {/* Complete message */}
      {score >= target && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{ background: "rgba(255,255,255,0.8)" }}
        >
          <div className="text-center">
            <p className="text-5xl mb-4">🎉</p>
            <p className="font-display text-3xl font-bold" style={{ color: "#4B2E2E" }}>
              Amazing!
            </p>
            <p className="font-body text-base mt-2" style={{ color: "#8a6060" }}>
              Let's continue to your gift...
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BalloonGame;
