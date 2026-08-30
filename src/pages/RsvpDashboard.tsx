import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getInviteLocal } from "@/lib/inviteStorage";
import {
  Search, Download, Check, Users, X, MessageSquare,
  RefreshCw, UserCheck2, ExternalLink, MapPin, Calendar,
  Heart, Clock, Copy, CheckCheck, QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { useInviteEntitlement } from "@/hooks/useInviteEntitlement";
import { Link as RouterLink } from "react-router-dom";

interface Rsvp {
  id: string;
  invite_id: string;
  event_name: string | null;
  event_date: string | null;
  event_venue: string | null;
  event_location: string | null;
  name: string;
  email: string;
  attendance: string;
  guests_count: number;
  message: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  host_notes: string | null;
  created_at: string;
}

type Filter = "all" | "attending" | "not_attending" | "checked_in";

function useCountdown(dateISO: string | null) {
  const calc = () => {
    if (!dateISO) return null;
    const diff = Math.max(0, new Date(dateISO).getTime() - Date.now());
    if (diff === 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 60000);
    return () => clearInterval(id);
  }, [dateISO]);
  return t;
}

export default function RsvpDashboard() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [savingNotes, setSavingNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const inviteUrl = `${window.location.origin}/invite/${inviteId}`;
  const { plan: userPlan, loading: entLoading } = useInviteEntitlement(false);

  // Pull rich data from localStorage (same device) — falls back to rsvp-embedded data
  const stored = inviteId ? getInviteLocal(inviteId) : null;

  const fetchRsvps = useCallback(async () => {
    if (!inviteId) return;
    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .eq("invite_id", inviteId)
      .order("created_at", { ascending: false });
    if (data) setRsvps(data as Rsvp[]);
    setLoading(false);
    setLastRefresh(new Date());
  }, [inviteId]);

  useEffect(() => {
    fetchRsvps();
    const channel = supabase
      .channel(`rsvps_${inviteId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, fetchRsvps)
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") console.warn("[RsvpDashboard] realtime channel error");
      });
    return () => { supabase.removeChannel(channel).catch(() => {}); };
  }, [inviteId, fetchRsvps]);

  const checkIn = async (id: string, current: boolean) => {
    const next = !current;
    setRsvps(prev => prev.map(r => r.id === id
      ? { ...r, checked_in: next, checked_in_at: next ? new Date().toISOString() : null }
      : r));
    await supabase.from("rsvps").update({
      checked_in: next,
      checked_in_at: next ? new Date().toISOString() : null,
    }).eq("id", id);
  };

  const saveNotes = async (id: string) => {
    setSavingNotes(true);
    await supabase.from("rsvps").update({ host_notes: notesDraft || null }).eq("id", id);
    setRsvps(prev => prev.map(r => r.id === id ? { ...r, host_notes: notesDraft || null } : r));
    setSavingNotes(false);
    setEditingNotes(null);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Attendance", "Guests", "Message", "Checked In", "Check-in Time", "Host Notes", "RSVP Time"],
      ...filtered.map(r => [
        r.name, r.email,
        r.attendance === "attending" ? "Attending" : "Declining",
        r.guests_count,
        r.message ?? "",
        r.checked_in ? "Yes" : "No",
        r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : "",
        r.host_notes ?? "",
        new Date(r.created_at).toLocaleString(),
      ]),
    ];
    const csv = rows.map(row =>
      row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rsvps-${inviteId}.csv`;
    a.click();
  };

  // Event info — prefer localStorage (full data), fall back to rsvp-embedded
  const partner1   = stored?.partner1   ?? rsvps[0]?.event_name?.split(" & ")[0] ?? "Partner 1";
  const partner2   = stored?.partner2   ?? rsvps[0]?.event_name?.split(" & ")[1] ?? "Partner 2";
  const eventDate  = stored?.date        ?? rsvps[0]?.event_date  ?? "";
  const eventTime  = stored?.time        ?? "";
  const venueName  = stored?.venueName   ?? rsvps[0]?.event_venue ?? "";
  const venueCity  = stored
    ? [stored.venueAddress, stored.venueCity].filter(Boolean).join(", ")
    : (rsvps[0]?.event_location ?? "");
  const dateISO    = stored?.dateISO     ?? null;

  const countdown  = useCountdown(dateISO);

  const attending    = rsvps.filter(r => r.attendance === "attending");
  const notAttending = rsvps.filter(r => r.attendance === "not_attending");
  const checkedIn    = rsvps.filter(r => r.checked_in);
  const totalGuests  = attending.reduce((sum, r) => sum + (r.guests_count || 1), 0);
  const attendRate   = rsvps.length > 0 ? Math.round((attending.length / rsvps.length) * 100) : 0;

  const filtered = rsvps.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ||
      (filter === "attending"     && r.attendance === "attending") ||
      (filter === "not_attending" && r.attendance === "not_attending") ||
      (filter === "checked_in"    && r.checked_in);
    return matchSearch && matchFilter;
  });

  // ── Payment gate — dashboard unlocks after the $49 purchase ───────────────
  if (entLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))" }}>
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: "hsl(38 72% 44%)" }} />
      </div>
    );
  }

  if (!userPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))" }}>
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))" }}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Dashboard locked</h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Your RSVP dashboard unlocks with the one-time $49 invitation package.
          </p>
          <RouterLink
            to="/choose-template"
            className="inline-block w-full py-3 rounded-2xl font-body text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))" }}
          >
            Unlock for $49 →
          </RouterLink>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen" style={{ background: "hsl(44 28% 95%)" }}>

      {/* ── Hero header ── */}
      <div style={{ background: "hsl(100 20% 18%)" }}>
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-8">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to={`/invite/${inviteId}`}
              className="font-body text-xs tracking-widest uppercase flex items-center gap-1.5 transition-opacity hover:opacity-60"
              style={{ color: "hsl(42 28% 55%)" }}
            >
              ← Invite
            </Link>
            <div className="flex items-center gap-4">
              <a
                href={`/invite/${inviteId}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View invite"
                className="transition-opacity hover:opacity-60"
                style={{ color: "hsl(42 28% 52%)" }}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={fetchRsvps}
                title="Refresh"
                className="transition-opacity hover:opacity-60"
                style={{ color: "hsl(42 28% 52%)" }}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Couple names */}
          <div className="text-center mb-6">
            <p
              className="font-body tracking-[0.3em] uppercase mb-3"
              style={{ fontSize: "0.58rem", color: "hsl(42 30% 52%)" }}
            >
              RSVP Dashboard
            </p>
            <h1
              className="font-handwritten leading-none mb-3"
              style={{ fontSize: "clamp(2.6rem, 8vw, 4.5rem)", color: "white" }}
            >
              {partner1}
              <span style={{ color: "hsl(42 52% 58%)", margin: "0 0.4em" }}>&</span>
              {partner2}
            </h1>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div style={{ height: 1, width: 32, background: "hsl(42 30% 38%)" }} />
              <Heart className="w-3 h-3" style={{ color: "hsl(42 48% 52%)" }} />
              <div style={{ height: 1, width: 32, background: "hsl(42 30% 38%)" }} />
            </div>

            {/* Date + venue */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              {eventDate && (
                <span className="flex items-center gap-1.5 font-body text-sm" style={{ color: "hsl(42 28% 68%)" }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: "hsl(42 46% 52%)" }} />
                  {eventDate}{eventTime ? ` · ${eventTime}` : ""}
                </span>
              )}
              {venueName && (
                <span className="flex items-center gap-1.5 font-body text-sm" style={{ color: "hsl(42 28% 68%)" }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: "hsl(42 46% 52%)" }} />
                  {venueName}
                </span>
              )}
              {venueCity && (
                <span className="font-body text-sm" style={{ color: "hsl(42 20% 52%)" }}>
                  {venueCity}
                </span>
              )}
            </div>
          </div>

          {/* Countdown */}
          {countdown && (
            <div className="flex justify-center gap-4 mt-6">
              {[
                { v: countdown.days,  l: "Days" },
                { v: countdown.hours, l: "Hours" },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  className="flex flex-col items-center px-6 py-3 rounded-2xl"
                  style={{ background: "hsl(100 18% 24%)", border: "1px solid hsl(100 16% 30%)" }}
                >
                  <span className="font-display font-bold text-3xl leading-none" style={{ color: "white" }}>
                    {String(v).padStart(2, "0")}
                  </span>
                  <span className="font-body text-xs mt-1 tracking-widest uppercase" style={{ color: "hsl(42 24% 52%)" }}>
                    {l}
                  </span>
                </div>
              ))}
              <div
                className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl"
                style={{ background: "hsl(100 18% 24%)", border: "1px solid hsl(100 16% 30%)" }}
              >
                <Clock className="w-5 h-5 mb-1" style={{ color: "hsl(42 46% 52%)" }} />
                <span className="font-body text-xs tracking-widest uppercase" style={{ color: "hsl(42 24% 52%)" }}>
                  Until Wedding
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Attendance rate bar */}
        {rsvps.length > 0 && (
          <div style={{ background: "hsl(100 18% 14%)", borderTop: "1px solid hsl(100 16% 22%)" }}>
            <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-4">
              <span className="font-body text-xs shrink-0" style={{ color: "hsl(42 24% 50%)", width: 120 }}>
                Acceptance rate
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(100 15% 26%)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${attendRate}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(142 40% 38%), hsl(142 48% 48%))" }}
                />
              </div>
              <span className="font-body font-bold text-sm shrink-0" style={{ color: "hsl(142 40% 60%)", width: 36, textAlign: "right" }}>
                {attendRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* QR + Invite link card */}
        <div
          className="rounded-2xl overflow-hidden flex flex-col sm:flex-row"
          style={{ background: "white", border: "1px solid hsl(38 28% 84%)" }}
        >
          {/* QR code */}
          <div
            className="flex flex-col items-center justify-center gap-3 px-8 py-7 sm:border-r shrink-0"
            style={{ borderColor: "hsl(38 26% 88%)", background: "hsl(44 24% 97%)" }}
          >
            <div className="p-3 rounded-2xl" style={{ background: "white", boxShadow: "0 2px 12px hsl(28 20% 50% / 0.10)" }}>
              <QRCodeCanvas
                ref={qrRef}
                value={inviteUrl}
                size={140}
                level="M"
                fgColor="hsl(28 20% 18%)"
                bgColor="white"
              />
            </div>
            <p className="font-body text-xs text-center" style={{ color: "hsl(38 16% 58%)" }}>
              Guests scan to open invite
            </p>
          </div>

          {/* Link + actions */}
          <div className="flex-1 px-6 py-6 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-2 mb-1">
              <QrCode className="w-4 h-4" style={{ color: "hsl(38 46% 50%)" }} />
              <span
                className="font-body font-bold uppercase tracking-widest"
                style={{ fontSize: "0.6rem", color: "hsl(38 18% 55%)" }}
              >
                Invite Link
              </span>
            </div>

            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "hsl(44 24% 96%)", border: "1px solid hsl(38 26% 86%)" }}
            >
              <p
                className="font-body text-sm flex-1 truncate select-all"
                style={{ color: "hsl(28 20% 25%)" }}
              >
                {inviteUrl}
              </p>
              <button
                onClick={copyLink}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all"
                style={{
                  background: copied ? "hsl(142 38% 88%)" : "hsl(100 20% 22%)",
                  color: copied ? "hsl(142 42% 28%)" : "hsl(42 36% 88%)",
                }}
              >
                {copied
                  ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-body text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "hsl(100 20% 22%)", color: "hsl(42 36% 88%)" }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Invite
              </a>
              <button
                onClick={() => {
                  const canvas = qrRef.current;
                  if (!canvas) return;
                  const a = document.createElement("a");
                  a.href = canvas.toDataURL("image/png");
                  a.download = `invite-qr-${inviteId}.png`;
                  a.click();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-body text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "hsl(38 36% 88%)", color: "hsl(28 18% 30%)" }}
              >
                <Download className="w-3.5 h-3.5" />
                Download QR
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total RSVPs", value: rsvps.length, sub: null,
              icon: Users, bg: "hsl(100 15% 90%)", fg: "hsl(100 22% 28%)",
            },
            {
              label: "Attending", value: attending.length,
              sub: totalGuests > 0 ? `${totalGuests} total guests` : null,
              icon: Check, bg: "hsl(142 35% 88%)", fg: "hsl(142 40% 30%)",
            },
            {
              label: "Declining", value: notAttending.length, sub: null,
              icon: X, bg: "hsl(0 30% 90%)", fg: "hsl(0 42% 44%)",
            },
            {
              label: "Checked In", value: checkedIn.length,
              sub: attending.length > 0 ? `of ${attending.length} attending` : null,
              icon: UserCheck2, bg: "hsl(38 55% 88%)", fg: "hsl(38 55% 34%)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4"
              style={{ background: "white", border: "1px solid hsl(38 28% 86%)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-body uppercase tracking-widest"
                  style={{ fontSize: "0.58rem", color: "hsl(38 18% 55%)" }}
                >
                  {stat.label}
                </span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: stat.bg }}
                >
                  <stat.icon className="w-3.5 h-3.5" style={{ color: stat.fg }} />
                </div>
              </div>
              <span
                className="font-display font-bold block"
                style={{ fontSize: "2rem", lineHeight: 1, color: "hsl(28 20% 18%)" }}
              >
                {stat.value}
              </span>
              {stat.sub && (
                <span className="font-body text-xs mt-1 block" style={{ color: "hsl(38 18% 58%)" }}>
                  {stat.sub}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "hsl(38 18% 60%)" }}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl font-body text-sm outline-none"
              style={{ background: "white", border: "1px solid hsl(38 28% 84%)", color: "hsl(28 20% 18%)" }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {(["all", "attending", "not_attending", "checked_in"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-xl font-body text-xs font-semibold shrink-0 transition-all"
                style={{
                  background: filter === f ? "hsl(100 20% 22%)" : "white",
                  color: filter === f ? "hsl(42 40% 85%)" : "hsl(28 15% 48%)",
                  border: "1px solid hsl(38 28% 84%)",
                }}
              >
                {{ all: "All", attending: "Attending", not_attending: "Declining", checked_in: "Checked In" }[f]}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-semibold shrink-0 transition-opacity hover:opacity-80"
            style={{ background: "hsl(38 42% 80%)", color: "hsl(28 20% 20%)" }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Guest list */}
        {loading ? (
          <div className="text-center py-20">
            <p className="font-body text-sm" style={{ color: "hsl(38 18% 60%)" }}>Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-handwritten text-3xl mb-2" style={{ color: "hsl(28 15% 55%)" }}>
              {rsvps.length === 0 ? "No RSVPs yet" : "No matches"}
            </p>
            <p className="font-body text-sm" style={{ color: "hsl(38 18% 62%)" }}>
              {rsvps.length === 0
                ? "Share the invite link to start collecting responses."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-body text-xs" style={{ color: "hsl(38 16% 58%)" }}>
              {filtered.length} {filtered.length === 1 ? "guest" : "guests"}
              {filter !== "all" ? ` · ${filter.replace("_", " ")}` : ""}
            </p>

            {filtered.map((rsvp, i) => (
              <motion.div
                key={rsvp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "white",
                  border: "1px solid hsl(38 28% 84%)",
                  opacity: rsvp.checked_in ? 0.72 : 1,
                }}
              >
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-base"
                    style={{
                      background: rsvp.attendance === "attending" ? "hsl(100 20% 86%)" : "hsl(0 20% 90%)",
                      color: rsvp.attendance === "attending" ? "hsl(100 28% 32%)" : "hsl(0 38% 46%)",
                    }}
                  >
                    {rsvp.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-body font-semibold text-base" style={{ color: "hsl(28 20% 15%)" }}>
                        {rsvp.name}
                      </span>

                      <span
                        className="rounded-full px-2.5 py-0.5 font-body font-bold uppercase"
                        style={{
                          fontSize: "0.58rem", letterSpacing: "0.08em",
                          background: rsvp.attendance === "attending" ? "hsl(142 35% 88%)" : "hsl(0 30% 90%)",
                          color: rsvp.attendance === "attending" ? "hsl(142 42% 28%)" : "hsl(0 42% 42%)",
                        }}
                      >
                        {rsvp.attendance === "attending" ? "Attending" : "Declining"}
                      </span>

                      {rsvp.checked_in && (
                        <span
                          className="rounded-full px-2.5 py-0.5 font-body font-bold uppercase"
                          style={{ fontSize: "0.58rem", letterSpacing: "0.08em", background: "hsl(38 58% 84%)", color: "hsl(38 52% 30%)" }}
                        >
                          Arrived
                        </span>
                      )}
                    </div>

                    <p className="font-body text-xs mb-1.5" style={{ color: "hsl(38 15% 55%)" }}>
                      {rsvp.email}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                      {rsvp.attendance === "attending" && (
                        <span className="font-body text-xs" style={{ color: "hsl(38 18% 55%)" }}>
                          <span className="font-semibold" style={{ color: "hsl(100 28% 35%)" }}>
                            {rsvp.guests_count}
                          </span>{" "}
                          {rsvp.guests_count === 1 ? "guest" : "guests"}
                        </span>
                      )}
                      <span className="font-body text-xs" style={{ color: "hsl(38 14% 65%)" }}>
                        RSVP'd {new Date(rsvp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" at "}
                        {new Date(rsvp.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {rsvp.message && (
                      <p
                        className="font-body text-xs italic mt-2"
                        style={{ color: "hsl(28 14% 52%)", maxWidth: "36rem" }}
                      >
                        "{rsvp.message}"
                      </p>
                    )}

                    {rsvp.host_notes && editingNotes !== rsvp.id && (
                      <p className="font-body text-xs mt-2 flex items-start gap-1.5" style={{ color: "hsl(100 22% 38%)" }}>
                        <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                        {rsvp.host_notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {rsvp.attendance === "attending" && (
                      <button
                        onClick={() => checkIn(rsvp.id, rsvp.checked_in)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-body text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: rsvp.checked_in ? "hsl(38 42% 82%)" : "hsl(100 20% 22%)",
                          color: rsvp.checked_in ? "hsl(28 18% 32%)" : "hsl(42 36% 88%)",
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {rsvp.checked_in ? "Undo" : "Check In"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (editingNotes === rsvp.id) {
                          setEditingNotes(null);
                        } else {
                          setEditingNotes(rsvp.id);
                          setNotesDraft(rsvp.host_notes ?? "");
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-body text-xs font-semibold transition-opacity hover:opacity-70"
                      style={{ background: "hsl(38 28% 90%)", color: "hsl(28 15% 40%)" }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Notes
                    </button>
                  </div>
                </div>

                {/* Notes editor */}
                <AnimatePresence>
                  {editingNotes === rsvp.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="px-5 pb-4 pt-3 border-t" style={{ borderColor: "hsl(38 26% 90%)" }}>
                        <textarea
                          value={notesDraft}
                          onChange={e => setNotesDraft(e.target.value)}
                          rows={2}
                          placeholder="Dietary restrictions, seating notes, special requests…"
                          className="w-full px-3 py-2 rounded-xl font-body text-sm outline-none resize-none"
                          style={{ background: "hsl(44 28% 95%)", border: "1px solid hsl(38 26% 84%)", color: "hsl(28 20% 18%)" }}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => saveNotes(rsvp.id)}
                            disabled={savingNotes}
                            className="px-3 py-1.5 rounded-lg font-body text-xs font-semibold disabled:opacity-50"
                            style={{ background: "hsl(100 20% 22%)", color: "hsl(42 36% 88%)" }}
                          >
                            {savingNotes ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingNotes(null)}
                            className="px-3 py-1.5 rounded-lg font-body text-xs font-semibold"
                            style={{ background: "hsl(38 28% 88%)", color: "hsl(28 15% 40%)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center font-body text-xs pb-8" style={{ color: "hsl(38 14% 66%)" }}>
          Last updated {lastRefresh.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
