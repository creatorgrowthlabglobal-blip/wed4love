import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Heart, ArrowRight } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const DISMISS_KEY = "wed4love_scarcity_dismissed";
const REVEAL_SCROLL_PX = 480;

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const ScarcityBar = () => {
  const { format } = useCurrency();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") {
      setDismissed(true);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > REVEAL_SCROLL_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const show = visible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-4 pointer-events-none"
        >
          <div
            className="pointer-events-auto mx-auto max-w-5xl flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl backdrop-blur-md"
            style={{
              background: "hsla(42, 65%, 97%, 0.96)",
              border: "1.5px solid hsl(38 50% 82%)",
              boxShadow: "0 14px 44px hsl(30 30% 20% / 0.18)",
            }}
          >
            <Flame
              className="shrink-0"
              style={{ color: "hsl(14 85% 56%)", width: 20, height: 20 }}
            />

            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <p
                className="hidden sm:block font-body text-sm font-semibold whitespace-nowrap"
                style={{ color: "hsl(30 20% 18%)" }}
              >
                Last invitations at this price
              </p>
              <p
                className="sm:hidden font-body text-xs font-semibold whitespace-nowrap"
                style={{ color: "hsl(30 20% 18%)" }}
              >
                Last at this price
              </p>

              <div className="flex items-baseline gap-1.5">
                <span className="font-body text-xs sm:text-sm line-through text-muted-foreground">
                  {format(99)}
                </span>
                <span
                  className="font-display font-bold text-base sm:text-lg"
                  style={{ color: "hsl(30 20% 14%)" }}
                >
                  {format(20)}
                </span>
              </div>

              <span
                className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[11px] font-semibold whitespace-nowrap"
                style={{
                  background: "hsl(350 85% 96%)",
                  color: "hsl(350 72% 48%)",
                  border: "1px solid hsl(350 70% 88%)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "hsl(350 72% 55%)" }}
                />
                Few left
              </span>
            </div>

            <button
              type="button"
              aria-label="Dismiss offer"
              onClick={dismiss}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
              style={{ color: "hsl(30 15% 45%)" }}
            >
              <X className="w-4 h-4" />
            </button>

            <Link
              to="/choose-template"
              className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 pl-3 pr-3.5 sm:pl-4 sm:pr-5 py-2 sm:py-2.5 rounded-xl font-body text-xs sm:text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: GOLD_GRAD,
                boxShadow: "0 8px 22px hsl(38 80% 55% / 0.35)",
              }}
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create Your Invitation</span>
              <span className="sm:hidden">Create</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScarcityBar;
