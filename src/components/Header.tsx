import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { getCurrentUser, signOut } from "@/lib/auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleSignOut = () => {
    signOut();
    navigate("/create-letter", { replace: true });
  };

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
          <span className="font-display text-lg font-bold text-foreground tracking-tight">
            Wish4Love
          </span>
        </Link>

        {/* Center Nav - absolutely centered */}
        <nav className="hidden sm:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <a
            href="/#pricing"
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Pricing
          </a>
          <Link
            to="/schedule-call"
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Reminders
          </Link>
          <Link
            to="/demo"
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Demo
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {user ? (
            <button
              onClick={handleSignOut}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:block"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:block"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/create-letter"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Create
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
