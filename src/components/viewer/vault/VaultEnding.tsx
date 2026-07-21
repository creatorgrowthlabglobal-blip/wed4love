import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ReactionCapture from "@/components/viewer/ReactionCapture";

interface VaultEndingProps {
  letterId?: string;
}

const VaultEnding = ({ letterId }: VaultEndingProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.8 }}
    className="w-full max-w-md mx-auto text-center mt-12 mb-8 px-4"
  >
    <div className="my-6 flex items-center justify-center gap-4">
      <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(340 50% 65% / 0.4), transparent)" }} />
      <span className="text-sm">✨</span>
      <div className="w-16 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(340 50% 65% / 0.4), transparent)" }} />
    </div>

    <p className="font-display text-lg sm:text-xl italic leading-relaxed" style={{ color: "hsl(340 30% 35%)" }}>
      Some words fade.<br />
      Some moments don't.
    </p>

    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
      {[
        { label: "Save as Keepsake 💕", primary: true },
        { label: "Share Privately ✨", primary: false },
      ].map((btn, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 rounded-xl font-display text-sm tracking-wider transition-all duration-300 min-w-[180px]"
          style={btn.primary ? {
            background: "linear-gradient(135deg, hsl(340 70% 65%) 0%, hsl(340 60% 55%) 100%)",
            color: "white",
            boxShadow: "0 4px 16px hsl(340 60% 50% / 0.25)",
          } : {
            background: "hsl(0 0% 100% / 0.5)",
            color: "hsl(340 30% 35%)",
            border: "1px solid hsl(340 40% 80% / 0.5)",
          }}
        >
          {btn.label}
        </motion.button>
      ))}
    </div>

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="mt-10 pt-8"
      style={{ borderTop: "1px solid hsl(340 40% 80% / 0.4)" }}
    >
      <p className="font-display text-base italic mb-4" style={{ color: "hsl(340 30% 35%)" }}>
        Someone loves you enough to make this.
      </p>
      <Link
        to={letterId ? `/create-letter?ref=${letterId}` : "/create-letter"}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-display text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: "linear-gradient(135deg, hsl(340 90% 65%), hsl(340 90% 58%))",
          boxShadow: "0 8px 24px hsl(340 80% 60% / 0.35)",
        }}
      >
        <Heart className="w-4 h-4 fill-current" />
        Make one back →
      </Link>
    </motion.div>

    {letterId && <ReactionCapture letterId={letterId} />}
  </motion.div>
);

export default VaultEnding;
