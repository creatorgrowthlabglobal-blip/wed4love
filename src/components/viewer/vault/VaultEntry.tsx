import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface VaultEntryProps {
  onOpen: () => void;
}

const FloatingSticker = ({ emoji, index }: { emoji: string; index: number }) => {
  const positions = [
    { left: "8%", top: "15%" }, { left: "85%", top: "20%" },
    { left: "12%", top: "70%" }, { left: "80%", top: "75%" },
    { left: "50%", top: "8%" }, { left: "65%", top: "85%" },
  ];
  const pos = positions[index % positions.length];

  return (
    <motion.div
      className="absolute text-xl sm:text-2xl pointer-events-none select-none"
      style={{ left: pos.left, top: pos.top }}
      animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5], scale: [0.95, 1.05, 0.95] }}
      transition={{ repeat: Infinity, duration: 4 + index * 0.5, delay: index * 0.4, ease: "easeInOut" }}
    >
      {emoji}
    </motion.div>
  );
};

const VaultEntry = ({ onOpen }: VaultEntryProps) => {
  const handleOpen = () => {
    sounds.vaultUnlock();
    onOpen();
  };

  const stickers = ["💕", "✨", "🌸", "💌", "🦋", "🎀"];

  return (
    <motion.div
      key="vault-entry"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(180deg, hsl(350 55% 93%) 0%, hsl(340 45% 86%) 50%, hsl(350 40% 82%) 100%)",
      }}
    >
      {/* Floating stickers */}
      {stickers.map((emoji, i) => (
        <FloatingSticker key={i} emoji={emoji} index={i} />
      ))}

      {/* Soft spotlight */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(340 80% 85% / 0.3) 0%, transparent 60%)" }}
        />
        {/* Floating particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              background: `hsl(${340 + i * 3} ${60 + i * 2}% ${80 + (i % 5)}% / 0.5)`,
              left: `${10 + (i * 8) % 80}%`,
              top: `${10 + (i * 7) % 75}%`,
            }}
            animate={{ y: [-15, 15, -15], opacity: [0, 0.6, 0] }}
            transition={{ repeat: Infinity, duration: 6 + i, delay: i * 0.5, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="font-display text-sm sm:text-base tracking-widest uppercase mb-10 text-center"
        style={{ color: "hsl(340 35% 48%)" }}
      >
        A collection of moments that made us… us.
      </motion.p>

      {/* Folder */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        onClick={handleOpen}
        className="cursor-pointer relative group"
      >
        {/* Glow behind */}
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute -inset-8 rounded-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(340 70% 75% / 0.25) 0%, transparent 70%)" }}
        />

        {/* Folder body — soft pink/rose */}
        <div
          className="relative w-64 sm:w-72 h-44 sm:h-48 rounded-2xl overflow-hidden transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            background: "linear-gradient(160deg, hsl(340 50% 92%) 0%, hsl(340 45% 86%) 50%, hsl(340 40% 80%) 100%)",
            boxShadow: `
              0 20px 60px hsl(340 40% 60% / 0.25),
              0 4px 16px hsl(340 30% 50% / 0.15),
              inset 0 1px 0 hsl(0 0% 100% / 0.5),
              inset 0 -1px 0 hsl(340 30% 70% / 0.3)
            `,
          }}
        >
          {/* Texture */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 3px, hsl(0 0% 100%) 3px, transparent 4px)",
          }} />

          {/* Gold border */}
          <div className="absolute inset-[3px] rounded-xl border pointer-events-none"
            style={{ borderColor: "hsl(40 80% 75% / 0.3)" }} />

          {/* Center content */}
          <div className="flex flex-col items-center justify-center h-full relative z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <BookOpen className="w-10 h-10 mb-3" style={{ color: "hsl(340 40% 45%)", strokeWidth: 1.2 }} />
            </motion.div>
            <p className="font-display text-lg sm:text-xl font-semibold tracking-wide"
              style={{ color: "hsl(340 30% 35%)" }}>
              Our Memory Vault
            </p>
            <div className="mt-2 w-16 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(340 50% 60% / 0.5), transparent)" }} />
          </div>

          {/* Clasp */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full"
            style={{
              background: "linear-gradient(180deg, hsl(40 80% 75%) 0%, hsl(40 60% 55%) 100%)",
              boxShadow: "0 2px 8px hsl(40 72% 50% / 0.3)",
            }} />
        </div>
      </motion.div>

      {/* Tap prompt */}
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="mt-10 font-display text-sm tracking-widest"
        style={{ color: "hsl(340 35% 48%)" }}
      >
        Tap to open ✨
      </motion.p>
    </motion.div>
  );
};

export default VaultEntry;
