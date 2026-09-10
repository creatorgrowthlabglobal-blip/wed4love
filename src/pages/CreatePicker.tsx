import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Mail } from "lucide-react";
import Header from "@/components/Header";
import { Seo } from "@/components/Seo";

const GOLD = "hsl(38 72% 44%)";

const CreatePicker = () => {
  // Route the wedding side through /pricing?product=invitation so the user
  // sees only the wedding tiers (no love-letter price bleed) before picking
  // a template and hitting checkout.
  const invitationHref = "/pricing?product=invitation";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(175deg, hsl(42 60% 97%) 0%, hsl(38 50% 95%) 100%)" }}>
      <Seo
        title="Create Your Letter — Wed4Love"
        description="Choose what to create: a personal love letter or a cinematic digital wedding invitation."
        path="/create"
      />
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="font-body text-[11px] tracking-[0.26em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
              Create Your Letter
            </p>
            <h1 className="font-display font-bold leading-tight mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "hsl(30 20% 14%)" }}>
              What would you like to make?
            </h1>
            <p className="font-body text-base max-w-xl mx-auto" style={{ color: "hsl(30 12% 42%)" }}>
              Pick one to get started — you can always come back and make the other.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {/* Love Letter */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
            >
              <Link
                to="/create-letter"
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-8 flex flex-col h-full"
                style={{
                  background: "linear-gradient(160deg, hsl(340 60% 96%) 0%, hsl(345 55% 92%) 100%)",
                  border: "1.5px solid hsl(340 45% 84%)",
                  boxShadow: "0 12px 32px hsl(340 40% 70% / 0.22)",
                }}
              >
              <div
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5"
                style={{ background: "white", boxShadow: "0 6px 18px hsl(340 40% 70% / 0.32)" }}
              >
                <Heart className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: "hsl(340 65% 52%)" }} />
              </div>
              <p className="font-body text-[9px] sm:text-[10px] tracking-[0.22em] uppercase font-semibold mb-1.5" style={{ color: "hsl(340 55% 45%)" }}>
                For someone you love
              </p>
              <h2 className="font-display font-bold text-lg sm:text-3xl mb-2 sm:mb-3" style={{ color: "hsl(30 20% 14%)" }}>
                Love Letter
              </h2>
              <p className="font-body text-xs sm:text-base mb-5 sm:mb-8 leading-relaxed" style={{ color: "hsl(30 12% 42%)" }}>
                A personal letter with photos, music, and a keepsake envelope reveal — share it in a single link.
              </p>
              <div
                className="mt-auto inline-flex items-center gap-1.5 font-body text-xs sm:text-sm font-semibold transition-transform group-hover:translate-x-1"
                style={{ color: "hsl(340 65% 45%)" }}
              >
                Start writing <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              </Link>
            </motion.div>

            {/* Marriage Invitation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={invitationHref}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden p-4 sm:p-8 flex flex-col h-full"
                style={{
                  background: "linear-gradient(160deg, hsl(42 60% 96%) 0%, hsl(38 55% 90%) 100%)",
                  border: "1.5px solid hsl(38 50% 82%)",
                  boxShadow: "0 12px 32px hsl(38 45% 65% / 0.26)",
                }}
              >
                <div
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5"
                  style={{ background: "white", boxShadow: "0 6px 18px hsl(38 45% 60% / 0.32)" }}
                >
                  <Mail className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: GOLD }} />
                </div>
                <p className="font-body text-[9px] sm:text-[10px] tracking-[0.22em] uppercase font-semibold mb-1.5" style={{ color: GOLD }}>
                  For your big day
                </p>
                <h2 className="font-display font-bold text-lg sm:text-3xl mb-2 sm:mb-3" style={{ color: "hsl(30 20% 14%)" }}>
                  Marriage Invitation
                </h2>
                <p className="font-body text-xs sm:text-base mb-5 sm:mb-8 leading-relaxed" style={{ color: "hsl(30 12% 42%)" }}>
                  A cinematic digital wedding invitation with live RSVP tracking — from $49.
                </p>
                <div
                  className="mt-auto inline-flex items-center gap-1.5 font-body text-xs sm:text-sm font-semibold transition-transform group-hover:translate-x-1"
                  style={{ color: GOLD }}
                >
                  Choose a template <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePicker;
