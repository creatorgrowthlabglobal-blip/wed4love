import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const LINKS = [
  { to: "/#how-it-works", label: "How it works" },
  { to: "/pricing",       label: "Pricing" },
  { to: "/blog",          label: "Blog" },
  { to: "/demo",          label: "Demo" },
  { to: "/contact",       label: "Contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl"
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map(l => (
            <Link
              key={l.label}
              to={l.to}
              className="font-body text-sm transition-colors hover:text-[hsl(38_72%_44%)]"
              style={{ color: "hsl(30 12% 48%)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <Link
            to="/pricing"
            className="hidden sm:inline-block font-body text-sm font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 4px 14px hsl(38 80% 55% / 0.26)" }}
          >
            Get Started
          </Link>
          <button
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-xl"
            style={{ color: "hsl(30 12% 40%)" }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col"
            style={{ border: "1px solid hsl(38 50% 88% / 0.7)" }}
          >
            {LINKS.map(l => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-body text-sm px-3 py-2.5 rounded-xl hover:bg-amber-50"
                style={{ color: "hsl(30 12% 40%)" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/pricing"
              onClick={() => setOpen(false)}
              className="mt-1 font-body text-sm font-semibold px-3 py-2.5 rounded-xl text-center"
              style={{ background: GOLD_GRAD, color: "white" }}
            >
              Get Started
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
