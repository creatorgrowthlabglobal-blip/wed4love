import { Link } from "react-router-dom";
import { Heart, Instagram, Mail, Shield } from "lucide-react";

const INSTAGRAM_URL = "https://instagram.com/wish4love_official";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-primary/10 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span className="font-display text-base font-bold text-foreground notranslate" translate="no">
                Wish4Love
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Expressing love through unforgettable digital moments.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span className="font-body text-sm notranslate" translate="no">@wish4love_official</span>
            </a>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-bold text-foreground mb-1">Product</p>
            <Link to="/create-letter" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Create a Letter</Link>
            <a href="/#how-it-works" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="/#pricing" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/demo" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Examples</Link>
            <Link to="/letter-history" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">My Letters</Link>
            <Link to="/articles" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          </div>

          {/* Support & Contact */}
          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-bold text-foreground mb-1">Support & Contact</p>
            <Link to="/contact" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
            <a href="mailto:updates@wish4love.com" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Support Email</a>
            <a href="mailto:updates@wish4love.com" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Partnerships</a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="w-4 h-4 shrink-0" />
              <span className="notranslate" translate="no">@wish4love_official</span>
            </a>
            <a
              href="mailto:updates@wish4love.com"
              className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4 shrink-0" />
              updates@wish4love.com
            </a>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-bold text-foreground mb-1">Legal</p>
            <Link to="/terms" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Use</Link>
            <Link to="/privacy" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/refund" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
            <span className="font-body text-sm text-muted-foreground">
              © {new Date().getFullYear()} Wish4Love
            </span>
            <div className="inline-flex items-center gap-2 border border-white/20 rounded-lg px-3 py-1.5 w-fit mt-1">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-body text-xs text-muted-foreground font-semibold">DMCA Protected</span>
            </div>
            <p className="font-body text-xs text-muted-foreground/60 leading-relaxed max-w-[200px]">
              Your privacy is our priority. See how we care for your data in the Privacy Policy.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
