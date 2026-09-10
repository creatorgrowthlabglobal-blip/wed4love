import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Crown, Sparkles, Palette, Heart, Mail, ArrowRight, ArrowLeft, ShieldCheck, Clock, Loader2, Play } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notify";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

export interface PackageDef {
  id: "starter" | "premium" | "custom";
  name: string;
  price: number;
  oldPrice?: number;
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
    price: 49,
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
    price: 99,
    oldPrice: 149,
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
    price: 299,
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

      <div className="p-7 flex flex-col gap-5 flex-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4.5 h-4.5" style={{ color: GOLD, width: 18, height: 18 }} />
          <p className="font-display font-bold text-lg text-foreground">{pkg.name}</p>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          {pkg.oldPrice != null && (
            <span className="font-body text-base line-through text-muted-foreground">{format(pkg.oldPrice)}</span>
          )}
          <span className="font-display font-bold text-foreground" style={{ fontSize: "2.6rem", lineHeight: 1 }}>
            {format(pkg.price)}
          </span>
          <span className="font-body text-sm text-muted-foreground">One-time payment</span>
        </div>
        {showUsdNote && (
          <p className="font-body text-[11px] -mt-3" style={{ color: "hsl(30 12% 55%)" }}>
            charged as {usdNote(pkg.price)}
          </p>
        )}

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
          {pkg.id === "custom" ? "Go Custom" : `Get ${pkg.name} — ${format(pkg.price)}`}
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

const ROSE       = "hsl(340 65% 52%)";
const ROSE_LIGHT = "hsl(340 60% 62%)";
const ROSE_GRAD  = "linear-gradient(135deg, hsl(340 65% 52%), hsl(340 60% 62%))";

// A distinct card so users clearly see this is a separate product from wedding
// packages — different price, different flow, different purpose.
const LoveLetterSection = () => {
  const { format, showUsdNote, usdNote } = useCurrency();
  const price = 7.99;
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, hsl(340 60% 97%) 0%, hsl(345 55% 93%) 100%)",
        border: "1.5px solid hsl(340 45% 86%)",
        boxShadow: "0 14px 40px hsl(340 40% 70% / 0.20)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 md:gap-10 p-7 sm:p-9">
        {/* Left — description */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: ROSE_GRAD, boxShadow: "0 6px 18px hsl(340 60% 55% / 0.32)" }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-body text-[10px] tracking-[0.24em] uppercase font-bold" style={{ color: "hsl(340 55% 45%)" }}>
                For one person you love
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                Love Letter
              </h2>
            </div>
          </div>

          <p className="font-body text-sm sm:text-base leading-relaxed mb-5" style={{ color: "hsl(30 12% 42%)" }}>
            A private keepsake letter with photos, music, and a cinematic mailbox reveal —
            shared as a single link. Perfect for anniversaries, birthdays, apologies, or a quiet "just because."
          </p>

          <ul className="flex flex-col gap-2.5 mb-6">
            {[
              "Four mailbox / envelope reveals",
              "Your photos, your song, your words",
              "Voice message option",
              "Unlock-on-a-date scheduling",
              "One shareable private link",
            ].map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ROSE }} />
                <span className="font-body text-sm text-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-auto">
            <Link
              to="/create-letter"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-body text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: ROSE_GRAD, boxShadow: "0 8px 24px hsl(340 60% 55% / 0.32)" }}
            >
              Write a Love Letter <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/demo#love-letter"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-body text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ background: "white", color: ROSE, border: "1.5px solid hsl(340 45% 84%)" }}
            >
              <Play className="w-3.5 h-3.5" /> See a demo
            </Link>
          </div>
        </div>

        {/* Right — price card */}
        <div className="flex">
          <div
            className="w-full rounded-3xl p-6 sm:p-7 flex flex-col justify-center"
            style={{
              background: "white",
              border: "1.5px solid hsl(340 40% 88%)",
              boxShadow: "0 6px 22px hsl(340 40% 70% / 0.12)",
            }}
          >
            <p className="font-body text-[10px] tracking-[0.24em] uppercase font-bold mb-3" style={{ color: "hsl(340 55% 45%)" }}>
              One-time payment
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-display font-bold text-foreground"
                style={{ fontSize: "3rem", lineHeight: 1 }}
              >
                {format(price)}
              </span>
              <span className="font-body text-sm text-muted-foreground">per letter</span>
            </div>
            {showUsdNote && (
              <p className="font-body text-[11px] mb-4" style={{ color: "hsl(30 12% 55%)" }}>
                charged as {usdNote(price)}
              </p>
            )}
            <p className="font-body text-xs leading-relaxed" style={{ color: "hsl(30 12% 48%)" }}>
              Pay once for a single letter — no subscription. Write as many as you'd like, each with its own private link.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
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
      // Shouldn't happen — Supabase always gives us an email — but guard
      // anyway so we don't create a bogus pending_orders row.
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    setPending(pkg.id);
    // Namespace by user id so leftover state from a previous session on
    // this browser doesn't make a fresh signup look like a paying user.
    localStorage.setItem(`selected_package_${user.id}`, pkg.id);
    // Clean up the old un-namespaced key from earlier builds.
    localStorage.removeItem("selected_package");

    // Route the checkout through create-checkout so the webhook can match
    // this purchase back to `user.email` via metadata.order_id — no more
    // "wrong email at checkout" or "webhook can't resolve email" failures.
    const redirectUrl = `${window.location.origin}/payment-success?plan=${pkg.id}`;
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: pkg.id, app_email: user.email, redirect_url: redirectUrl },
      });
      if (error || !data?.purchase_url) throw error ?? new Error("no purchase_url");
      // Same-tab navigation: Whop's post-payment redirect then brings the
      // buyer straight back to /payment-success instead of stranding them
      // on the Whop dashboard in a second tab.
      window.location.href = data.purchase_url;
    } catch (e) {
      console.error("[Pricing] create-checkout failed, falling back to raw Whop URL", e);
      // Fallback: if the edge function is down (or hasn't been deployed
      // yet), don't leave the user stranded — open Whop directly. The
      // webhook may still resolve the email via user_email in the payload.
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
        title="Pricing — Wed4Love Love Letters from $7.99 · Wedding Invitations from $49"
        description="Simple, one-time pricing. Love Letter $7.99 per letter. Wedding invitations: Starter $49, Premium $99, Custom $299. No subscriptions."
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
              Pricing
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Choose what to send
            </h1>
            <p className="font-body text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              We do two things — a personal love letter for one person, or a full wedding invitation for your guests.
              Pay once for either, no subscriptions.
            </p>
          </div>

          {/* ─── Love Letter (a separate product) ─── */}
          <LoveLetterSection />

          {/* ─── Divider ─── */}
          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 h-px" style={{ background: "hsl(38 40% 86%)" }} />
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full font-body text-[11px] font-bold uppercase tracking-widest"
              style={{ background: "hsl(38 60% 93%)", color: GOLD, border: "1.5px solid hsl(38 55% 82%)" }}
            >
              <Mail className="w-3 h-3" /> Or planning a wedding?
            </div>
            <div className="flex-1 h-px" style={{ background: "hsl(38 40% 86%)" }} />
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Wedding Invitation packages
            </h2>
            <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
              A cinematic digital invitation for your guest list — with live RSVP tracking, guest dashboard, and shareable link.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {PACKAGES.map((p, i) => (
              <PricingCard key={p.id} pkg={p} index={i} onChoose={choose} busy={pending === p.id} />
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
