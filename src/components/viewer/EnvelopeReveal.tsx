import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sounds } from "@/lib/sounds";
import GiftBox3D from "@/components/viewer/GiftBox3D";

interface EnvelopeRevealProps {
  receiverName: string;
  onContinue: () => void;
}

const EnvelopeReveal = ({ receiverName, onContinue }: EnvelopeRevealProps) => {
  const [opened, setOpened] = useState(false);
  const [envelopeReady, setEnvelopeReady] = useState(false);

  const handleOpen = () => {
    if (opened) return;
    sounds.envelopeOpen();
    setOpened(true);
  };

  const handleEnvelopeReady = () => {
    setEnvelopeReady(true);
  };

  const handleEnvelopeTap = () => {
    if (envelopeReady) {
      onContinue();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, hsl(340 60% 28%) 0%, hsl(340 45% 16%) 30%, hsl(340 30% 8%) 60%, hsl(350 20% 4%) 100%)",
      }}
    >
      {/* Romantic warm overlays */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 25% 20%, hsl(340 50% 25% / 0.2) 0%, transparent 45%), " +
            "radial-gradient(circle at 75% 75%, hsl(350 40% 20% / 0.15) 0%, transparent 45%), " +
            "radial-gradient(circle at 50% 50%, hsl(340 35% 18% / 0.25) 0%, transparent 55%)",
        }}
      />

      {/* Soft bloom overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, hsl(340 60% 30% / 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, hsl(0 0% 0% / 0.55) 100%)",
        }}
      />

      {/* Top text */}
      <div className="relative z-20 flex flex-col items-center pt-8 sm:pt-12">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="pre-open"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              <motion.p
                className="font-body text-[10px] sm:text-xs tracking-[0.5em] uppercase mb-4"
                style={{ color: "hsl(340 30% 60%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Something special awaits
              </motion.p>

              <motion.h1
                className="font-display text-2xl sm:text-4xl md:text-5xl font-semibold mb-5"
                style={{
                  color: "hsl(340 20% 85%)",
                  textShadow:
                    "0 0 80px hsl(340 60% 45% / 0.35), 0 2px 12px hsl(0 0% 0% / 0.5)",
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.9 }}
              >
                For {receiverName}
              </motion.h1>

              <motion.div
                className="flex items-center justify-center gap-6"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.5, duration: 0.7 }}
              >
                <div
                  className="w-20 h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent, hsl(340 40% 55% / 0.5), transparent)",
                  }}
                />
                <span className="text-sm" style={{ color: "hsl(340 40% 60%)" }}>♥</span>
                <div
                  className="w-20 h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent, hsl(340 40% 55% / 0.5), transparent)",
                  }}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="post-open"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <motion.p
                className="font-display text-base sm:text-xl md:text-2xl font-light italic"
                style={{
                  color: "hsl(340 40% 70%)",
                  textShadow: "0 0 50px hsl(340 60% 50% / 0.3)",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 3.5 }}
              >
                A gift from the heart…
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3D Gift Box */}
      <div className="flex-1 relative z-10 cursor-pointer min-h-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-8 h-8 mx-auto mb-4 rounded-full"
                  style={{
                    border: "2px solid hsl(340 20% 25%)",
                    borderTopColor: "hsl(340 50% 60%)",
                  }}
                />
                <p className="font-body text-xs tracking-widest uppercase" style={{ color: "hsl(340 20% 45%)" }}>
                  Preparing your gift…
                </p>
              </div>
            </div>
          }
        >
          <div onClick={handleEnvelopeTap} className="w-full h-full">
            <GiftBox3D opened={opened} onOpen={handleOpen} receiverName={receiverName} onEnvelopeReady={handleEnvelopeReady} />
          </div>
        </Suspense>
      </div>

      {/* Bottom prompt */}
      <div className="relative z-20 pb-6 sm:pb-10 flex justify-center">
        <AnimatePresence>
          {!opened && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 1.8, duration: 0.7 }}
              className="text-center"
            >
              <motion.p
                animate={{ opacity: [0.2, 0.65, 0.2] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="font-body text-[10px] sm:text-xs tracking-[0.35em] uppercase"
                style={{ color: "hsl(340 30% 55%)" }}
              >
                Tap to unwrap your gift
              </motion.p>

              <motion.div
                className="mt-3 flex justify-center"
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(340 30% 55%)" strokeWidth="1.5">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnvelopeReveal;
