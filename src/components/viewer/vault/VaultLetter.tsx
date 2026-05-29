import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface VaultLetterProps {
  letterText: string;
  senderName: string;
  receiverName: string;
  onClose: () => void;
}

const VaultLetter = ({ letterText, senderName, receiverName, onClose }: VaultLetterProps) => {
  const [visibleChars, setVisibleChars] = useState(0);
  const [showFull, setShowFull] = useState(false);
  const text = letterText || "No letter text written yet.";

  useEffect(() => {
    if (showFull) return;
    if (visibleChars >= text.length) { setShowFull(true); return; }
    const timer = setTimeout(() => setVisibleChars((v) => v + 1), 18);
    return () => clearTimeout(timer);
  }, [visibleChars, text.length, showFull]);

  const skipTypewriter = () => { setVisibleChars(text.length); setShowFull(true); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[70] overflow-y-auto px-4 py-6"
      style={{ background: "hsl(30 20% 30% / 0.7)", backdropFilter: "blur(12px)" }}
    >
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        onClick={onClose}
        className="fixed top-5 left-5 z-[80] flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors duration-300"
        style={{ background: "hsl(0 0% 100% / 0.6)", backdropFilter: "blur(8px)", border: "1px solid hsl(30 30% 70% / 0.5)" }}
      >
        <X className="w-4 h-4" style={{ color: "hsl(30 20% 30%)" }} />
        <span className="font-body text-xs tracking-wider" style={{ color: "hsl(30 20% 30%)" }}>Back</span>
      </motion.button>

      <div className="min-h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative my-6"
      >
        {/* Vintage paper */}
        <div
          className="relative"
          style={{
            background: "linear-gradient(170deg, hsl(38 45% 86%) 0%, hsl(32 40% 82%) 40%, hsl(28 35% 78%) 100%)",
            boxShadow: "0 20px 60px hsl(30 30% 20% / 0.35), 0 4px 16px hsl(0 0% 0% / 0.1), inset 0 0 80px hsl(30 30% 60% / 0.15)",
            border: "1px solid hsl(30 25% 65% / 0.4)",
          }}
        >
          {/* Aged paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
            backgroundImage: `radial-gradient(ellipse at 20% 50%, hsl(30 40% 40%) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, hsl(30 30% 50%) 0%, transparent 40%),
              radial-gradient(ellipse at 60% 80%, hsl(25 35% 45%) 0%, transparent 45%)`,
          }} />

          {/* Top-left floral corner */}
          <div className="absolute top-0 left-0 w-28 h-28 pointer-events-none opacity-60">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <g fill="none" stroke="hsl(30 40% 45%)" strokeWidth="0.8" opacity="0.5">
                <path d="M5,60 Q20,40 15,20 Q30,30 40,15 Q35,35 55,25 Q45,40 60,45" />
                <path d="M10,80 Q25,60 20,40 Q35,50 45,35" />
                <circle cx="15" cy="18" r="6" fill="hsl(45 50% 55% / 0.4)" stroke="hsl(45 40% 40%)" strokeWidth="0.6" />
                <circle cx="42" cy="12" r="4" fill="hsl(340 35% 55% / 0.3)" stroke="hsl(340 30% 45%)" strokeWidth="0.6" />
                <circle cx="8" cy="45" r="5" fill="hsl(25 45% 50% / 0.3)" stroke="hsl(25 35% 40%)" strokeWidth="0.6" />
                <path d="M15,18 L12,25 M15,18 L20,24 M15,18 L15,26" stroke="hsl(120 20% 40%)" strokeWidth="0.5" />
                <path d="M42,12 L38,18 M42,12 L45,19" stroke="hsl(120 20% 40%)" strokeWidth="0.5" />
                <ellipse cx="30" cy="8" rx="8" ry="3" fill="hsl(120 25% 35% / 0.2)" />
                <ellipse cx="5" cy="35" rx="3" ry="7" fill="hsl(120 25% 35% / 0.2)" />
              </g>
            </svg>
          </div>

          {/* Top-right floral corner */}
          <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none opacity-60" style={{ transform: "scaleX(-1)" }}>
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <g fill="none" stroke="hsl(30 40% 45%)" strokeWidth="0.8" opacity="0.5">
                <path d="M5,60 Q20,40 15,20 Q30,30 40,15 Q35,35 55,25 Q45,40 60,45" />
                <path d="M10,80 Q25,60 20,40 Q35,50 45,35" />
                <circle cx="15" cy="18" r="6" fill="hsl(340 40% 55% / 0.4)" stroke="hsl(340 35% 45%)" strokeWidth="0.6" />
                <circle cx="42" cy="12" r="4" fill="hsl(45 50% 55% / 0.3)" stroke="hsl(45 40% 40%)" strokeWidth="0.6" />
                <circle cx="8" cy="45" r="5" fill="hsl(30 45% 55% / 0.3)" stroke="hsl(30 35% 40%)" strokeWidth="0.6" />
                <path d="M15,18 L12,25 M15,18 L20,24 M15,18 L15,26" stroke="hsl(120 20% 40%)" strokeWidth="0.5" />
                <ellipse cx="30" cy="8" rx="8" ry="3" fill="hsl(120 25% 35% / 0.2)" />
              </g>
            </svg>
          </div>

          {/* Bottom-left floral corner */}
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none opacity-50">
            <svg viewBox="0 0 130 130" className="w-full h-full">
              <g fill="none" stroke="hsl(30 40% 45%)" strokeWidth="0.8" opacity="0.5">
                <path d="M10,130 Q15,100 25,90 Q20,80 30,70 Q40,85 50,75 Q45,90 60,95" />
                <circle cx="20" cy="105" r="7" fill="hsl(45 50% 55% / 0.35)" stroke="hsl(45 40% 40%)" strokeWidth="0.6" />
                <circle cx="35" cy="115" r="5" fill="hsl(340 35% 50% / 0.3)" stroke="hsl(340 30% 40%)" strokeWidth="0.6" />
                <circle cx="50" cy="100" r="4" fill="hsl(25 50% 50% / 0.25)" stroke="hsl(25 35% 40%)" strokeWidth="0.6" />
                <path d="M20,105 L18,98 M20,105 L25,98" stroke="hsl(120 20% 40%)" strokeWidth="0.5" />
                <ellipse cx="12" cy="95" rx="4" ry="8" fill="hsl(120 25% 35% / 0.2)" />
                <ellipse cx="40" cy="120" rx="9" ry="3" fill="hsl(120 25% 35% / 0.2)" />
                {/* butterfly */}
                <path d="M55,118 Q50,112 52,108 Q55,112 58,108 Q60,112 55,118" fill="hsl(30 30% 40% / 0.15)" stroke="hsl(30 25% 40%)" strokeWidth="0.5" />
              </g>
            </svg>
          </div>

          {/* Bottom-right floral corner */}
          <div className="absolute bottom-0 right-0 w-28 h-28 pointer-events-none opacity-50" style={{ transform: "scaleX(-1)" }}>
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <g fill="none" stroke="hsl(30 40% 45%)" strokeWidth="0.8" opacity="0.5">
                <path d="M10,120 Q15,95 25,85 Q30,95 45,90" />
                <circle cx="18" cy="100" r="5" fill="hsl(340 35% 55% / 0.3)" stroke="hsl(340 30% 45%)" strokeWidth="0.6" />
                <circle cx="35" cy="108" r="4" fill="hsl(45 45% 55% / 0.3)" stroke="hsl(45 35% 40%)" strokeWidth="0.6" />
                <ellipse cx="25" cy="115" rx="7" ry="3" fill="hsl(120 25% 35% / 0.2)" />
              </g>
            </svg>
          </div>

          {/* Edge staining */}
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: "inset 0 0 40px hsl(30 30% 50% / 0.15), inset 0 0 100px hsl(30 25% 45% / 0.08)",
          }} />

          {/* Content */}
          <div className="relative z-10 px-10 sm:px-14 pt-28 pb-28 sm:pt-32 sm:pb-32">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="font-display text-3xl sm:text-4xl italic"
                style={{ color: "hsl(30 25% 25%)" }}>
                A Letter For You
              </motion.p>
              <div className="my-4 flex items-center justify-center gap-3">
                <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(30 30% 50% / 0.5), transparent)" }} />
                <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(30 30% 50% / 0.5), transparent)" }} />
              </div>
            </div>

            {/* Dear line */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="font-handwritten text-2xl sm:text-3xl mb-6"
              style={{ color: "hsl(30 20% 20%)" }}>
              Dear {receiverName},
            </motion.p>

            {/* Letter body — cursive handwritten */}
            <div
              className="font-handwritten text-xl sm:text-2xl leading-[1.7] whitespace-pre-wrap min-h-[120px] cursor-pointer"
              style={{ color: "hsl(30 30% 25%)" }}
              onClick={!showFull ? skipTypewriter : undefined}
            >
              {showFull ? text : (
                <>
                  {text.slice(0, visibleChars)}
                  <span className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-[1px]"
                    style={{ background: "hsl(30 40% 35%)", animation: "typewriter-cursor 0.8s infinite" }} />
                </>
              )}
            </div>

            {/* Photo placeholders */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: showFull ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-10 grid grid-cols-3 gap-3 sm:gap-4"
            >
              {["Photo 1", "Photo 2", "Photo 3"].map((label, i) => (
                <div
                  key={label}
                  className="aspect-[3/4] flex items-center justify-center rounded-sm relative"
                  style={{
                    background: "linear-gradient(160deg, hsl(40 30% 92%), hsl(35 25% 86%))",
                    border: "1px dashed hsl(30 30% 45% / 0.5)",
                    boxShadow: "0 6px 14px hsl(30 30% 20% / 0.15), inset 0 0 30px hsl(30 25% 70% / 0.2)",
                    transform: `rotate(${(i - 1) * 2}deg)`,
                  }}
                >
                  <span className="font-handwritten text-base sm:text-lg" style={{ color: "hsl(30 25% 35%)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Signature */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: showFull ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 text-right"
            >
              <p className="font-handwritten text-3xl sm:text-4xl" style={{ color: "hsl(30 30% 25%)" }}>
                {senderName}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
};

export default VaultLetter;
