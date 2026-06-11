import { Link } from "react-router-dom";
import { Heart, Instagram } from "lucide-react";

const INSTAGRAM_URL = "https://instagram.com/wish4love_official";

const Footer = () => {
  return (
    <footer className="border-t border-primary/10 bg-white/50 backdrop-blur-sm mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 px-5 py-4 text-center">
          <p className="font-body text-sm text-foreground">
            <span className="font-display font-semibold">Get 30% off</span> letters & reminder calls — follow{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline notranslate"
              translate="no"
            >
              @wish4love_official
            </a>{" "}
            or share us to your story, then DM us a screenshot to receive your code.
          </p>
        </div>

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
            <Link to="/articles" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              Articles
            </Link>
            <Link to="/contact" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span className="notranslate" translate="no">@wish4love_official</span>
            </a>
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
