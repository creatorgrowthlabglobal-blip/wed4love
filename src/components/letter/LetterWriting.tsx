import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface LetterWritingProps {
  letterText: string;
  onChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const LetterWriting = ({ letterText, onChange, onNext, onBack }: LetterWritingProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <p className="font-display text-xl text-primary mb-1">Let your heart speak</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Write Your Letter
        </h2>
        <p className="font-body text-base text-muted-foreground">
          Pour your feelings onto this page — every word matters
        </p>
      </div>

      {/* Letter paper editor */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <PenLine className="w-5 h-5 text-primary" />
          <span className="font-heading text-base font-semibold text-foreground">Your Heartfelt Words</span>
        </div>
        <div className="letter-paper rounded-2xl p-6">
          <Textarea
            value={letterText}
            onChange={(e) => onChange(e.target.value)}
            placeholder="My dearest, I want you to know..."
            className="bg-transparent border-none font-handwritten text-xl sm:text-2xl min-h-[260px] resize-y leading-[2.2] focus:ring-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 placeholder:font-handwritten placeholder:text-lg"
            style={{
              backgroundImage: "repeating-linear-gradient(transparent, transparent 43px, hsl(var(--border) / 0.3) 43px, hsl(var(--border) / 0.3) 44px)",
              backgroundAttachment: "local",
            }}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="px-6 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card"
        >
          ← Go Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="btn-glow px-10 py-3.5 bg-primary text-primary-foreground font-heading text-base font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow"
        >
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LetterWriting;
