import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";

interface SenderReceiverDetailsProps {
  data: {
    senderName: string;
    receiverName: string;
    relationship: string;
    occasion: string;
    specialDate: string;
  };
  onChange: (data: SenderReceiverDetailsProps["data"]) => void;
  onNext: () => void;
}

const SenderReceiverDetails = ({ data, onChange, onNext }: SenderReceiverDetailsProps) => {
  const update = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const canProceed = data.senderName.trim() && data.receiverName.trim();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <p className="font-display text-xl text-primary mb-1">Tell us your story</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Who Is This Letter For?
        </h2>
        <p className="font-body text-base text-muted-foreground">
          Every love letter needs a sender and a cherished recipient
        </p>
      </div>

      <div className="letter-paper rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <Label className="font-heading text-sm font-semibold mb-2 block">
            Your Name <Heart className="w-3 h-3 inline text-primary/50 fill-primary/30" />
          </Label>
          <Input
            value={data.senderName}
            onChange={(e) => update("senderName", e.target.value)}
            placeholder="The one who writes with love..."
            className="bg-background/50 border-border/60 font-body text-base py-5 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
          />
        </div>
        <div>
          <Label className="font-heading text-sm font-semibold mb-2 block">
            Recipient's Name <Heart className="w-3 h-3 inline text-primary/50 fill-primary/30" />
          </Label>
          <Input
            value={data.receiverName}
            onChange={(e) => update("receiverName", e.target.value)}
            placeholder="The one who holds your heart..."
            className="bg-background/50 border-border/60 font-body text-base py-5 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <motion.button
          whileHover={canProceed ? { scale: 1.03 } : undefined}
          whileTap={canProceed ? { scale: 0.97 } : undefined}
          onClick={() => canProceed && onNext()}
          disabled={!canProceed}
          className="btn-glow px-10 py-4 bg-primary text-primary-foreground font-heading text-lg font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-romantic"
        >
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SenderReceiverDetails;
