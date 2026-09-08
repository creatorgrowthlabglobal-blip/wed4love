import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInviteEntitlement } from "@/hooks/useInviteEntitlement";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PACKAGES, type PackageDef } from "./Pricing";
import { Seo } from "@/components/Seo";
import { notify } from "@/lib/notify";
import { supabase } from "@/integrations/supabase/client";

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";
const AUTO_FORWARD_MS = 3500;

type PlanId = PackageDef["id"];

const isPlanId = (v: string | null | undefined): v is PlanId =>
  v === "starter" || v === "premium" || v === "custom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const { format } = useCurrency();

  // Poll entitlement until Whop's webhook lands (up to 45s)
  const { plan, loading, timeout } = useInviteEntitlement(true);

  // Belt-and-braces verification: even when the webhook is late, misfires,
  // or is skipped entirely (Whop can skip webhooks on $0 promo checkouts),
  // ask Whop's API directly whether this user has a valid invite membership
  // and, if so, write the entitlement. The polling above will then pick it
  // up on the next tick without any additional state coordination.
  useEffect(() => {
    if (!user?.email || plan) return;
    let cancelled = false;
    const run = async () => {
      try {
        const { error } = await supabase.functions.invoke(
          "verify-invite-payment",
          { body: { app_email: user.email } },
        );
        if (cancelled) return;
        if (error) throw error;
      } catch (e) {
        console.warn("[PaymentSuccess] verify-invite-payment failed", e);
      }
    };
    // Fire immediately, then again after 8s in case Whop took a moment to
    // record the membership. If both pass without finding anything we let
    // the 45s useInviteEntitlement timeout take over.
    run();
    const t = setTimeout(run, 8000);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user?.email, plan]);

  // Prefer the plan we've *confirmed* from the DB. Fall back to the URL
  // query (?plan=premium) or the last selected package in localStorage so
  // we can show something meaningful while polling.
  const queryPlan = searchParams.get("plan");
  // Namespaced by user id so we don't inherit a "checkout in flight" flag
  // from whoever used this browser last (fresh signups were getting stuck
  // on this page because of that leaked state).
  const storedPlan =
    typeof window !== "undefined" && user
      ? localStorage.getItem(`selected_package_${user.id}`)
      : null;
  const hintedPlan: PlanId | null = useMemo(() => {
    if (isPlanId(plan)) return plan;
    if (isPlanId(queryPlan)) return queryPlan;
    if (isPlanId(storedPlan)) return storedPlan;
    return null;
  }, [plan, queryPlan, storedPlan]);

  const pkg = useMemo(
    () => (hintedPlan ? PACKAGES.find(p => p.id === hintedPlan) ?? null : null),
    [hintedPlan]
  );

  // Auto-forward to the builder once entitlement is confirmed. The user
  // still sees the "you're now a X member" confirmation for a beat, then
  // we drop them straight into template selection.
  const [autoForwardIn, setAutoForwardIn] = useState<number | null>(null);
  useEffect(() => {
    if (!plan) return;
    notify("payment_confirmed", { plan, email: user?.email });
    if (user) localStorage.removeItem(`selected_package_${user.id}`);
    // Also clean the legacy un-namespaced key if it's still around.
    localStorage.removeItem("selected_package");
    setAutoForwardIn(Math.ceil(AUTO_FORWARD_MS / 1000));
    const forward = setTimeout(() => navigate("/choose-template"), AUTO_FORWARD_MS);
    const tick = setInterval(
      () => setAutoForwardIn(n => (n && n > 0 ? n - 1 : n)),
      1000
    );
    return () => {
      clearTimeout(forward);
      clearInterval(tick);
    };
  }, [plan, user?.email, navigate]);

  // If someone deep-links to /payment-success without ever having started
  // a checkout, don't leave them staring at a spinner for 45s.
  const noCheckoutInFlight = !storedPlan && !queryPlan && !plan;
  useEffect(() => {
    if (!authLoading && user && noCheckoutInFlight && !loading) {
      navigate("/pricing", { replace: true });
    }
  }, [authLoading, user, noCheckoutInFlight, loading, navigate]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "linear-gradient(175deg, hsl(42 60% 98%), hsl(38 45% 96%))" }}
      >
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: "/payment-success" }} replace />;
  }

  const confirmed = !!plan;
  const Icon = pkg?.icon ?? Sparkles;

  return (
    <div
      className="min-h-screen relative px-5 py-16 sm:py-20 overflow-hidden"
      style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(38 50% 96%) 50%, hsl(350 35% 97%))" }}
    >
      <Seo
        title="Payment Confirmed — Wed4Love"
        description="Your Wed4Love package is active. Choose a template and start building your invitation."
        path="/payment-success"
      />

      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(38 72% 60% / 0.10) 0%, transparent 65%)", transform: "translate(30%,-30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(340 50% 70% / 0.07) 0%, transparent 65%)", transform: "translate(-25%,25%)" }}
      />

      <div className="relative max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{
            background: confirmed ? GOLD_GRAD : "hsl(38 40% 92%)",
            boxShadow: confirmed ? "0 10px 40px hsl(38 72% 44% / 0.32)" : undefined,
          }}
        >
          {confirmed ? (
            <Check className="w-11 h-11" style={{ color: "white", strokeWidth: 3 }} />
          ) : timeout ? (
            <AlertCircle className="w-10 h-10" style={{ color: GOLD }} />
          ) : (
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: GOLD }} />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <p
            className="font-body text-[10px] tracking-[0.32em] uppercase font-semibold mb-3"
            style={{ color: "hsl(38 50% 54%)" }}
          >
            {confirmed ? "Payment Confirmed" : timeout ? "Still Processing" : "Confirming Payment"}
          </p>

          <h1
            className="font-display font-bold mb-4"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.1rem)", color: "hsl(30 20% 14%)", lineHeight: 1.15 }}
          >
            {confirmed && pkg
              ? <>You're now a <span style={{ color: GOLD }}>{pkg.name}</span> member!</>
              : confirmed
                ? "You're all set!"
                : timeout
                  ? "Almost there…"
                  : "Just a moment — confirming your payment"}
          </h1>

          <p className="font-body text-sm mb-8 leading-relaxed" style={{ color: "hsl(30 14% 36%)" }}>
            {confirmed
              ? "Thanks for choosing Wed4Love. Your package is active — you can start building your invitation right now."
              : timeout
                ? "The payment provider is taking a little longer than usual. If you completed checkout, this should clear in a minute — try refreshing, or contact us on WhatsApp if it doesn't."
                : "We're waiting for confirmation from our payment provider. This usually takes only a few seconds."}
          </p>

          {pkg && (
            <div
              className="rounded-2xl p-5 mb-8 text-left bg-card"
              style={{ border: `1.5px solid ${confirmed ? "hsl(38 55% 78%)" : "hsl(38 40% 88%)"}`, boxShadow: "0 6px 22px hsl(38 40% 60% / 0.08)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: GOLD }} />
                  <p className="font-display font-bold text-base text-foreground">{pkg.name}</p>
                </div>
                <p className="font-display font-bold text-lg" style={{ color: GOLD }}>
                  {format(pkg.price)}
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {pkg.included.slice(0, 5).map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: GOLD }} />
                    <span className="font-body text-[13px] leading-snug text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {confirmed ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/choose-template")}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-body text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: GOLD_GRAD, boxShadow: "0 8px 26px hsl(38 72% 44% / 0.28)" }}
              >
                Create Your Invitation
                <ArrowRight className="w-4 h-4" />
              </button>
              {autoForwardIn !== null && autoForwardIn > 0 && (
                <p className="font-body text-xs text-muted-foreground">
                  Taking you to the template picker in {autoForwardIn}s…
                </p>
              )}
              <Link
                to="/my-invitations"
                className="w-full py-3.5 rounded-2xl font-body text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "white", color: "hsl(38 55% 42%)", border: "1.5px solid hsl(38 45% 78%)" }}
              >
                View my invitations
              </Link>
            </div>
          ) : timeout ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-2xl font-body text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: GOLD_GRAD }}
              >
                Refresh & try again
              </button>
              <a
                href="https://wa.me/9779702238084"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl font-body text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "white", color: "hsl(142 60% 34%)", border: "1.5px solid hsl(142 40% 70%)" }}
              >
                Message us on WhatsApp
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-body text-xs">Waiting for confirmation…</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
