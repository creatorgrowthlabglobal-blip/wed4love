import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, Mail } from "lucide-react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { fetchEntitlement } from "@/lib/whop";
import { supabase } from "@/integrations/supabase/client";

type Status = "checking" | "granted" | "pending" | "error";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 90_000;

const PENDING_KEY = "wish4love_pending_payment_v1";

type PendingPayment = { product?: string; letterId?: string; email?: string; ts?: number };

const readPending = (): PendingPayment => {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PendingPayment;
    // expire after 30 min
    if (parsed.ts && Date.now() - parsed.ts > 30 * 60 * 1000) {
      sessionStorage.removeItem(PENDING_KEY);
      return {};
    }
    return parsed || {};
  } catch {
    return {};
  }
};

const PaymentStatus = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const pending = readPending();
  const letterId = params.get("letter_id") || pending.letterId || "";
  const product = params.get("product") || pending.product || "letter"; // "letter" | "call"

  const user = getCurrentUser();
  const email = user?.email || params.get("email") || pending.email || "";

  const [status, setStatus] = useState<Status>("checking");
  const [elapsed, setElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [manualEmail, setManualEmail] = useState(email);

  const checkOnce = async (e: string): Promise<boolean> => {
    if (!e) return false;
    const ent = await fetchEntitlement(e);
    if (!ent) return false;
    if (product === "letter" && ent.has_letter_access) return true;
    if (product === "call" && ent.paid_calls > ent.used_calls) return true;
    return false;
  };

  useEffect(() => {
    if (!email) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    const started = Date.now();
    // We claim payments made since slightly before the user clicked Pay.
    const sinceMs = pending.ts ? pending.ts - 60_000 : Date.now() - 30 * 60_000;
    let claimAttempted = false;

    const poll = async () => {
      let ok = await checkOnce(email);
      // After 2nd failed poll, try to claim a recent Whop payment that may
      // have been made under a different email at Whop checkout.
      if (!ok && !claimAttempted && attempts >= 1) {
        claimAttempted = true;
        try {
          await supabase.functions.invoke("claim-payment", {
            body: { app_email: email, since_ms: sinceMs, product },
          });
        } catch (e) {
          console.warn("[PaymentStatus] claim-payment failed", e);
        }
        ok = await checkOnce(email);
      }
      if (cancelled) return;
      setAttempts((a) => a + 1);
      setElapsed(Date.now() - started);
      if (ok) {
        setStatus("granted");
        return;
      }
      if (Date.now() - started > MAX_POLL_MS) {
        setStatus("pending");
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, product]);

  useEffect(() => {
    if (status !== "granted") return;
    try { sessionStorage.removeItem(PENDING_KEY); } catch {}
    const t = setTimeout(() => {
      if (product === "letter" && letterId) navigate(`/letter-ready/${letterId}`, { replace: true });
      else if (product === "call") navigate("/schedule-call", { replace: true });
      else navigate("/letter-history", { replace: true });
    }, 1400);
    return () => clearTimeout(t);
  }, [status, product, letterId, navigate]);

  const retryNow = async () => {
    setStatus("checking");
    const ok = await checkOnce(manualEmail);
    setAttempts((a) => a + 1);
    setStatus(ok ? "granted" : "pending");
  };

  return (
    <div className="min-h-screen gradient-blush relative">
      <Header />
      <FloatingHearts count={4} />
      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto letter-paper rounded-3xl p-8 sm:p-10 text-center shadow-card border border-primary/10"
        >
          {status === "checking" && (
            <>
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Confirming your payment…
              </h1>
              <p className="font-body text-base text-muted-foreground mb-2">
                We're waiting for Whop to confirm your purchase. This usually takes a few seconds.
              </p>
              <p className="font-body text-xs text-muted-foreground/70">
                Attempt {attempts} · {Math.round(elapsed / 1000)}s elapsed
              </p>
            </>
          )}

          {status === "granted" && (
            <>
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Payment confirmed 💌
              </h1>
              <p className="font-body text-base text-muted-foreground">
                Access granted. Taking you there now…
              </p>
            </>
          )}

          {status === "pending" && (
            <>
              <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Still waiting on confirmation
              </h1>
              <p className="font-body text-base text-muted-foreground mb-5">
                Your payment may still be processing. If you just paid, give it another minute — we'll re-check below.
                If you used a different email at Whop checkout, enter it here.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background font-body text-sm"
                  />
                </div>
                <Button onClick={retryNow} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Re-check
                </Button>
              </div>
              <p className="font-body text-xs text-muted-foreground">
                Still no luck? Email <a className="underline" href="mailto:support@wish4love.com">support@wish4love.com</a> with your Whop receipt and we'll grant access manually.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                We couldn't identify your account
              </h1>
              <p className="font-body text-base text-muted-foreground mb-5">
                Sign in with the email you used at Whop checkout, and we'll confirm your payment instantly.
              </p>
              <Button asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentStatus;
