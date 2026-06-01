import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Fullscreen overlay shown while we're preparing or redirecting to Whop checkout.
 * Improves perceived speed since Whop's checkout page itself can take a few seconds.
 */
const CheckoutOverlay = ({ message }: { message?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
  >
    <div className="text-center px-6">
      <Loader2 className="w-14 h-14 text-primary mx-auto mb-5 animate-spin" />
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Opening secure checkout…
      </h2>
      <p className="font-body text-base text-muted-foreground max-w-md mx-auto">
        {message ?? "Hold on a moment — we're sending you to Whop's secure payment page."}
      </p>
    </div>
  </motion.div>
);

export default CheckoutOverlay;
