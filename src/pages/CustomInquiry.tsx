import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2,
  User, Heart, Calendar, Clock, Palette, Phone, Mail,
  MapPin, Users, Sparkles, MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";
const BG = "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))";

const STYLES = [
  { id: "romantic", label: "Romantic & Floral", emoji: "🌸" },
  { id: "modern-luxe", label: "Modern Luxe", emoji: "✨" },
  { id: "rustic-boho", label: "Rustic / Boho", emoji: "🌿" },
  { id: "dark-moody", label: "Dark & Moody", emoji: "🕯️" },
  { id: "minimal", label: "Minimal & Clean", emoji: "◻️" },
  { id: "other", label: "Something Else", emoji: "🎨" },
];

const GUEST_OPTIONS = ["Under 50", "50–100", "100–200", "200–300", "300+"];

const PLATFORMS = [
  { id: "google-meet", label: "Google Meet", icon: "🎥" },
  { id: "zoom", label: "Zoom", icon: "💻" },
  { id: "whatsapp", label: "WhatsApp Call", icon: "📱" },
  { id: "facebook", label: "Facebook Messenger", icon: "💬" },
  { id: "telegram", label: "Telegram", icon: "✈️" },
  { id: "other", label: "Other / No preference", icon: "🔗" },
];

const TIMEZONES = [
  "Asia/Manila", "Asia/Singapore", "Asia/Kuala_Lumpur", "Asia/Jakarta",
  "Asia/Bangkok", "Asia/Tokyo", "Asia/Seoul", "Asia/Kolkata",
  "Asia/Dubai", "Asia/Karachi", "Asia/Dhaka",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Africa/Nairobi", "Africa/Lagos", "Africa/Johannesburg",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Sao_Paulo", "America/Mexico_City",
  "Pacific/Auckland", "Australia/Sydney", "Australia/Melbourne",
];

const STEPS = ["About You", "Your Wedding", "Design Vision", "Schedule a Call"];

interface FormData {
  // Step 1
  yourName: string;
  partnerName: string;
  email: string;
  phone: string;
  // Step 2
  weddingDate: string;
  venue: string;
  guestCount: string;
  inviteDeadline: string;
  // Step 3
  designStyle: string;
  colorPalette: string;
  vibe: string;
  specialElements: string;
  // Step 4
  slot1Date: string;
  slot1Time: string;
  slot2Date: string;
  slot2Time: string;
  slot3Date: string;
  slot3Time: string;
  timezone: string;
  callPlatform: string;
}

const EMPTY: FormData = {
  yourName: "", partnerName: "", email: "", phone: "",
  weddingDate: "", venue: "", guestCount: "", inviteDeadline: "",
  designStyle: "", colorPalette: "", vibe: "", specialElements: "",
  slot1Date: "", slot1Time: "", slot2Date: "", slot2Time: "",
  slot3Date: "", slot3Time: "", timezone: "Asia/Manila", callPlatform: "",
};

const inputCls =
  "w-full rounded-xl px-4 py-3 font-body text-sm bg-white border border-[hsl(38_28%_88%)] focus:outline-none focus:ring-2 focus:ring-[hsl(38_72%_60%/0.35)] focus:border-[hsl(38_72%_60%)] transition placeholder:text-muted-foreground/50 text-foreground";

