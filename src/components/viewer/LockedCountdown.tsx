import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Heart } from "lucide-react";

interface LockedCountdownProps {
  unlockAt: string;
  senderName?: string;
  onUnlocked: () => void;
}

const getRemaining = (unlockAt: string) => {
  const diff = new Date(unlockAt).getTime() - Date.now();
  return Math.max(0, diff);
};

const split = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const Unit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div
      className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center bg-white/90"
      style={{ boxShadow: "0 8px 24px rgba(200,80,120,0.2)" }}
    >
      <span className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span className="font-body text-xs text-foreground/60 mt-2 uppercase tracking-wide">{label}</span>
  </div>
);

/**
 * Sealed-until-a-date screen for the "locked countdown link" premium
 * feature. Purely a client-side time check — letters are viewed via a
 * share link (pull-based), never pushed anywhere, so no cron/scheduling
 * backend is needed to "deliver" it; the recipient's browser just
 * compares now() to unlockAt on load and again every second.
 */
const LockedCountdown = ({ unlockAt, senderName, onUnlocked }: LockedCountdownProps) => {
  const [remaining, setRemaining] = useState(() => getRemaining(unlockAt));

  useEffect(() => {
    const t = setInterval(() => {
      const r = getRemaining(unlockAt);
      setRemaining(r);
      if (r <= 0) {
        clearInterval(t);
        onUnlocked();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [unlockAt, onUnlocked]);

  const { days, hours, minutes, seconds } = split(remaining);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: "0 8px 24px rgba(200,80,120,0.25)" }}
        >
          <Lock className="w-6 h-6 text-primary" />
        </motion.div>

        <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-3">
          {senderName ? `${senderName} has sealed this letter` : "This letter is sealed"}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
          It'll unlock soon <Heart className="w-5 h-5 inline text-primary fill-primary/30" />
        </h1>

        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {days > 0 && <Unit value={days} label="days" />}
          <Unit value={hours} label="hours" />
          <Unit value={minutes} label="min" />
          <Unit value={seconds} label="sec" />
        </div>

        <p className="font-body text-sm text-muted-foreground mt-8">
          Come back when the countdown ends — the letter will open right up.
        </p>
      </motion.div>
    </div>
  );
};

export default LockedCountdown;
