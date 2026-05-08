import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Shield } from "lucide-react";

interface PinCreationProps {
  pin: string;
  onChange: (pin: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const PinCreation = ({ pin, onChange, onNext, onBack }: PinCreationProps) => {
  const [confirm, setConfirm] = useState("");
  const isValid = pin.length === 4 && pin === confirm;

  const handleInput = (value: string, setter: (v: string) => void) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    setter(clean);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
      >
        <Lock className="w-8 h-8 text-primary" />
      </motion.div>

      <p className="font-display text-xl text-primary mb-1">Keep it secret</p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Create a Secret PIN
      </h2>
      <p className="font-body text-base text-muted-foreground mb-8">
        Your loved one will need this 4-digit PIN to open the letter
      </p>

      <div className="letter-paper rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <label className="font-heading text-sm font-semibold mb-2 block text-left">
            Enter 4-Digit PIN
          </label>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-display font-bold transition-all duration-300 ${
                  pin[i] ? "border-primary bg-primary/5 text-foreground" : "border-border/60 bg-background/50 text-muted-foreground"
                }`}
              >
                {pin[i] ? "●" : "—"}
              </motion.div>
            ))}
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={pin}
            onChange={(e) => { handleInput(e.target.value, onChange); }}
            maxLength={4}
            className="w-full mt-3 text-center text-lg tracking-[1em] bg-background/50 border border-border/60 rounded-xl py-3 font-heading focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="● ● ● ●"
          />
        </div>

        <div>
          <label className="font-heading text-sm font-semibold mb-2 block text-left">
            Confirm PIN
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={confirm}
            onChange={(e) => handleInput(e.target.value, setConfirm)}
            maxLength={4}
            className="w-full text-center text-lg tracking-[1em] bg-background/50 border border-border/60 rounded-xl py-3 font-heading focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="● ● ● ●"
          />
          {confirm.length === 4 && pin !== confirm && (
            <p className="text-sm text-destructive mt-2 font-body">PINs do not match</p>
          )}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="font-body text-xs text-muted-foreground text-left">
            Share this PIN privately with your special someone so they can unlock your letter
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          className="px-6 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
          ← Go Back
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
          className="btn-glow px-10 py-3.5 bg-primary text-primary-foreground font-heading text-base font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow">
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PinCreation;
