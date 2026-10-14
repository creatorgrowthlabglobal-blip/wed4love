import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Palette, ArrowRight, ArrowLeft, ShieldCheck, Clock, Loader2, BadgeCheck, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notify";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const SUPPORT_WHATSAPP = "9779702238084";
const whatsappLink = (message: string) =>
  `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;

export interface PackageDef {
  id: "starter" | "signature" | "custom";
  name: string;
  price: number | null;
  oldPrice?: number;
  tagline: string;
  checkout?: string;        // Whop checkout URL — if absent, falls back to WhatsApp
  whatsappMessage?: string; // Pre-filled message when falling back to WhatsApp
  icon: typeof Crown;
  featured?: boolean;
  badge?: string;
  included: string[];
}

export const PACKAGES: PackageDef[] = [
  {
    id: "starter",
    name: "Essential",
    price: 20,
    oldPrice: 99,
    tagline: "Self-serve. One payment. Every template, every feature.",
    checkout: "https://whop.com/checkout/plan_FsfUSAeOIoKZt",
    icon: Sparkles,
    badge: "Great for most couples",
    included: [
      "All 5 cinematic templates unlocked",
      "Unlimited guests & unlimited RSVPs",
      "Live RSVP dashboard + CSV export",
      "3D envelope reveal animation",
      "Custom music & photo gallery",
      "Venue map, countdown & love story",
      "Shareable link + downloadable QR code",
      "Save-the-date link included",
      "Email support",
    ],
  },
  {
    id: "signature",
    name: "Signature",
    price: 50,
    tagline: "Everything in Essential — plus a dedicated designer and unlimited revisions.",
    // TODO: swap in Whop checkout URL for the $50 Signature plan.
    whatsappMessage: "Hi Wed4Love! I'd like the Signature plan ($50) — can you share the next steps?",
    icon: Crown,
    featured: true,
    badge: "Most loved",
    included: [
      "Everything in Essential",
      "Dedicated designer on WhatsApp",
      "Unlimited revisions until you love it",
      "Priority 48-hour delivery",
      "1:1 design consultation call",
      "Custom color palette tuning",
      "Premium WhatsApp support",
    ],
  },
  {
    id: "custom",
    name: "Luxe (Done For You)",
    price: 299,
    tagline: "The whole invitation — concept to launch — handled by our team.",
    // TODO: swap in Whop checkout URL for the $299 Luxe plan.
    whatsappMessage: "Hi Wed4Love! I'd like the Luxe (Done For You) plan ($299) — can you share the next steps?",
    icon: Palette,
    badge: "White-glove",
    included: [
      "Everything in Signature",
      "We build your invitation end-to-end",
      "Bespoke opening animation",
      "Hand-illustrated couple portrait",
      "Full copywriting + proofreading",
      "Multilingual version included",
      "Express 24-hour delivery available",
    ],
  },
];

const PricingCard = ({ pkg, index, onChoose, busy }: {
  pkg: PackageDef; index: number; onChoose: (p: PackageDef) => void; busy: boolean;
}) => {
  const Icon = pkg.icon;
  const { format, showUsdNote, usdNote } = useCurrency();
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

      <div className="p-7 md:p-8 flex flex-col gap-5 md:gap-6 flex-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: pkg.featured ? GOLD_GRAD : "hsl(38 60% 96%)",
              color: pkg.featured ? "white" : GOLD,
              boxShadow: pkg.featured ? "0 6px 16px hsl(38 80% 55% / 0.3)" : "none",
            }}
          >
            <Icon className="w-5 h-5 md:w-5.5 md:h-5.5" style={{ width: 20, height: 20 }} />
          </div>
          <p className="font-display font-bold text-xl md:text-2xl text-foreground">{pkg.name}</p>
        </div>

        {pkg.price != null ? (
          <>
            <div className="flex items-baseline gap-2 flex-wrap">
              {pkg.oldPrice != null && (
                <span className="font-body text-base md:text-lg line-through" style={{ color: "hsl(30 14% 55%)" }}>{format(pkg.oldPrice)}</span>
              )}
              <span
                className="font-display font-bold leading-none tabular-nums"
                style={{
                  fontSize: "clamp(2.4rem, 4vw, 3rem)",
                  background: GOLD_GRAD,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {format(pkg.price)}
              </span>
              <span className="font-body text-sm md:text-base font-semibold" style={{ color: "hsl(30 20% 28%)" }}>One-time payment</span>
            </div>
            {showUsdNote && (
              <p className="font-body text-xs -mt-3" style={{ color: "hsl(30 16% 42%)" }}>
                charged as {usdNote(pkg.price)}
              </p>
            )}
          </>
        ) : (
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-display font-bold text-foreground" style={{ fontSize: "clamp(2rem, 3.5vw, 2.4rem)", lineHeight: 1 }}>
              Let's talk
            </span>
            <span className="font-body text-sm md:text-base font-semibold" style={{ color: "hsl(30 20% 28%)" }}>Custom quote</span>
          </div>
        )}

        <p className="font-body text-sm md:text-base leading-relaxed" style={{ color: "hsl(30 20% 32%)" }}>{pkg.tagline}</p>

        {!pkg.checkout ? (
          <a
            href={whatsappLink(pkg.whatsappMessage ?? `Hi Wed4Love! I'd like the ${pkg.name} plan.`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => notify("package_whatsapp_clicked", { source: "pricing", package: pkg.id })}
            className="w-full flex items-center justify-center gap-2 py-3.5 md:py-4 rounded-2xl font-body text-sm md:text-base font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={
              pkg.featured
                ? { background: GOLD_GRAD, color: "white", boxShadow: "0 8px 26px hsl(38 80% 55% / 0.3)" }
                : { background: "white", color: GOLD, border: "1.5px solid hsl(38 50% 78%)" }
            }
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            {pkg.price != null ? `Start on WhatsApp — ${format(pkg.price)}` : "Message us on WhatsApp"}
          </a>
        ) : (
          <button
            onClick={() => onChoose(pkg)}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3.5 md:py-4 rounded-2xl font-body text-sm md:text-base font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={
              pkg.featured
                ? { background: GOLD_GRAD, color: "white", boxShadow: "0 8px 26px hsl(38 80% 55% / 0.3)" }
                : { background: "white", color: GOLD, border: "1.5px solid hsl(38 50% 78%)" }
            }
          >
            {busy ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : null}
            {pkg.price != null ? `Get it now — ${format(pkg.price)}` : "Get it now"}
            {!busy && <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        )}

        <ul className="flex flex-col gap-3 md:gap-3.5 mt-1 pt-5 md:pt-6" style={{ borderTop: "1px solid hsl(38 30% 92%)" }}>
          {pkg.included.map(f => (
            <li key={f} className="flex items-start gap-2.5 md:gap-3">
              <span
                className="shrink-0 w-5 h-5 md:w-5 md:h-5 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: pkg.featured ? "hsl(38 70% 94%)" : "hsl(38 60% 96%)" }}
              >
                <Check className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: GOLD, strokeWidth: 3 }} />
              </span>
              <span className="font-body text-sm md:text-base leading-relaxed" style={{ color: "hsl(30 20% 22%)" }}>{f}</span>
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
  const [pending, setPending] = useState<string | null>(null);

  const choose = async (pkg: PackageDef) => {
    notify("package_selected", { package: pkg.id, price: pkg.price, email: user?.email });

    if (!user) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }
    if (!user.email) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    setPending(pkg.id);
    localStorage.setItem(`selected_package_${user.id}`, pkg.id);
    localStorage.removeItem("selected_package");

    const redirectUrl = `${window.location.origin}/payment-success?plan=${pkg.id}`;
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: pkg.id, app_email: user.email, redirect_url: redirectUrl },
      });
      if (error || !data?.purchase_url) throw error ?? new Error("no purchase_url");
      window.location.href = data.purchase_url;
    } catch (e) {
      console.error("[Pricing] create-checkout failed, falling back to raw Whop URL", e);
      const params = new URLSearchParams({ d2c: "true", redirect_url: redirectUrl });
      if (user.email) params.set("email", user.email);
      window.location.href = `${pkg.checkout}?${params.toString()}`;
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(175deg, hsl(42 60% 98%), hsl(38 45% 96%))" }}>
      <Seo
        title="Pricing — Wed4Love Wedding Invitations · From $20"
        description="Three honest plans — $20 self-serve, $50 with a dedicated designer and unlimited revisions, or $299 fully done-for-you. One-time payment, no hidden fees."
        path="/pricing"
      />
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="inline-flex items-center gap-1.5 mb-6 font-body text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: GOLD }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center mb-10">
            <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
              Wedding Invitation Pricing
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Three honest plans. No hidden fees.
            </h1>
            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Start self-serve at $20, add a dedicated designer and unlimited revisions for $50,
              or let us handle the whole invitation for $299. One-time payment either way.
            </p>
            <div
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full"
              style={{
                background: "hsl(38 60% 94%)",
                border: "1.5px solid hsl(38 55% 78%)",
              }}
            >
              <BadgeCheck className="w-4 h-4" style={{ color: GOLD }} />
              <span className="font-body text-xs sm:text-sm font-semibold" style={{ color: "hsl(30 20% 20%)" }}>
                30-day money-back guarantee · no questions asked
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 items-start max-w-6xl mx-auto">
            {PACKAGES.map((p, i) => (
              <PricingCard key={p.id} pkg={p} index={i} onChoose={choose} busy={pending === p.id} />
            ))}
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: BadgeCheck, title: "30-day money back", desc: "Not happy? Email us within 30 days of purchase for a full, no-questions-asked refund." },
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
