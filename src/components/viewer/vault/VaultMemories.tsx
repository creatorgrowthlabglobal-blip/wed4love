import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";

interface VaultMemoriesProps {
  images: string[];
  onClose: () => void;
}

const VaultMemories = ({ images, onClose }: VaultMemoriesProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const rotations = images.map((_, i) => {
    const seed = (i * 7 + 3) % 11;
    return (seed - 5) * 0.8;
  });

  const BackButton = () => (
    <motion.button onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed top-5 left-5 z-[80] flex items-center gap-2 px-4 py-2.5 rounded-full"
      style={{ background: "hsl(0 0% 100% / 0.6)", backdropFilter: "blur(8px)", border: "1px solid hsl(340 40% 80% / 0.5)" }}>
      <X className="w-4 h-4" style={{ color: "hsl(340 30% 40%)" }} />
      <span className="font-body text-xs tracking-wider" style={{ color: "hsl(340 30% 40%)" }}>Back</span>
    </motion.button>
  );

  if (images.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center px-4"
        style={{ background: "hsl(350 50% 88% / 0.95)", backdropFilter: "blur(12px)" }}>
        <BackButton />
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4" style={{ color: "hsl(340 30% 60%)" }} />
          <p className="font-display text-lg" style={{ color: "hsl(340 30% 40%)" }}>No memories were added</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ background: "hsl(350 50% 88% / 0.95)", backdropFilter: "blur(12px)" }}>
      <BackButton />

      <div className="w-full max-w-lg mx-auto my-auto">
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-center font-display text-xl mb-2" style={{ color: "hsl(340 30% 30%)" }}>
          Our Memories 🖼️
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center font-body text-sm mb-8" style={{ color: "hsl(340 25% 50%)" }}>
          Tap a photo to view it closer
        </motion.p>

        <div className="grid grid-cols-2 gap-5 sm:gap-6">
          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: rotations[i] }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, rotate: 0, transition: { duration: 0.3 } }}
              onClick={() => setSelectedImage(i)}
              className="cursor-pointer"
            >
              <div className="rounded-sm overflow-hidden relative"
                style={{
                  background: "hsl(30 60% 97%)",
                  padding: "8px 8px 32px 8px",
                  boxShadow: "0 8px 30px hsl(340 40% 60% / 0.15), 0 2px 8px hsl(0 0% 0% / 0.08)",
                  isolation: "isolate",
                  transform: "translateZ(0)",
                }}>
                <img src={src} alt={`Memory ${i + 1}`} className="w-full aspect-square object-contain" />
                <p className="absolute bottom-2 left-0 right-0 text-center font-typewriter text-[10px] tracking-wider"
                  style={{ color: "hsl(340 20% 55%)" }}>
                  Memory #{i + 1}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center px-6"
            style={{ background: "hsl(340 30% 30% / 0.85)", backdropFilter: "blur(16px)" }}
            onClick={() => setSelectedImage(null)}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="rounded-sm overflow-hidden"
                style={{ background: "hsl(30 60% 97%)", padding: "10px 10px 40px 10px", boxShadow: "0 30px 80px hsl(0 0% 0% / 0.3)" }}>
                <img src={images[selectedImage]} alt={`Memory ${selectedImage + 1}`} className="w-full aspect-auto max-h-[60vh] object-contain" />
                <p className="text-center font-typewriter text-xs mt-2 tracking-wider" style={{ color: "hsl(340 20% 55%)" }}>
                  Memory #{selectedImage + 1}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VaultMemories;
