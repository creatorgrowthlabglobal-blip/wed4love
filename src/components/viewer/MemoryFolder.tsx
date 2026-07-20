import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image as ImageIcon, Flower2 } from "lucide-react";
import { sounds } from "@/lib/sounds";
import VaultEntry from "./vault/VaultEntry";
import VaultLetter from "./vault/VaultLetter";
import VaultMemories from "./vault/VaultMemories";
import VaultBouquet from "./vault/VaultBouquet";

import VaultEnding from "./vault/VaultEnding";

interface MemoryFolderProps {
  letterId?: string;
  letterText: string;
  senderName: string;
  receiverName: string;
  images: string[];
  musicUrl?: string | null;
}

type ActiveSection = null | "letter" | "memories" | "bouquet";

const vaultCards = [
  { id: "letter" as const, label: "The Letter", icon: FileText, description: "Words from the heart", emoji: "💌" },
  { id: "memories" as const, label: "Memories", icon: ImageIcon, description: "Moments captured", emoji: "🖼️" },
  { id: "bouquet" as const, label: "Bouquet", icon: Flower2, description: "Hidden feelings", emoji: "🌸" },
];

const MemoryFolder = ({ letterId, letterText, senderName, receiverName, images }: MemoryFolderProps) => {
  const [vaultOpen, setVaultOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  const handleVaultOpen = () => setVaultOpen(true);
  const openSection = (section: ActiveSection) => { sounds.paper(); setActiveSection(section); };
  const closeSection = () => setActiveSection(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
      <AnimatePresence mode="wait">
        {!vaultOpen ? (
          <VaultEntry key="entry" onOpen={handleVaultOpen} />
        ) : (
          <motion.div
            key="vault-contents"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{
              background: "linear-gradient(180deg, hsl(350 55% 93%) 0%, hsl(340 45% 86%) 50%, hsl(350 40% 82%) 100%)",
            }}
          >
            {/* Floating stickers */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {["💕", "✨", "🌸", "💌", "🎀"].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl select-none"
                  style={{ left: `${10 + i * 18}%`, top: `${8 + (i * 17) % 60}%` }}
                  animate={{ y: [-8, 8, -8], rotate: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 4 + i * 0.6, delay: i * 0.4, ease: "easeInOut" }}
                >
                  {emoji}
                </motion.div>
              ))}
              {/* Soft particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`p-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 2 + (i % 3), height: 2 + (i % 3),
                    background: `hsl(${340 + i * 3} ${60 + i * 2}% ${80 + (i % 5)}% / 0.4)`,
                    left: `${10 + (i * 8) % 80}%`, top: `${15 + (i * 9) % 65}%`,
                  }}
                  animate={{ y: [-12, 12, -12], opacity: [0, 0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 6 + i, delay: i * 0.5 }}
                />
              ))}
              {/* Spotlight */}
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
                style={{ background: "radial-gradient(ellipse, hsl(340 80% 85% / 0.2) 0%, transparent 60%)" }} />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-12 sm:py-16">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-center mb-10 sm:mb-14"
              >
                <p className="font-body text-xs tracking-[0.25em] uppercase mb-3"
                  style={{ color: "hsl(340 30% 50%)" }}>Your Memory Vault</p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold"
                  style={{ color: "hsl(340 30% 25%)" }}>
                  A Gift of Moments 💝
                </h1>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <div className="w-10 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(340 50% 65% / 0.4), transparent)" }} />
                  <span className="text-xs">✨</span>
                  <div className="w-10 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(340 50% 65% / 0.4), transparent)" }} />
                </div>
              </motion.div>

              {/* Four cards */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full max-w-md">
                {vaultCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.id}
                      initial={{ opacity: 0, y: 25, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.3 } }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openSection(card.id)}
                      className="relative rounded-2xl p-5 sm:p-6 text-center transition-all duration-500 group"
                      style={{
                        background: "linear-gradient(160deg, hsl(0 0% 100% / 0.7) 0%, hsl(350 60% 96% / 0.7) 100%)",
                        border: "1px solid hsl(340 40% 85% / 0.5)",
                        boxShadow: "0 8px 30px hsl(340 40% 60% / 0.1), 0 2px 8px hsl(0 0% 0% / 0.04)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ boxShadow: "inset 0 0 30px hsl(340 60% 75% / 0.1), 0 0 20px hsl(340 60% 75% / 0.08)" }} />

                      <span className="text-2xl mb-2 block">{card.emoji}</span>
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-3 transition-colors duration-300"
                        style={{ color: "hsl(340 50% 55%)", strokeWidth: 1.3 }} />
                      <p className="font-display text-sm sm:text-base font-medium mb-1"
                        style={{ color: "hsl(340 30% 25%)" }}>{card.label}</p>
                      <p className="font-body text-[11px]" style={{ color: "hsl(340 25% 50%)" }}>{card.description}</p>
                    </motion.button>
                  );
                })}
              </div>

              <VaultEnding letterId={letterId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section overlays */}
      <AnimatePresence>
        {activeSection === "letter" && (
          <VaultLetter key="vault-letter" letterText={letterText} senderName={senderName} receiverName={receiverName} onClose={closeSection} />
        )}
        {activeSection === "memories" && (
          <VaultMemories key="vault-memories" images={images} onClose={closeSection} />
        )}
        {activeSection === "bouquet" && (
          <VaultBouquet key="vault-bouquet" senderName={senderName} onClose={closeSection} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemoryFolder;