const labelCls = "block font-body text-xs font-semibold mb-1.5 text-foreground/70 uppercase tracking-wide";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-body text-xs font-bold transition-all duration-300"
              style={
                i < current
                  ? { background: GOLD_GRAD, color: "white" }
                  : i === current
                  ? { background: GOLD_GRAD, color: "white", boxShadow: `0 0 0 3px hsl(38 72% 80%)` }
                  : { background: "hsl(38 28% 92%)", color: "hsl(38 28% 55%)" }
              }
            >
              {i < current ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className="font-body text-[9px] font-semibold hidden sm:block tracking-wide"
              style={{ color: i === current ? GOLD : "hsl(38 20% 60%)" }}
            >
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="w-8 sm:w-14 h-0.5 mb-3 rounded-full transition-all duration-300"
              style={{ background: i < current ? GOLD : "hsl(38 28% 88%)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const Step1 = ({ f, set }: { f: FormData; set: (k: keyof FormData, v: string) => void }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Field label="Your full name">
      <input className={inputCls} placeholder="e.g. Maria Santos" value={f.yourName}
        onChange={e => set("yourName", e.target.value)} />
    </Field>
    <Field label="Partner's full name">
      <input className={inputCls} placeholder="e.g. Juan dela Cruz" value={f.partnerName}
        onChange={e => set("partnerName", e.target.value)} />
    </Field>
    <Field label="Your email">
      <input className={inputCls} type="email" placeholder="you@example.com" value={f.email}
        onChange={e => set("email", e.target.value)} />
    </Field>
    <Field label="Phone / WhatsApp">
      <input className={inputCls} type="tel" placeholder="+63 912 345 6789" value={f.phone}
        onChange={e => set("phone", e.target.value)} />
    </Field>
  </div>
);

const Step2 = ({ f, set }: { f: FormData; set: (k: keyof FormData, v: string) => void }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Field label="Wedding date">
      <input className={inputCls} type="date" value={f.weddingDate}
        onChange={e => set("weddingDate", e.target.value)} />
    </Field>
    <Field label="Invitation deadline">
      <input className={inputCls} type="date" value={f.inviteDeadline}
        onChange={e => set("inviteDeadline", e.target.value)} />
    </Field>
    <Field label="Venue name & location">
      <input className={inputCls} placeholder="e.g. The Ruins, Bacolod City" value={f.venue}
        onChange={e => set("venue", e.target.value)} />
    </Field>
    <Field label="Expected guest count">
      <select className={inputCls} value={f.guestCount} onChange={e => set("guestCount", e.target.value)}>
        <option value="">Select range…</option>
        {GUEST_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  </div>
);

const Step3 = ({ f, set }: { f: FormData; set: (k: keyof FormData, v: string) => void }) => (
  <div className="flex flex-col gap-5">
    <Field label="Design style">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
        {STYLES.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => set("designStyle", s.id)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-body text-xs font-semibold border transition-all"
            style={
              f.designStyle === s.id
                ? { background: "hsl(38 72% 96%)", border: `1.5px solid ${GOLD}`, color: GOLD }
                : { background: "white", border: "1.5px solid hsl(38 28% 88%)", color: "hsl(30 18% 32%)" }
            }
          >
            <span>{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>
    </Field>

    <Field label="Preferred color palette">
      <input className={inputCls} placeholder="e.g. Ivory, blush pink, sage green and gold"
        value={f.colorPalette} onChange={e => set("colorPalette", e.target.value)} />
    </Field>

    <Field label="Describe the vibe / mood you want">
      <textarea
        className={`${inputCls} resize-none`} rows={3}
        placeholder="e.g. Dreamy and romantic, like an old-world garden party at dusk…"
        value={f.vibe} onChange={e => set("vibe", e.target.value)}
      />
    </Field>

    <Field label="Special elements to include (optional)">
      <textarea
        className={`${inputCls} resize-none`} rows={2}
        placeholder="e.g. Our engagement photo, a specific song, a quote from our vows…"
        value={f.specialElements} onChange={e => set("specialElements", e.target.value)}
      />
    </Field>
  </div>
);

const Step4 = ({ f, set }: { f: FormData; set: (k: keyof FormData, v: string) => void }) => (
  <div className="flex flex-col gap-5">
    <p className="font-body text-xs text-muted-foreground -mt-1">
      Give us 2–3 windows when you're free. We'll confirm one within 24 hours.
    </p>

    {([
      ["slot1Date", "slot1Time", "Preferred slot 1"],
      ["slot2Date", "slot2Time", "Preferred slot 2"],
      ["slot3Date", "slot3Time", "Preferred slot 3 (optional)"],
    ] as [keyof FormData, keyof FormData, string][]).map(([dk, tk, label]) => (
      <div key={dk}>
        <label className={labelCls}>{label}</label>
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} type="date" min={new Date().toISOString().split("T")[0]} value={f[dk]} onChange={e => set(dk, e.target.value)} />
          <input className={inputCls} type="time" value={f[tk]} onChange={e => set(tk, e.target.value)} />
        </div>
      </div>
    ))}

    <Field label="Your timezone">
      <select className={inputCls} value={f.timezone} onChange={e => set("timezone", e.target.value)}>
        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
      </select>
    </Field>

    <Field label="Preferred call platform">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => set("callPlatform", p.id)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-body text-xs font-semibold border transition-all"
            style={
              f.callPlatform === p.id
                ? { background: "hsl(38 72% 96%)", border: `1.5px solid ${GOLD}`, color: GOLD }
                : { background: "white", border: "1.5px solid hsl(38 28% 88%)", color: "hsl(30 18% 32%)" }
            }
          >
            <span>{p.icon}</span> {p.label}
          </button>
        ))}
      </div>
    </Field>
  </div>
);

function validateStep(step: number, f: FormData): string | null {
  if (step === 0) {
    if (!f.yourName.trim()) return "Please enter your name.";
    if (!f.partnerName.trim()) return "Please enter your partner's name.";
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return "Please enter a valid email.";
    if (!f.phone.trim()) return "Please enter your phone number.";
  }
  if (step === 1) {
    if (!f.weddingDate) return "Please enter your wedding date.";
    if (!f.inviteDeadline) return "Please enter your invitation deadline.";
    if (!f.venue.trim()) return "Please enter your venue.";
    if (!f.guestCount) return "Please select your expected guest count.";
  }
  if (step === 2) {
    if (!f.designStyle) return "Please pick a design style.";
    if (!f.colorPalette.trim()) return "Please describe your preferred colors.";
    if (!f.vibe.trim()) return "Please describe the vibe you're going for.";
  }
  if (step === 3) {
    if (!f.slot1Date || !f.slot1Time) return "Please provide at least your first preferred time slot.";
    if (new Date(`${f.slot1Date}T${f.slot1Time}`) <= new Date()) return "Your first slot must be a future date and time.";
    if (!f.slot2Date || !f.slot2Time) return "Please provide a second preferred time slot.";
    if (new Date(`${f.slot2Date}T${f.slot2Time}`) <= new Date()) return "Your second slot must be a future date and time.";
    if (!f.callPlatform) return "Please select your preferred call platform.";
  }
  return null;
}

function buildMessage(f: FormData): string {
  const styleName = STYLES.find(s => s.id === f.designStyle)?.label ?? f.designStyle;
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
  const slot = (d: string, t: string) => d && t ? `${fmt(d)} at ${t} (${f.timezone})` : "—";

  return `
CUSTOM INVITATION INQUIRY
=========================

— About the Couple —
Name: ${f.yourName} & ${f.partnerName}
Email: ${f.email}
Phone / WhatsApp: ${f.phone}

— Wedding Details —
Wedding date: ${fmt(f.weddingDate)}
Venue: ${f.venue}
Guest count: ${f.guestCount}
Invitation needed by: ${fmt(f.inviteDeadline)}

— Design Vision —
Style: ${styleName}
Color palette: ${f.colorPalette}
Vibe / mood: ${f.vibe}
Special elements: ${f.specialElements || "None specified"}

— Availability for Design Call —
Preferred platform: ${PLATFORMS.find(p => p.id === f.callPlatform)?.label ?? f.callPlatform}
Slot 1: ${slot(f.slot1Date, f.slot1Time)}
Slot 2: ${slot(f.slot2Date, f.slot2Time)}
Slot 3: ${slot(f.slot3Date, f.slot3Time)}
`.trim();
}

const CustomInquiry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ ...EMPTY, email: user?.email ?? "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const set = (k: keyof FormData, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const next = () => {
    const err = validateStep(step, form);
    if (err) { toast({ title: "Missing info", description: err, variant: "destructive" }); return; }
    setDirection(1);
    setStep(s => s + 1);
  };

  const back = () => { setDirection(-1); setStep(s => s - 1); };

  const submit = async () => {
    const err = validateStep(3, form);
    if (err) { toast({ title: "Missing info", description: err, variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-message", {
        body: {
          name: `${form.yourName} & ${form.partnerName}`,
          email: form.email,
          subject: `Custom Invitation Inquiry — ${form.yourName} & ${form.partnerName}`,
          message: buildMessage(form),
        },
      });
      if (error) throw error;
      setDone(true);
    } catch (err: any) {
      toast({
        title: "Couldn't send your inquiry",
        description: err?.message ?? "Please try again or email hello@wed4love.com directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: BG }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: GOLD_GRAD, boxShadow: "0 8px 30px hsl(38 80% 55% / 0.35)" }}>
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Inquiry received!</h2>
          <p className="font-body text-sm text-muted-foreground mb-2">
            Thank you, <span className="font-semibold text-foreground">{form.yourName}</span>. We'll review your details
            and confirm one of your call slots within <strong>24 hours</strong>.
          </p>
          <p className="font-body text-xs text-muted-foreground mb-8">
            A copy has been sent to <span className="font-medium">{form.email}</span>.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-2xl font-body text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: GOLD_GRAD }}
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const stepContent = [
    <Step1 key="s1" f={form} set={set} />,
    <Step2 key="s2" f={form} set={set} />,
    <Step3 key="s3" f={form} set={set} />,
    <Step4 key="s4" f={form} set={set} />,
  ];

  const stepIcons = [User, MapPin, Palette, Calendar];
  const StepIcon = stepIcons[step];

  return (
    <div className="min-h-screen px-4 py-16 sm:py-20" style={{ background: BG }}>
      <button
        onClick={() => (step === 0 ? navigate(-1) : back())}
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: GOLD_GRAD, boxShadow: "0 6px 20px hsl(38 80% 55% / 0.3)" }}>
            <StepIcon className="w-5 h-5 text-white" />
          </div>
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-2" style={{ color: GOLD }}>
            Custom Plan · $399
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {STEPS[step]}
          </h1>
          <p className="font-body text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
        </motion.div>

        <StepIndicator current={step} />

        {/* Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 mb-6"
          style={{
            background: "white",
            border: "1.5px solid hsl(38 28% 90%)",
            boxShadow: "0 8px 40px hsl(38 28% 55% / 0.10)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="flex-1 py-3 rounded-2xl font-body text-sm font-semibold border transition-all hover:scale-[1.01] active:scale-[0.97]"
              style={{ background: "white", color: GOLD, border: `2px solid ${GOLD}` }}
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="flex-1 py-3 rounded-2xl font-body text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.97]"
              style={{ background: GOLD_GRAD, boxShadow: "0 6px 20px hsl(38 80% 55% / 0.28)" }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl font-body text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: GOLD_GRAD, boxShadow: "0 6px 20px hsl(38 80% 55% / 0.28)" }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <>Send Inquiry <Sparkles className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomInquiry;
