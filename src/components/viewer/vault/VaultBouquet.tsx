import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flower, Flower2, TreePine } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface VaultBouquetProps {
  senderName: string;
  onClose: () => void;
}

interface FlowerData {
  name: string;
  label: string;
  message: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
}

const VaultBouquet = ({ senderName, onClose }: VaultBouquetProps) => {
  const [revealedFlower, setRevealedFlower] = useState<number | null>(null);
  const [petalsDropped, setPetalsDropped] = useState<number[]>([]);

  const flowers: FlowerData[] = [
    {
      name: "Rose", label: "Admiration",
      message: `One thing ${senderName} admires most about you — your beautiful soul that lights up every room.`,
      color: "hsl(350 55% 55%)", glowColor: "hsl(350 55% 55% / 0.2)",
      icon: <Flower className="w-full h-full" strokeWidth={1.2} />,
    },
    {
      name: "Tulip", label: "Memory",
      message: `A memory ${senderName} replays often — the first time you made them laugh until their heart ached.`,
      color: "hsl(340 50% 60%)", glowColor: "hsl(340 50% 60% / 0.2)",
      icon: <Flower2 className="w-full h-full" strokeWidth={1.2} />,
    },
    {
      name: "Lily", label: "Promise",
      message: `A promise from ${senderName} — to always choose you, in every version of this life.`,
      color: "hsl(340 40% 50%)", glowColor: "hsl(340 40% 50% / 0.2)",
      icon: <TreePine className="w-full h-full" strokeWidth={1.2} />,
    },
  ];

  const handleFlowerClick = (index: number) => {
    if (petalsDropped.includes(index)) { setRevealedFlower(index); return; }
    sounds.petalFall();
    setPetalsDropped((prev) => [...prev, index]);
    setTimeout(() => setRevealedFlower(index), 600);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6"
      style={{ background: "hsl(350 50% 88% / 0.95)", backdropFilter: "blur(12px)" }}>

      <motion.button onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed top-5 left-5 z-[80] flex items-center gap-2 px-4 py-2.5 rounded-full"
        style={{ background: "hsl(0 0% 100% / 0.6)", backdropFilter: "blur(8px)", border: "1px solid hsl(340 40% 80% / 0.5)" }}>
        <X className="w-4 h-4" style={{ color: "hsl(340 30% 40%)" }} />
        <span className="font-body text-xs tracking-wider" style={{ color: "hsl(340 30% 40%)" }}>Back</span>
      </motion.button>

      {/* Floating stickers */}
      {["🌸", "🌷", "🌺"].map((e, i) => (
        <motion.div key={i} className="absolute text-2xl pointer-events-none select-none"
          style={{ left: `${15 + i * 30}%`, top: `${10 + i * 15}%` }}
          animate={{ y: [-6, 6, -6], rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.5 }} >
          {e}
        </motion.div>
      ))}

      <div className="w-full max-w-md mx-auto text-center">
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-display text-xl mb-2" style={{ color: "hsl(340 30% 30%)" }}>
          A Bouquet of Feelings 🌸
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="font-body text-sm mb-10" style={{ color: "hsl(340 25% 50%)" }}>
          Each flower holds a hidden message. Tap to reveal.
        </motion.p>

        <div className="flex justify-center gap-8 sm:gap-12">
          {flowers.map((flower, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleFlowerClick(i)}>

              <motion.div
                animate={petalsDropped.includes(i) ? { opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] } : { opacity: 0.1 }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute w-24 h-24 rounded-full -z-10"
                style={{ background: `radial-gradient(circle, ${flower.glowColor}, transparent 70%)` }} />

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="w-14 h-14 sm:w-16 sm:h-16 relative" style={{ color: flower.color }}>
                {flower.icon}
                <AnimatePresence>
                  {petalsDropped.includes(i) && !revealedFlower && (
                    <>
                      {[0, 1, 2].map((p) => (
                        <motion.div key={p}
                          initial={{ opacity: 0.8, x: 0, y: 0, rotate: 0, scale: 0.6 }}
                          animate={{ opacity: 0, x: (p - 1) * 20, y: 40 + p * 10, rotate: (p - 1) * 45, scale: 0.3 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                          style={{ background: flower.color }} />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>

              <p className="mt-3 font-display text-xs tracking-wider" style={{ color: "hsl(340 30% 45%)" }}>{flower.name}</p>
              <p className="font-body text-[10px] mt-0.5" style={{ color: "hsl(340 25% 55%)" }}>{flower.label}</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {revealedFlower !== null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6 }} className="mt-12 max-w-sm mx-auto">
              <div className="rounded-xl p-6" style={{
                background: "hsl(0 0% 100% / 0.7)",
                border: "1px solid hsl(340 40% 80% / 0.5)",
                boxShadow: "0 8px 30px hsl(340 40% 60% / 0.12)",
              }}>
                <p className="font-display text-sm italic leading-relaxed" style={{ color: "hsl(340 30% 30%)" }}>
                  "{flowers[revealedFlower].message}"
                </p>
              </div>
              <button onClick={() => setRevealedFlower(null)}
                className="mt-4 font-body text-xs tracking-wider transition-colors"
                style={{ color: "hsl(340 30% 50%)" }}>
                Close message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VaultBouquet;
