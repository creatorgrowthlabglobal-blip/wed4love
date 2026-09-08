import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, X } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface VaultSecretProps {
  senderName: string;
  pin: string;
  onClose: () => void;
}

const VaultSecret = ({ senderName, pin, onClose }: VaultSecretProps) => {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const secretMessage = `You are my favorite chapter in every story I've ever lived. No matter where time takes us, I will always find my way back to you. — ${senderName}`;

  const handleSubmit = () => {
    if (input.trim().toLowerCase() === pin.toLowerCase() || input === pin) {
      sounds.secretReveal();
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: "hsl(350 50% 88% / 0.95)", backdropFilter: "blur(16px)" }}>

      <motion.button onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed top-5 left-5 z-[80] flex items-center gap-2 px-4 py-2.5 rounded-full"
        style={{ background: "hsl(0 0% 100% / 0.6)", backdropFilter: "blur(8px)", border: "1px solid hsl(340 40% 80% / 0.5)" }}>
        <X className="w-4 h-4" style={{ color: "hsl(340 30% 40%)" }} />
        <span className="font-body text-xs tracking-wider" style={{ color: "hsl(340 30% 40%)" }}>Back</span>
      </motion.button>

      <div className="w-full max-w-sm mx-auto text-center">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div key="locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                <Lock className="w-10 h-10 mx-auto mb-6" style={{ color: "hsl(340 50% 55%)", strokeWidth: 1.2 }} />
              </motion.div>

              <p className="font-display text-lg mb-2" style={{ color: "hsl(340 30% 30%)" }}>A Message Just For You 🔒</p>
              <p className="font-body text-sm mb-8" style={{ color: "hsl(340 25% 50%)" }}>Enter the PIN to unlock</p>

              <div className="relative mb-4">
                <input type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Enter PIN..."
                  className="w-full text-center font-typewriter text-lg py-3 px-4 rounded-xl outline-none transition-all duration-300"
                  style={{
                    background: "hsl(0 0% 100% / 0.7)",
                    color: "hsl(340 30% 25%)",
                    border: `1px solid ${error ? "hsl(0 60% 60% / 0.6)" : "hsl(340 50% 75% / 0.5)"}`,
                    boxShadow: error ? "0 0 16px hsl(0 60% 60% / 0.15)" : "0 0 16px hsl(340 60% 75% / 0.1)",
                  }} />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="font-body text-xs mb-4" style={{ color: "hsl(0 55% 50%)" }}>
                  That's not quite right. Try again.
                </motion.p>
              )}

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl font-display text-sm tracking-wider transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, hsl(340 70% 65%) 0%, hsl(340 60% 55%) 100%)",
                  color: "white",
                  boxShadow: "0 4px 16px hsl(340 60% 50% / 0.3)",
                }}>
                Unlock 💕
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="unlocked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>

              {/* Sparkles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0.5], x: (i - 3) * 30, y: -20 + (i % 3) * -15 }}
                  transition={{ duration: 1.2, delay: i * 0.1 }}
                  className="absolute top-1/3 left-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ background: "hsl(340 70% 70%)" }} />
              ))}

              <Unlock className="w-10 h-10 mx-auto mb-6" style={{ color: "hsl(340 50% 55%)", strokeWidth: 1.2 }} />

              <div className="rounded-xl p-6 sm:p-8" style={{
                background: "hsl(0 0% 100% / 0.7)",
                border: "1px solid hsl(340 40% 80% / 0.5)",
                boxShadow: "0 16px 50px hsl(340 40% 60% / 0.15)",
              }}>
                <p className="font-display text-base sm:text-lg italic leading-relaxed" style={{ color: "hsl(340 30% 25%)" }}>
                  "{secretMessage}"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VaultSecret;
