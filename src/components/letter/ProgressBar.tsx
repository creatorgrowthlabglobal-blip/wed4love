import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  accentColor?: string;
}

const ProgressBar = ({ currentStep, totalSteps, stepLabels, accentColor }: ProgressBarProps) => {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;
  const active = accentColor ?? "hsl(var(--primary))";
  const activeLight = accentColor ?? "hsl(var(--elegant-gold))";

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 sm:mb-12">
      <div className="flex justify-between mb-3">
        {stepLabels.map((label, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
            style={{ width: `${100 / stepLabels.length}%` }}
          >
            <motion.div
              animate={{
                scale: i === currentStep ? 1.2 : 1,
                backgroundColor: i <= currentStep ? active : "hsl(var(--muted))",
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-colors duration-500 ${
                i <= currentStep ? "text-white" : "text-muted-foreground"
              }`}
            >
              {i < currentStep ? (
                <Heart className="w-3.5 h-3.5 fill-current" />
              ) : (
                i + 1
              )}
            </motion.div>
            <span
              className="text-xs font-body tracking-wide transition-colors duration-300 hidden sm:block"
              style={{ color: i <= currentStep ? active : undefined, fontWeight: i <= currentStep ? 600 : undefined }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${active}, ${activeLight})`,
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
