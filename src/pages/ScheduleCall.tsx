import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Phone,
  Mic,
  Square,
  Play,
  CalendarIcon,
  Sparkles,
  Check,
  Cake,
  Heart,
  Gift,
  Bell,
} from "lucide-react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, buildE164, sanitizeLocalNumber, zonedWallTimeToUtc, tzOffsetLabel } from "@/lib/countries";
import { WHOP_EXTRA_CALL_CHECKOUT, buildWhopCheckoutUrl, fetchEntitlement, consumeCallCredit } from "@/lib/whop";
import { getCurrentUser } from "@/lib/auth";

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const FREE_KEY = "wish4love_free_calls_remaining_v2"; // legacy, no longer authoritative
const FREE_TOTAL = 2;
const DRAFT_KEY = "wish4love_call_draft_v1";
const AUTO_SUBMIT_KEY = "wish4love_call_autosubmit_v1";

type CallDraft = {
  recipientName: string;
  countryCode: string;
  localPhone: string;
  occasion: string;
  sendMode: "now" | "later";
  date?: string; // ISO
  time: string;
  mode: "voice" | "tts";
  ttsText: string;
  voice: "female" | "male";
  audioBase64?: string;
  audioMime?: string;
};

const occasions = [
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "anniversary", label: "Anniversary", icon: Heart },
  { id: "just-because", label: "Just Because", icon: Gift },
  { id: "custom", label: "Custom", icon: Bell },
];

const ttsVoices = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
];

const REGIONS: Array<"Asia" | "Europe" | "Africa" | "Americas"> = [
  "Americas",
  "Europe",
  "Asia",
  "Africa",
];

