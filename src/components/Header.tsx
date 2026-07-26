import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Instagram } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";


const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-4xl"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-lg px-4 sm:px-6 py-2.5 flex items-center justify-between relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group z-10">
          <Heart className="w-5 h-5 text-primary fill-primary transition-transform duration-300 group-hover:scale-110" />
          <span className="font-display text-lg font-bold text-foreground tracking-tight notranslate" translate="no">
            Wish4Love
          </span>
        </Link>

        {/* Center Nav - absolutely centered */}
        <nav className="hidden sm:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <a
            href="/letters#pricing"
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Pricing
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://instagram.com/wish4love_official"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow @wish4love_official on Instagram for 30% off"
            title="Follow @wish4love_official — DM us for 30% off"
            className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <LanguageSwitcher />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
