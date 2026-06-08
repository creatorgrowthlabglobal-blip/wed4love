import { Link } from "react-router-dom";
import { Heart, Instagram } from "lucide-react";

const INSTAGRAM_URL = "https://instagram.com/wish4love_official";

const Footer = () => {
  return (
    <footer className="border-t border-primary/10 bg-white/50 backdrop-blur-sm mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span className="font-display text-base font-bold text-foreground notranslate" translate="no">
              Wish4Love
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/terms" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/refund" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              Refund Policy
            </Link>
            <Link to="/contact" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Wish4Love
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
