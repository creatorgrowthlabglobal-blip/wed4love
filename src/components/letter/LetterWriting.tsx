import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const TEXT_DARK = "#2C2A25";
const TEXT_MID = "#6B6456";
const MIN_CHARS = 800;
const MAX_CHARS = 2500;

interface LetterWritingProps {
  letterText: string;
  onChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const LetterWriting = ({ letterText, onChange, onNext, onBack }: LetterWritingProps) => {
  const charCount = letterText.length;
  const tooShort = charCount > 0 && charCount < MIN_CHARS;
  const atMax = charCount >= MAX_CHARS;
  const counterColor = atMax ? "#B91C1C" : tooShort ? "#B45309" : "#6B8E5A";
  const hint = atMax
    ? "Maximum length reached"
    : tooShort
    ? `A little short — aim for at least ${MIN_CHARS} characters for a full page`
    : charCount >= MIN_CHARS
    ? "Looks great!"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.125rem", color: "#5C1832", marginBottom: "0.25rem", fontStyle: "italic", opacity: 0.85 }}>
          Let your heart speak
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: TEXT_DARK, marginBottom: "0.5rem" }}>
          Write Your Letter
        </h2>
        <p style={{ color: TEXT_MID, fontSize: "1rem" }}>
          Pour your feelings onto this page — every word matters
        </p>
      </div>

      {/* Parchment paper — matches final letter */}
      <div
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #FBF3E6 0%, #F4E8D2 60%, #ECDCC0 100%)",
          borderRadius: "6px",
          padding: "clamp(1.75rem, 5vw, 2.75rem)",
          boxShadow: "0 24px 60px rgba(90,70,110,0.28), 0 8px 20px rgba(90,70,110,0.14), inset 0 0 70px rgba(220,195,150,0.22)",
          position: "relative",
          marginBottom: "1.75rem",
          border: "1px solid rgba(160,120,70,0.25)",
        }}
      >
        <div style={{ position: "absolute", inset: "10px", border: "1px solid rgba(160,120,70,0.4)", borderRadius: "4px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "16px", border: "1px solid rgba(160,120,70,0.22)", borderRadius: "3px", pointerEvents: "none" }} />

        <Textarea
          value={letterText}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          placeholder="My dearest, I want you to know..."
          maxLength={MAX_CHARS}
          style={{
            background: "transparent",
            border: "none",
            fontFamily: "'Caveat', 'Dancing Script', cursive",
            fontSize: "clamp(18px, 2.6vw, 22px)",
            color: TEXT_DARK,
            lineHeight: "1.8",
            minHeight: "280px",
            resize: "vertical",
            padding: "0.75rem 0.25rem",
            outline: "none",
            boxShadow: "none",
            width: "100%",
            backgroundImage: "repeating-linear-gradient(transparent, transparent 43px, rgba(160,120,70,0.18) 43px, rgba(160,120,70,0.18) 44px)",
            backgroundAttachment: "local",
          }}
          className="focus:ring-0 focus-visible:ring-0 focus:outline-none placeholder:opacity-40"
        />
      </div>

      {/* Character counter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem", gap: "1rem" }}>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.9rem", color: counterColor, transition: "color 0.3s" }}>
          {hint}
        </span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: counterColor, whiteSpace: "nowrap", transition: "color 0.3s" }}>
          {charCount} / {MAX_CHARS}
        </span>
      </div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          style={{
            padding: "0.875rem 2rem",
            background: "rgba(255,255,255,0.45)",
            color: TEXT_DARK,
            border: "1px solid rgba(160,120,70,0.35)",
            borderRadius: "0.75rem",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          ← Go Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="btn-glow px-10 py-4 bg-primary text-primary-foreground font-heading text-lg font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow"
        >
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LetterWriting;
