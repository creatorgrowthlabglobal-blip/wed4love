import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Phone, ArrowLeft, Mic, Type, Clock, CheckCircle2, XCircle, Loader2, CalendarClock } from "lucide-react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/lib/auth";

type CallRecord = {
  id: string;
  recipient_name: string;
  phone: string;
  occasion: string | null;
  mode: string;
  status: string;
  scheduled_at: string;
  created_at: string;
  last_error: string | null;
  text_message: string | null;
};

const OCCASION_LABELS: Record<string, string> = {
  birthday: "Birthday",
  anniversary: "Anniversary",
  "just-because": "Just Because",
  confession: "Secret Confession",
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }
  if (status === "placed" || status === "done" || status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> Placed
      </span>
    );
  }
  if (status === "failed" || status === "error") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-200">
        <XCircle className="w-3 h-3" /> Failed
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
        <CalendarClock className="w-3 h-3" /> Scheduled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-muted-foreground border border-border">
      {status}
    </span>
  );
};

const CallHistory = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.email) { setLoading(false); return; }

    supabase
      .from("scheduled_calls")
      .select("id, recipient_name, phone, occasion, mode, status, scheduled_at, created_at, last_error, text_message")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCalls((data as CallRecord[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(350_100%_97%)] to-background">
      <Header />
      <FloatingHearts count={4} />

      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <Link
          to="/schedule-call"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Schedule Call
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-2">
            Call <span className="text-primary italic">History</span>
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            All the reminder calls you've placed or scheduled
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : calls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-12 text-center border border-primary/10"
            style={{ boxShadow: "0 20px 60px hsl(340 60% 80% / 0.15)" }}
          >
            <Phone className="w-10 h-10 text-primary/30 mx-auto mb-4" />
            <p className="font-body text-sm text-muted-foreground mb-5">
              No calls placed yet
            </p>
            <Link
              to="/schedule-call"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-full shadow-romantic hover:shadow-glow transition-all"
            >
              <Phone className="w-3.5 h-3.5" /> Schedule Your First Call
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {calls.map((call, i) => {
              const scheduledDate = parseISO(call.scheduled_at);
              const isFuture = scheduledDate > new Date();
              return (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-5 border border-primary/10 flex items-start justify-between gap-4"
                  style={{ boxShadow: "0 4px 20px hsl(340 60% 80% / 0.1)" }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      {call.mode === "voice" ? (
                        <Mic className="w-4 h-4 text-primary" />
                      ) : (
                        <Type className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground truncate">
                        To: {call.recipient_name}
                      </p>
                      {call.occasion && (
                        <p className="font-body text-xs text-muted-foreground">
                          {OCCASION_LABELS[call.occasion] ?? call.occasion}
                        </p>
                      )}
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {isFuture ? "Scheduled for " : "Sent "}{format(scheduledDate, "PPP · h:mm a")}
                      </p>
                      {call.text_message && (
                        <p className="font-body text-xs text-muted-foreground mt-1 italic line-clamp-1">
                          "{call.text_message}"
                        </p>
                      )}
                      {call.status === "failed" && call.last_error && (
                        <p className="font-body text-xs text-red-400 mt-1 line-clamp-1">
                          {call.last_error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={call.status} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CallHistory;