const ScheduleCall = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [recipientName, setRecipientName] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [localPhone, setLocalPhone] = useState("");
  const [occasion, setOccasion] = useState("birthday");
  const [sendMode, setSendMode] = useState<"now" | "later">("now");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [mode, setMode] = useState<"voice" | "tts">("voice");
  const [ttsText, setTtsText] = useState("");
  const [voice, setVoice] = useState<"female" | "male">("female");

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [placing, setPlacing] = useState(false);

  const [credits, setCredits] = useState<number>(0);
  const [hasLetterAccess, setHasLetterAccess] = useState<boolean>(false);
  const [entLoading, setEntLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ scheduled: boolean; when?: Date } | null>(null);

  const refreshEntitlement = async () => {
    const user = getCurrentUser();
    if (!user?.email) { setCredits(0); setHasLetterAccess(false); setEntLoading(false); return; }
    const ent = await fetchEntitlement(user.email);
    if (ent) {
      setCredits(Math.max(0, (ent.paid_calls || 0) - (ent.used_calls || 0)));
      setHasLetterAccess(Boolean(ent.has_letter_access));
    } else {
      setCredits(0);
      setHasLetterAccess(false);
    }
    setEntLoading(false);
  };

  const country = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0],
    [countryCode],
  );

  useEffect(() => { refreshEntitlement(); }, []);

  // Restore any draft saved before a Whop redirect, so users land back exactly where they were.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as CallDraft;
      setRecipientName(d.recipientName || "");
      setCountryCode(d.countryCode || "US");
      setLocalPhone(d.localPhone || "");
      setOccasion(d.occasion || "birthday");
      setSendMode(d.sendMode || "now");
      if (d.date) setDate(new Date(d.date));
      setTime(d.time || "09:00");
      setMode(d.mode || "voice");
      setTtsText(d.ttsText || "");
      setVoice(d.voice || "female");
      if (d.audioBase64 && d.audioMime) {
        const bin = atob(d.audioBase64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const blob = new Blob([arr], { type: d.audioMime });
        recordedBlobRef.current = blob;
        setRecordedUrl(URL.createObjectURL(blob));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const saveDraft = async () => {
    let audioBase64: string | undefined;
    let audioMime: string | undefined;
    if (recordedBlobRef.current) {
      try {
        audioBase64 = await blobToBase64(recordedBlobRef.current);
        audioMime = recordedBlobRef.current.type || "audio/webm";
      } catch { /* drop audio if too big */ }
    }
    const draft: CallDraft = {
      recipientName,
      countryCode,
      localPhone,
      occasion,
      sendMode,
      date: date?.toISOString(),
      time,
      mode,
      ttsText,
      voice,
      audioBase64,
      audioMime,
    };
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Likely quota exceeded from audio — retry without audio
      const { audioBase64: _a, audioMime: _m, ...slim } = draft;
      try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(slim)); } catch { /* ignore */ }
    }
  };

  // After returning from Whop with credits, auto-submit if the user had clicked "Place call".
  useEffect(() => {
    if (entLoading) return;
    if (credits <= 0) return;
    if (sessionStorage.getItem(AUTO_SUBMIT_KEY) !== "1") return;
    sessionStorage.removeItem(AUTO_SUBMIT_KEY);
    // Small delay so restored state is committed
    const t = setTimeout(() => { void handleSchedule(); }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entLoading, credits]);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recordedBlobRef.current = blob;
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      toast({
        title: "Microphone unavailable",
        description: "Please allow microphone access to record your voice.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleBuy = (label: string) => {
    toast({
      title: "Coming soon ✨",
      description: `${label} will be available once we launch the calling network.`,
    });
  };

  const handleSchedule = async () => {
    const cleanLocal = sanitizeLocalNumber(localPhone);
    if (!recipientName.trim() || !cleanLocal) {
      toast({
        title: "Almost there",
        description: "Please add the recipient name and phone number.",
        variant: "destructive",
      });
      return;
    }
    if (sendMode === "later" && !date) {
      toast({
        title: "Pick a date",
        description: "Choose when to ring — or switch to 'Send now'.",
        variant: "destructive",
      });
      return;
    }
    if (cleanLocal.length < 6) {
      toast({
        title: "Phone too short",
        description: "Enter a valid local phone number (we auto-strip leading 0 and spaces).",
        variant: "destructive",
      });
      return;
    }
    if (mode === "voice" && !recordedBlobRef.current) {
      toast({ title: "Record a message first", variant: "destructive" });
      return;
    }
    if (mode === "tts" && !ttsText.trim()) {
      toast({ title: "Type a message first", variant: "destructive" });
      return;
    }
    const user = getCurrentUser();
    if (!user?.email) {
      toast({
        title: "Please sign in",
        description: "Sign in with the email you used at checkout to place a call.",
        variant: "destructive",
      });
      return;
    }

    // Atomically deduct a paid credit on the server. If none available, send to $1 checkout.
    const consumed = await consumeCallCredit(user.email);
    if (!consumed) {
      toast({
        title: "No call credits left",
        description: "Saving your message and sending you to add an extra call for $1…",
      });
      await saveDraft();
      sessionStorage.setItem(AUTO_SUBMIT_KEY, "1");
      window.location.href = buildWhopCheckoutUrl(WHOP_EXTRA_CALL_CHECKOUT, {
        email: user.email,
        redirectTo: `${window.location.origin}/payment-status?product=call`,
      });
      return;
    }

    // Compose scheduled datetime from date + time, interpreted in the RECIPIENT's timezone
    // (so "9:00 AM on June 5" means 9 AM where the call lands, regardless of sender's tz).
    let when: Date | undefined;
    let isFuture = false;
    if (sendMode === "later" && date) {
      const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
      when = zonedWallTimeToUtc(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        hh || 0,
        mm || 0,
        country.tz,
      );
      isFuture = when.getTime() - Date.now() > 60 * 1000;
    }

    setPlacing(true);
    try {
      const e164 = buildE164(country.dial, localPhone);
      const body: Record<string, unknown> = {
        number: e164,
        recipientName: recipientName.trim(),
        occasion,
      };
      if (isFuture && when) body.scheduledAt = when.toISOString();


      if (mode === "voice" && recordedBlobRef.current) {
        body.audioBase64 = await blobToBase64(recordedBlobRef.current);
        body.audioMime = recordedBlobRef.current.type || "audio/webm";
        body.audioName = "message.webm";
      } else {
        body.text = ttsText.trim();
        body.voice = voice; // "female" | "male"
      }

      const { data, error } = await supabase.functions.invoke("place-call", { body });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data && (data as { error: unknown }).error) {
        throw new Error(String((data as { error: unknown }).error));
      }

      await refreshEntitlement();
      setSuccessInfo({ scheduled: isFuture, when: isFuture ? when : undefined });
      setSuccess(true);
    } catch (err) {
      toast({
        title: "Couldn't place the call",
        description: (err as Error).message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(350_100%_97%)] to-background">
        <Header />
        <FloatingHearts count={8} />
        <div className="min-h-screen flex items-center justify-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-3xl p-10 text-center border border-primary/10"
            style={{ boxShadow: "0 20px 60px hsl(340 60% 80% / 0.25)" }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              {successInfo?.scheduled ? "Call scheduled ✨" : "Call placed ✨"}
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {successInfo?.scheduled
                ? `We'll ring ${recipientName} on ${successInfo.when && format(successInfo.when, "PPP")} at ${time}. They'll hear your ${mode === "voice" ? "voice message" : "personalized message"}.`
                : `Ringing ${recipientName} now with your ${mode === "voice" ? "voice message" : "personalized message"}.`}
            </p>
            <p className="font-body text-xs text-muted-foreground mb-6">
              {credits} call credit{credits === 1 ? "" : "s"} remaining — extra calls are $1 each
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setSuccess(false);
                  setRecipientName("");
                  setLocalPhone("");
                  setDate(undefined);
                  setRecordedUrl(null);
                  setTtsText("");
                }}
                className="rounded-full"
              >
                Schedule another
              </Button>
              <Link
                to="/"
                className="font-body text-sm text-muted-foreground hover:text-foreground"
              >
                Back to home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(350_100%_97%)] to-background">
      <Header />
      <FloatingHearts count={5} />

      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Schedule a <span className="text-primary italic">Reminder Call</span>
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            Never miss a birthday or anniversary again. Record your voice or type a message —
            we'll ring your loved one at the perfect moment.
          </p>
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-body text-xs font-semibold text-foreground">
              {entLoading
                ? "Checking your credits…"
                : credits > 0
                  ? `${credits} call credit${credits === 1 ? "" : "s"} available`
                  : hasLetterAccess
                    ? "No call credits left · $1 per extra call"
                    : "Buy a letter to unlock 2 free calls · or $1 per call"}
            </span>
          </div>

          {!entLoading && credits <= 0 && (
            <div className="mt-5 flex flex-col items-center gap-2">
              <Button
                size="lg"
                className="rounded-full gap-2 px-6 shadow-romantic"
                onClick={() => {
                  const user = getCurrentUser();
                  window.location.href = buildWhopCheckoutUrl(WHOP_EXTRA_CALL_CHECKOUT, {
                    email: user?.email,
                    redirectTo: `${window.location.origin}/payment-status?product=call`,
                  });
                }}
              >
                <Phone className="w-4 h-4" /> Buy call credit · $1
              </Button>
              <button
                onClick={refreshEntitlement}
                className="font-body text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Already paid? Re-check credits
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-primary/10 space-y-6"
          style={{ boxShadow: "0 20px 60px hsl(340 60% 80% / 0.18)" }}
        >
          {/* Recipient */}
          <div>
            <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
              Recipient name
            </label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Mom, Sarah, Best Friend…"
            />
          </div>

          {/* Phone with country code */}
          <div>
            <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
              Phone number
            </label>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue>
                    {country.name} (+{country.dial})
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {REGIONS.map((region) => (
                    <SelectGroup key={region}>
                      <SelectLabel>{region}</SelectLabel>
                      {COUNTRIES.filter((c) => c.region === region)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name} (+{c.dial})
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                placeholder={country.placeholder}
                type="tel"
                inputMode="tel"
              />
            </div>
            <p className="font-body text-[11px] text-muted-foreground mt-1.5">
              Don't include the country code. Leading 0, spaces, dashes and parentheses are removed
              automatically. We'll dial{" "}
              <span className="font-semibold text-foreground">
                {localPhone.trim()
                  ? buildE164(country.dial, localPhone)
                  : `+${country.dial}…`}
              </span>
            </p>
          </div>

          {/* Occasion */}
          <div>
            <label className="font-body text-xs font-semibold text-foreground mb-2 block">
              Occasion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {occasions.map((o) => {
                const Icon = o.icon;
                const active = occasion === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setOccasion(o.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                      active
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-body text-xs font-medium">{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* When to send */}
          <div>
            <label className="font-body text-xs font-semibold text-foreground mb-2 block">
              When to send
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSendMode("now")}
                className={cn(
                  "flex-1 py-2 rounded-xl font-body text-sm font-medium transition-all border",
                  sendMode === "now"
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                Send now
              </button>
              <button
                onClick={() => setSendMode("later")}
                className={cn(
                  "flex-1 py-2 rounded-xl font-body text-sm font-medium transition-all border",
                  sendMode === "later"
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                Schedule for later
              </button>
            </div>

            {sendMode === "later" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="font-body text-xs font-semibold text-foreground mb-1.5 block">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <p className="font-body text-[11px] text-muted-foreground mt-1.5">
                    Local to {country.name} ({tzOffsetLabel(country.tz)})
                  </p>
                </div>
              </div>
            )}
          </div>


          {/* Mode toggle */}
          <div>
            <label className="font-body text-xs font-semibold text-foreground mb-2 block">
              Message
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setMode("voice")}
                className={cn(
                  "flex-1 py-2 rounded-xl font-body text-sm font-medium transition-all border",
                  mode === "voice"
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                Record voice
              </button>
              <button
                onClick={() => setMode("tts")}
                className={cn(
                  "flex-1 py-2 rounded-xl font-body text-sm font-medium transition-all border",
                  mode === "tts"
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30",
                )}
              >
                Type message (TTS)
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "voice" ? (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-5 text-center"
                >
                  {!recording ? (
                    <Button
                      type="button"
                      onClick={startRecording}
                      variant="outline"
                      className="rounded-full"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {recordedUrl ? "Re-record" : "Start recording"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={stopRecording}
                      className="rounded-full"
                    >
                      <Square className="w-4 h-4 mr-2 fill-current" />
                      Stop recording
                    </Button>
                  )}
                  {recordedUrl && !recording && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 text-primary" />
                      <audio src={recordedUrl} controls className="max-w-full" />
                    </div>
                  )}
                  <p className="font-body text-xs text-muted-foreground mt-3">
                    Recorded only in your browser for this preview.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="tts"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  <Textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Happy birthday Mom! Just wanted to remind you how much you mean to me…"
                    rows={4}
                  />
                  <Select value={voice} onValueChange={(v) => setVoice(v as "female" | "male")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {ttsVoices.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={handleSchedule}
            disabled={placing}
            className="w-full rounded-full py-6 text-base font-display font-semibold"
          >
            <Phone className="w-4 h-4 mr-2" />
            {placing
              ? "Working…"
              : sendMode === "now"
                ? "Call now"
                : "Schedule call"}
          </Button>
          <p className="font-body text-[11px] text-muted-foreground text-center -mt-2">
            {sendMode === "now"
              ? "We'll ring your loved one immediately."
              : "We'll ring at the exact date & time you picked."}
          </p>
        </motion.div>

      </main>
    </div>
  );
};

export default ScheduleCall;
