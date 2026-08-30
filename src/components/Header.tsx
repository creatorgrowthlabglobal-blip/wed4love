import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const linkSt: React.CSSProperties = { color: "hsl(30 12% 48%)" };

const Header = () => (
  <motion.header
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl"
  >
    <div
      className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between relative"
      style={{ border: "1px solid hsl(38 50% 88% / 0.7)" }}
    >
      {/* Logo */}
      <Link to="/" className="z-10">
        <span className="font-display font-bold text-lg tracking-tight" style={{ color: GOLD }}>
          Wed4Love
        </span>
      </Link>

      {/* Center nav */}
      <nav className="hidden sm:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
        <Link to="/#how-it-works" className="font-body text-sm transition-colors hover:text-[hsl(38_72%_44%)]" style={linkSt}>
          How It Works
        </Link>
        <Link to="/pricing" className="font-body text-sm transition-colors hover:text-[hsl(38_72%_44%)]" style={linkSt}>
          Pricing
        </Link>
        <Link to="/blog" className="font-body text-sm transition-colors hover:text-[hsl(38_72%_44%)]" style={linkSt}>
          Blog
        </Link>
        <Link to="/contact" className="font-body text-sm transition-colors hover:text-[hsl(38_72%_44%)]" style={linkSt}>
          Contact
        </Link>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3 z-10">
        <CurrencySwitcher />
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
