import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Crown, Sparkles, Palette, ArrowRight, ShieldCheck, Clock, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useInviteEntitlement } from "@/hooks/useInviteEntitlement";
import { notify } from "@/lib/notify";

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

export interface PackageDef {
  id: "starter" | "premium" | "custom";
  name: string;
  price: string;
  oldPrice?: string;
  tagline: string;
  checkout: string;
  icon: typeof Crown;
  featured?: boolean;
  badge?: string;
  included: string[];
  excluded?: string[];
}

export const PACKAGES: PackageDef[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    tagline: "Perfect for a simple, elegant digital invitation.",
    checkout: "https://whop.com/checkout/plan_FsfUSAeOIoKZt",
    icon: Sparkles,
    included: [
      "3 classic themes",
      "Core invitation blocks",
      "Up to 60 guests tracked",
      "Live RSVP dashboard",
      "Shareable link + QR code",
    ],
    excluded: ["Cinematic envelope reveal", "Custom music", "Priority support"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$99",
    oldPrice: "$149",
    tagline: "Everything you need for a truly unforgettable invitation.",
    checkout: "https://whop.com/checkout/plan_OizfizAnMNsVO",
    icon: Crown,
    featured: true,
    badge: "Most popular — best value",
    included: [
      "All cinematic themes",
      "All information blocks",
      "Unlimited guests",
      "Live RSVP dashboard + CSV export",
      "3D envelope reveal animation",
      "Custom music & photo gallery",
      "Venue map, countdown & love story",
      "Save-the-date link included",
      "Priority WhatsApp support",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    price: "$299",
    tagline: "We design and build your entire invitation for you.",
    checkout: "https://whop.com/checkout/plan_tLQmC1O2O9DmN",
    icon: Palette,
    badge: "Done for you",
    included: [
      "Everything in Premium",
      "We build your invitation end-to-end",
      "Bespoke opening animation",
      "Hand-illustrated couple portrait",
      "1:1 design consultation",
      "Unlimited revisions until it's perfect",
      "Just send your details — we do the rest",
    ],
  },
];

const PricingCard = ({ pkg, index, onChoose, busy }: {
  pkg: PackageDef; index: number; onChoose: (p: PackageDef) => void; busy: boolean;
}) => {
  const Icon = pkg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl flex flex-col overflow-hidden bg-card"
      style={{
        border: pkg.featured ? "2px solid hsl(38 60% 68%)" : "1.5px solid hsl(38 40% 88%)",
        boxShadow: pkg.featured
          ? "0 22px 60px hsl(38 60% 45% / 0.18)"
          : "0 6px 22px hsl(38 40% 60% / 0.08)",
      }}
    >
      {pkg.badge && (
        <div
          className="py-2 text-center font-body text-[11px] font-bold tracking-wide uppercase"
          style={{
            background: pkg.featured ? GOLD_GRAD : "hsl(38 55% 93%)",
            color: pkg.featured ? "white" : GOLD,
          }}
        >
          {pkg.badge}
        </div>
      )}

      <div className="p-7 flex flex-col gap-5 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4.5 h-4.5" style={{ color: GOLD, width: 18, height: 18 }} />
          <p className="font-display font-bold text-lg text-foreground">{pkg.name}</p>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          {pkg.oldPrice && (
            <span className="font-body text-base line-through text-muted-foreground">{pkg.oldPrice}</span>
          )}
          <span className="font-display font-bold text-foreground" style={{ fontSize: "2.6rem", lineHeight: 1 }}>
            {pkg.price}
          </span>
          <span className="font-body text-sm text-muted-foreground">One-time payment</span>
        </div>

        <p className="font-body text-sm leading-relaxed text-muted-foreground">{pkg.tagline}</p>

        <button
          onClick={() => onChoose(pkg)}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-body text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={
            pkg.featured
              ? { background: GOLD_GRAD, color: "white", boxShadow: "0 8px 26px hsl(38 80% 55% / 0.3)" }
              : { background: "transparent", color: GOLD, border: "1.5px solid hsl(38 50% 78%)" }
          }
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {pkg.id === "custom" ? "Go Custom" : `Get ${pkg.name} — ${pkg.price}`}
          {!busy && <ArrowRight className="w-4 h-4" />}
        </button>

        <ul className="flex flex-col gap-2.5 mt-1">
          {pkg.included.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
              <span className="font-body text-sm leading-snug text-foreground">{f}</span>
            </li>
          ))}
          {pkg.excluded?.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <X className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="font-body text-sm leading-snug line-through text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [awaiting, setAwaiting] = useState(false);
  const { plan } = useInviteEntitlement(awaiting);

  // Once the payment lands, send them straight into the builder.
  useEffect(() => {
    if (awaiting && plan) navigate("/choose-template", { replace: true });
  }, [awaiting, plan, navigate]);

  const choose = (pkg: PackageDef) => {
    notify("package_selected", { package: pkg.id, price: pkg.price, email: user?.email });

    if (!user) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    localStorage.setItem("selected_package", pkg.id);
    const url = user.email
      ? `${pkg.checkout}?d2c=true&email=${encodeURIComponent(user.email)}`
      : `${pkg.checkout}?d2c=true`;
    window.open(url, "_blank", "noopener");
    setAwaiting(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(175deg, hsl(42 60% 98%), hsl(38 45% 96%))" }}>
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
              Pricing
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Choose your package
            </h1>
            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Pay once, then build your invitation right away. No subscriptions, no per-guest fees,
              and your invitation link stays live for a full year.
            </p>
          </div>

          {awaiting && (
            <div
              className="max-w-xl mx-auto mb-10 rounded-2xl px-5 py-4 flex items-start gap-3 bg-card"
              style={{ border: "1.5px solid hsl(38 50% 82%)" }}
            >
              <Loader2 className="w-4 h-4 mt-0.5 animate-spin" style={{ color: GOLD }} />
              <div>
                <p className="font-body text-sm font-semibold text-foreground">Waiting for your payment…</p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  Finish the checkout in the new tab. This page unlocks the builder automatically —
                  keep it open.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {PACKAGES.map((p, i) => (
              <PricingCard key={p.id} pkg={p} index={i} onChoose={choose} busy={awaiting} />
            ))}
          </div>

          {/* Trust row */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: ShieldCheck, title: "Secure checkout", desc: "Payments processed securely — we never store your card details." },
              { icon: Clock, title: "Build immediately", desc: "The invitation builder unlocks the moment your payment is confirmed." },
              { icon: Sparkles, title: "Real human support", desc: "Message us on WhatsApp any time — we reply the same day." },
            ].map(t => (
              <div
                key={t.title}
                className="rounded-2xl p-5 bg-card"
                style={{ border: "1.5px solid hsl(38 40% 90%)" }}
              >
                <t.icon className="w-5 h-5 mb-3" style={{ color: GOLD }} />
                <p className="font-display font-bold text-sm text-foreground mb-1">{t.title}</p>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center font-body text-sm text-muted-foreground mt-10">
            Not sure which one fits?{" "}
            <Link to="/contact" className="font-semibold" style={{ color: GOLD }}>
              Talk to us
            </Link>{" "}
            — we'll help you pick.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
