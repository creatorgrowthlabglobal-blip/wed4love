import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Loader2,
  User, Palette, MapPin, Sparkles, Mail, Phone,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notify } from "@/lib/notify";

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

const STEPS = ["About You", "Your Wedding", "Design Vision"];

const CONTACT_EMAIL = "wed4loveglobal@gmail.com";
const CONTACT_WHATSAPP = "9779702238084";
const CONTACT_WHATSAPP_DISPLAY = "+977 9702238084";
const WHATSAPP_LINK = `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent("Hi Wed4Love! I just sent a Custom invitation inquiry.")}`;

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
}

const EMPTY: FormData = {
  yourName: "", partnerName: "", email: "", phone: "",
  weddingDate: "", venue: "", guestCount: "", inviteDeadline: "",
  designStyle: "", colorPalette: "", vibe: "", specialElements: "",
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
  return null;
}

function buildMessage(f: FormData): string {
  const styleName = STYLES.find(s => s.id === f.designStyle)?.label ?? f.designStyle;
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

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
`.trim();
}

function buildTelegramData(f: FormData) {
  const styleName = STYLES.find(s => s.id === f.designStyle)?.label ?? f.designStyle;
  return {
    couple: `${f.yourName} & ${f.partnerName}`,
    email: f.email,
    phone: f.phone,
    wedding_date: f.weddingDate,
    venue: f.venue,
    guest_count: f.guestCount,
    invite_deadline: f.inviteDeadline,
    style: styleName,
    color_palette: f.colorPalette,
    vibe: f.vibe,
    special_elements: f.specialElements || "—",
  };
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
    const err = validateStep(2, form);
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

      notify("custom_inquiry", buildTelegramData(form));

      setDone(true);
    } catch (err: any) {
      toast({
        title: "Couldn't send your inquiry",
        description: err?.message ?? `Please try again or email ${CONTACT_EMAIL} directly.`,
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
          className="text-center max-w-md w-full"
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: GOLD_GRAD, boxShadow: "0 8px 30px hsl(38 80% 55% / 0.35)" }}>
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Inquiry received!</h2>
          <p className="font-body text-sm text-muted-foreground mb-2">
            Thank you, <span className="font-semibold text-foreground">{form.yourName}</span>. Our creator will
            personally review your details and reach out within <strong>24 hours</strong>.
          </p>
          <p className="font-body text-xs text-muted-foreground mb-6">
            A copy has been sent to <span className="font-medium">{form.email}</span>.
          </p>

          <div
            className="rounded-2xl p-5 mb-6 text-left"
            style={{ background: "white", border: "1.5px solid hsl(38 28% 90%)", boxShadow: "0 4px 20px hsl(38 28% 55% / 0.08)" }}
          >
            <p className="font-body text-[11px] tracking-[0.24em] uppercase font-semibold mb-3 text-center" style={{ color: GOLD }}>
              Want to reach the creator directly?
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              style={{ background: "hsl(142 55% 96%)", border: "1.5px solid hsl(142 55% 82%)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(142 55% 42%)" }}>
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(142 40% 32%)" }}>
                  WhatsApp
                </p>
                <p className="font-body text-sm font-semibold text-foreground truncate">{CONTACT_WHATSAPP_DISPLAY}</p>
              </div>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Custom Invitation Inquiry follow-up")}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
              style={{ background: "hsl(38 60% 96%)", border: "1.5px solid hsl(38 50% 82%)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GRAD }}>
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[10px] font-semibold uppercase tracking-wider" style={{ color: "hsl(30 40% 32%)" }}>
                  Email
                </p>
                <p className="font-body text-sm font-semibold text-foreground truncate">{CONTACT_EMAIL}</p>
              </div>
            </a>
          </div>

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
  ];

  const stepIcons = [User, MapPin, Palette];
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
