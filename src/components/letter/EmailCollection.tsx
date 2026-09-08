import { motion } from "framer-motion";
import { Mail, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EmailCollectionProps {
  email: string;
  onChange: (email: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const EmailCollection = ({ email, onChange, onNext, onBack }: EmailCollectionProps) => {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        <Mail className="w-8 h-8 text-primary" />
      </motion.div>

      <p className="font-display text-xl text-primary mb-1">Almost there!</p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Stay Connected
      </h2>
      <p className="font-body text-base text-muted-foreground mb-8">
        We'll send you a gentle notification when your letter is beautifully wrapped and ready to share
      </p>

      <div className="letter-paper rounded-2xl p-6 sm:p-8">
        <Input
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          placeholder="your.love@email.com"
          className="bg-background/50 border-border/60 font-body text-center text-lg py-6 focus:border-primary/50 transition-all duration-300"
        />
        <p className="font-body text-sm text-muted-foreground mt-3 flex items-center justify-center gap-1">
          <Heart className="w-3 h-3 text-primary/40 fill-primary/20" />
          Your email is safe with us — we promise
        </p>
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

export default EmailCollection;
