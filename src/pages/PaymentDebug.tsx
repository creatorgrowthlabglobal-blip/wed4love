import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Trash2, ClipboardList } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchEntitlement, type Entitlement } from "@/lib/whop";

const PENDING_KEY = "wish4love_pending_payment_v1";
const AUTO_SUBMIT_KEY = "wish4love_call_autosubmit_v1";
const DRAFT_KEY = "wish4love_call_draft_v1";

interface WhopEvent {
  event_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

const PaymentDebug = () => {
  const [events, setEvents] = useState<WhopEvent[]>([]);
  const [pending, setPending] = useState<string>("");
  const [autoSubmit, setAutoSubmit] = useState<string>("");
  const [draft, setDraft] = useState<string>("");
  const [email, setEmail] = useState("");
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("whop_events")
      .select("event_id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) console.error("[PaymentDebug] events error", error);
    setEvents((data as WhopEvent[]) || []);
  };

  const loadStorage = () => {
    try {
      setPending(sessionStorage.getItem(PENDING_KEY) || "(none)");
      setAutoSubmit(sessionStorage.getItem(AUTO_SUBMIT_KEY) || "(none)");
      setDraft(sessionStorage.getItem(DRAFT_KEY) || "(none)");
    } catch {
      setPending("(read error)");
      setAutoSubmit("(read error)");
      setDraft("(read error)");
    }
  };

  const checkEntitlement = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const ent = await fetchEntitlement(email.trim());
    setEntitlement(ent);
    setLoading(false);
  };

  const clearPending = () => {
    try {
      sessionStorage.removeItem(PENDING_KEY);
      sessionStorage.removeItem(AUTO_SUBMIT_KEY);
      sessionStorage.removeItem(DRAFT_KEY);
      loadStorage();
    } catch {}
  };

  useEffect(() => {
    loadEvents();
    loadStorage();
  }, []);

  const lastEvent = events[0];

  return (
    <div className="min-h-screen gradient-blush relative">
      <Header />
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Payment Debug
            </h1>
            <Button variant="outline" size="sm" asChild className="gap-1">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </Button>
          </div>

          {/* Session Storage */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="letter-paper rounded-2xl p-5 shadow-card border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">
                Session Storage
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={loadStorage} className="gap-1 h-8">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
                <Button variant="ghost" size="sm" onClick={clearPending} className="gap-1 h-8 text-destructive">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </Button>
              </div>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 rounded-lg bg-muted/50 border border-border">
                <span className="text-muted-foreground">pending_key:</span>
                <pre className="mt-1 text-foreground whitespace-pre-wrap break-all">{pending}</pre>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 border border-border">
                <span className="text-muted-foreground">auto_submit:</span>
                <pre className="mt-1 text-foreground whitespace-pre-wrap break-all">{autoSubmit}</pre>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 border border-border">
                <span className="text-muted-foreground">call_draft:</span>
                <pre className="mt-1 text-foreground whitespace-pre-wrap break-all">{draft}</pre>
              </div>
            </div>
          </motion.div>

          {/* Entitlement Check */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="letter-paper rounded-2xl p-5 shadow-card border border-border"
          >
            <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Entitlement Lookup
            </h2>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkEntitlement()}
                placeholder="buyer@email.com"
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background font-body text-sm"
              />
              <Button onClick={checkEntitlement} disabled={loading} size="sm">
                {loading ? "Checking…" : "Check"}
              </Button>
            </div>
            {entitlement && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-muted/50 border border-border">
                  <span className="text-muted-foreground">email:</span> {entitlement.email}
                </div>
                <div className="p-2 rounded-lg bg-muted/50 border border-border">
                  <span className="text-muted-foreground">letter_access:</span>{" "}
                  {entitlement.has_letter_access ? "✅ yes" : "❌ no"}
                </div>
                <div className="p-2 rounded-lg bg-muted/50 border border-border">
                  <span className="text-muted-foreground">paid_calls:</span> {entitlement.paid_calls}
                </div>
                <div className="p-2 rounded-lg bg-muted/50 border border-border">
                  <span className="text-muted-foreground">used_calls:</span> {entitlement.used_calls}
                </div>
                <div className="p-2 rounded-lg bg-muted/50 border border-border col-span-2">
                  <span className="text-muted-foreground">available_calls:</span>{" "}
                  {Math.max(0, entitlement.paid_calls - entitlement.used_calls)}
                </div>
              </div>
            )}
            {entitlement === null && email && !loading && (
              <p className="text-xs text-muted-foreground">No entitlement found for this email.</p>
            )}
          </motion.div>

          {/* Last Webhook Event */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="letter-paper rounded-2xl p-5 shadow-card border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide">
                Last Webhook Event
              </h2>
              <Button variant="ghost" size="sm" onClick={loadEvents} className="gap-1 h-8">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>
            {lastEvent ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3 text-xs font-mono">
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {lastEvent.event_id}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border">
                    {new Date(lastEvent.created_at).toLocaleString()}
                  </span>
                </div>
                <details className="group">
                  <summary className="cursor-pointer text-xs text-muted-foreground font-body hover:text-foreground transition-colors">
                    Show payload
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg bg-muted/50 border border-border text-xs font-mono text-foreground whitespace-pre-wrap break-all overflow-auto max-h-80">
                    {JSON.stringify(lastEvent.payload, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No webhook events recorded yet.</p>
            )}
          </motion.div>

          {/* Recent Events Log */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="letter-paper rounded-2xl p-5 shadow-card border border-border"
          >
            <h2 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Recent Events ({events.length})
            </h2>
            {events.length > 0 ? (
              <div className="space-y-2">
                {events.map((ev) => {
                  const payload = ev.payload as Record<string, unknown>;
                  const planName =
                    (payload?.data as Record<string, unknown>)?.plan_name ||
                    (payload?.data as Record<string, unknown>)?.plan?.name ||
                    "";
                  const userEmail =
                    (payload?.data as Record<string, unknown>)?.user?.email ||
                    (payload?.data as Record<string, unknown>)?.email ||
                    "";
                  const status =
                    (payload?.data as Record<string, unknown>)?.status ||
                    (payload?.data as Record<string, unknown>)?.payment?.status ||
                    "";
                  return (
                    <div
                      key={ev.event_id}
                      className="flex flex-wrap items-center gap-2 text-xs font-mono p-2 rounded-lg bg-muted/40 border border-border"
                    >
                      <span className="text-primary font-semibold">{ev.event_id}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-foreground">{new Date(ev.created_at).toLocaleTimeString()}</span>
                      {planName && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-accent-foreground bg-accent/20 px-1.5 py-0.5 rounded">
                            {String(planName)}
                          </span>
                        </>
                      )}
                      {status && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              String(status) === "completed" || String(status) === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {String(status)}
                          </span>
                        </>
                      )}
                      {userEmail && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-foreground">{String(userEmail)}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No events.</p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentDebug;
