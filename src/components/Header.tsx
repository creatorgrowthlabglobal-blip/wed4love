import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const Header = () => (
  <motion.header
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-4xl"
  >
    <div
      className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between"
      style={{ border: "1px solid hsl(38 50% 88% / 0.7)" }}
    >
      {/* Logo */}
      <Link to="/">
        <span className="font-display font-bold text-lg tracking-tight" style={{ color: GOLD }}>
          Wed4Love
        </span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/choose-template"
          className="font-body text-sm transition-colors"
          style={{ color: "hsl(30 12% 48%)" }}
        >
          Pricing
        </Link>
        <LanguageSwitcher />
        <Link
          to="/login"
          className="font-body text-sm font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
          style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 4px 14px hsl(38 80% 55% / 0.26)" }}
        >
          Get Started
        </Link>
      </div>
    </div>
  </motion.header>
);

export default Header;
