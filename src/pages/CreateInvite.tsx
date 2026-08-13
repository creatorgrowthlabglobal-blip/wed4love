import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import ProgressBar from "@/components/invite/ProgressBar";
import { MUSIC_PRESETS } from "@/lib/musicPresets";
import VenueMapPicker from "@/components/invite/VenueMapPicker";
import type { MusicPreset } from "@/lib/musicPresets";
import { saveInviteLocal, saveDraftLocal, clearDraftLocal, loadDraftLocal, formatDisplayDate, formatDisplayTime } from "@/lib/inviteStorage";
import type { StoredInvite } from "@/lib/inviteStorage";
import { useAuth } from "@/hooks/useAuth";
import { useInviteEntitlement } from "@/hooks/useInviteEntitlement";
import { notify } from "@/lib/notify";

const CHECKOUT_URL = "https://whop.com/checkout/plan_FsfUSAeOIoKZt";

// ── Palette ────────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 7;
const GOLD   = "hsl(28 62% 50%)";
const GOLD_L = "hsl(28 52% 68%)";

// ── Per-template theme colors ─────────────────────────────────────────────────
const THEMES: Record<string, { gold: string; goldL: string; goldGrad: string; glow: string }> = {
  "garden-rose":   { gold: "hsl(340 58% 52%)", goldL: "hsl(340 50% 70%)", goldGrad: "hsl(340 66% 62%)", glow: "hsl(340 58% 52% / 0.24)" },
  "rustic-bloom":  { gold: "hsl(15 48% 42%)",  goldL: "hsl(15 38% 58%)",  goldGrad: "hsl(20 52% 50%)",  glow: "hsl(15 48% 42% / 0.24)"  },
  "midnight-luxe": { gold: "hsl(45 72% 48%)",  goldL: "hsl(45 60% 64%)",  goldGrad: "hsl(45 78% 56%)",  glow: "hsl(45 72% 48% / 0.24)"  },
  "golden-hour":   { gold: "hsl(38 80% 46%)",  goldL: "hsl(38 68% 62%)",  goldGrad: "hsl(38 84% 54%)",  glow: "hsl(38 80% 46% / 0.24)"  },
  "blush-romance": { gold: "hsl(335 58% 52%)", goldL: "hsl(335 50% 70%)", goldGrad: "hsl(335 64% 62%)", glow: "hsl(335 58% 52% / 0.24)" },
};
const DEFAULT_THEME = { gold: GOLD, goldL: GOLD_L, goldGrad: "hsl(38 76% 56%)", glow: "hsl(28 76% 54% / 0.22)" };
const DARK   = "hsl(24 22% 16%)";
const MID    = "hsl(24 12% 42%)";
const LIGHT  = "hsl(24 8% 60%)";
const LINE   = "hsl(36 28% 80%)";
const BG     = "radial-gradient(ellipse 130% 80% at 15% -10%, hsl(340 48% 95%) 0%, hsl(44 36% 95%) 50%, hsl(38 40% 93%) 100%)";

// ── Input styles ──────────────────────────────────────────────────────────────
const labelSt: React.CSSProperties = {
  fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em",
  textTransform: "uppercase", color: MID, display: "block", marginBottom: 6,
};

const lineInput: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "0.95rem", fontFamily: "inherit",
  background: "rgba(255,255,255,0.88)",
  color: DARK, outline: "none", borderRadius: 10,
  border: `1.5px solid hsl(36 28% 72%)`,
  transition: "border-color 0.18s, background 0.18s",
  colorScheme: "light",
};

const boxArea: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "0.92rem", fontFamily: "inherit",
  background: "rgba(255,255,255,0.88)",
  color: DARK, outline: "none", borderRadius: 10, resize: "none",
  border: `1.5px solid hsl(36 28% 72%)`,
  transition: "border-color 0.18s, background 0.18s",
};

const onLineF = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "var(--tg)";
  e.currentTarget.style.background = "rgba(255,255,255,1)";
};
const onLineB = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "hsl(36 28% 72%)";
  e.currentTarget.style.background = "rgba(255,255,255,0.88)";
};
const onBoxF = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "var(--tg)";
  e.currentTarget.style.background = "rgba(255,255,255,1)";
};
const onBoxB = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "hsl(36 28% 72%)";
  e.currentTarget.style.background = "rgba(255,255,255,0.88)";
};

// ── Field components ───────────────────────────────────────────────────────────
interface FP extends React.InputHTMLAttributes<HTMLInputElement> { label: string; hint?: string }
const F = ({ label, hint, style, ...rest }: FP) => (
  <div>
    <label className="font-body" style={labelSt}>{label}</label>
    {hint && <p className="font-body" style={{ fontSize: "0.62rem", color: LIGHT, marginBottom: 6 }}>{hint}</p>}
    <input className="font-body" style={{ ...lineInput, ...style }} onFocus={onLineF} onBlur={onLineB} {...rest} />
  </div>
);

interface TAP extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; hint?: string }
const TA = ({ label, hint, ...rest }: TAP) => (
  <div>
    <label className="font-body" style={labelSt}>{label}</label>
    {hint && <p className="font-body" style={{ fontSize: "0.62rem", color: LIGHT, marginBottom: 6 }}>{hint}</p>}
    <textarea className="font-body" rows={3} style={boxArea} onFocus={onBoxF} onBlur={onBoxB} {...rest} />
  </div>
);

// ── Divider ────────────────────────────────────────────────────────────────────
const Divider = () => (
  <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${LINE}, transparent)` }} />
);

// ── Section label ─────────────────────────────────────────────────────────────
const Section = ({ icon, title }: { icon: string; title: string }) => (
  <div className="flex items-center gap-2 mb-5">
    <span style={{ fontSize: 16 }}>{icon}</span>
    <p className="font-body font-semibold text-sm" style={{ color: MID }}>{title}</p>
    <div className="flex-1 h-px ml-1" style={{ background: LINE }} />
  </div>
);

// ── Entry card ────────────────────────────────────────────────────────────────
const EntryCard = ({ index, label, onRemove, showRemove, children }: {
  index: number; label: string; onRemove: () => void; showRemove: boolean; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-4 pt-4"
    style={{ borderTop: `1px solid hsl(36 28% 82%)` }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0"
          style={{ background: "var(--tg)", color: "white", fontSize: 10 }}>{index + 1}</div>
        <span className="font-body text-xs font-semibold" style={{ color: MID }}>{label}</span>
      </div>
      {showRemove && (
        <button onClick={onRemove}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
          style={{ color: "hsl(0 52% 60%)" }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    {children}
  </div>
);

// ── Add button ────────────────────────────────────────────────────────────────
const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick}
    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-body text-sm font-semibold transition-opacity hover:opacity-70"
    style={{ border: "1.5px dashed var(--tgl)", color: "var(--tg)", background: "transparent" }}>
    <Plus className="w-4 h-4" /> {label}
  </button>
);

// ── Form state ────────────────────────────────────────────────────────────────
interface FormState {
  partner1: string; partner2: string; hashtag: string; email: string; phone: string;
  dateISO: string; timeRaw: string; rsvpISO: string;
  venueName: string; venueAddress: string; venueCity: string;
  venueLat: number | null; venueLng: number | null;
  story: { year: string; title: string; desc: string }[];
  schedule: { time: string; event: string; desc: string }[];
  dresscode: string; dresscodeNote: string; menuNote: string;
  transportCar: string; transportTrain: string; transportPlane: string;
  hotels: { name: string; stars: number; distance: string; note: string }[];
  selectedMusic: string | null;
}

const DEFAULT: FormState = {
  partner1: "", partner2: "", hashtag: "", email: "", phone: "",
  dateISO: "", timeRaw: "16:30", rsvpISO: "",
  venueName: "", venueAddress: "", venueCity: "", venueLat: null, venueLng: null,
  story: [{ year: "", title: "", desc: "" }, { year: "", title: "", desc: "" }],
  schedule: [
    { time: "16:30", event: "Guest Arrival",  desc: "Welcome and reception" },
    { time: "17:00", event: "Ceremony",        desc: "" },
    { time: "18:00", event: "Cocktail",        desc: "Drinks and canapés" },
    { time: "20:00", event: "Dinner",          desc: "Wedding banquet" },
  ],
  dresscode: "", dresscodeNote: "", menuNote: "",
  transportCar: "", transportTrain: "", transportPlane: "",
  hotels: [{ name: "", stars: 4, distance: "", note: "" }],
  selectedMusic: null,
};

type SP = { form: FormState; set: (k: keyof FormState, v: FormState[keyof FormState]) => void };

const autoHashtag = (p1: string, p2: string) =>
  p1 && p2
    ? `#${p1.replace(/\s+/g,"").replace(/[^a-zA-Z0-9]/g,"")}And${p2.replace(/\s+/g,"").replace(/[^a-zA-Z0-9]/g,"")}${new Date().getFullYear()}`
    : "";

// ── Step 1: Couple ─────────────────────────────────────────────────────────────
const StepCouple = ({ form, set }: SP) => (
  <div className="flex flex-col gap-7">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <F label="Partner 1 — First Name" placeholder="Alexander" value={form.partner1}
        onChange={e => {
          set("partner1", e.target.value);
          if (!form.hashtag || form.hashtag === autoHashtag(form.partner1, form.partner2))
            set("hashtag", autoHashtag(e.target.value, form.partner2));
        }} />
      <F label="Partner 2 — First Name" placeholder="Diana" value={form.partner2}
        onChange={e => {
          set("partner2", e.target.value);
          if (!form.hashtag || form.hashtag === autoHashtag(form.partner1, form.partner2))
            set("hashtag", autoHashtag(form.partner1, e.target.value));
        }} />
    </div>
    <F label="Wedding Hashtag" placeholder="#AlexAndDiana2026" value={form.hashtag}
      hint="Auto-generated from names — feel free to customise"
      onChange={e => set("hashtag", e.target.value)} />
    <Divider />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <F label="Contact Email" type="email" placeholder="wedding@example.com" value={form.email}
        onChange={e => set("email", e.target.value)} />
      <F label="Contact Phone" type="tel" placeholder="+1 (234) 567-890" value={form.phone}
        onChange={e => set("phone", e.target.value)} />
    </div>
  </div>
);

// ── Step 2: Big Day ────────────────────────────────────────────────────────────
const StepBigDay = ({ form, set, theme }: SP & { theme: typeof DEFAULT_THEME }) => (
  <div className="flex flex-col gap-7">
    <div className="grid grid-cols-2 gap-6">
      <F label="Wedding Date" type="date" value={form.dateISO}
        onChange={e => set("dateISO", e.target.value)} />
      <F label="Ceremony Time" type="time" value={form.timeRaw}
        onChange={e => set("timeRaw", e.target.value)} />
    </div>
    <F label="RSVP Deadline" type="date" value={form.rsvpISO}
      hint="The date guests must reply by"
      onChange={e => set("rsvpISO", e.target.value)} />
    <Divider />
    <VenueMapPicker
      venueName={form.venueName}
      venueAddress={form.venueAddress}
      venueCity={form.venueCity}
      venueLat={form.venueLat}
      venueLng={form.venueLng}
      accentColor={theme.gold}
      onChange={patch => {
        if (patch.venueName   !== undefined) set("venueName",   patch.venueName!);
        if (patch.venueAddress !== undefined) set("venueAddress", patch.venueAddress!);
        if (patch.venueCity   !== undefined) set("venueCity",   patch.venueCity!);
        if (patch.venueLat    !== undefined) set("venueLat",    patch.venueLat!);
        if (patch.venueLng    !== undefined) set("venueLng",    patch.venueLng!);
      }}
    />
  </div>
);

// ── Step 3: Story ──────────────────────────────────────────────────────────────
const StepStory = ({ form, set }: SP) => {
  const update = (i: number, field: string, val: string) => {
    const arr = [...form.story]; arr[i] = { ...arr[i], [field]: val }; set("story", arr);
  };
  return (
    <div className="flex flex-col gap-5">
      <p className="font-body text-sm" style={{ color: MID }}>
        Share up to 4 milestones — the moments that shaped your love story.
      </p>
      {form.story.map((entry, i) => (
        <EntryCard key={i} index={i} label="Milestone" showRemove={form.story.length > 1}
          onRemove={() => set("story", form.story.filter((_, idx) => idx !== i))}>
          <div className="grid grid-cols-3 gap-4">
            <F label="Year" type="number" placeholder="2020" value={entry.year}
              onChange={e => update(i, "year", e.target.value)} />
            <div className="col-span-2">
              <F label="Title" placeholder="Our First Meeting" value={entry.title}
                onChange={e => update(i, "title", e.target.value)} />
            </div>
          </div>
          <TA label="What happened" placeholder="Tell the story of this moment..." rows={2}
            value={entry.desc} onChange={e => update(i, "desc", e.target.value)} />
        </EntryCard>
      ))}
      {form.story.length < 4 && (
        <AddBtn onClick={() => set("story", [...form.story, { year: "", title: "", desc: "" }])}
          label="Add Another Milestone" />
      )}
    </div>
  );
};

// ── Step 4: Program ────────────────────────────────────────────────────────────
const StepProgram = ({ form, set }: SP) => {
  const update = (i: number, field: string, val: string) => {
    const arr = [...form.schedule]; arr[i] = { ...arr[i], [field]: val }; set("schedule", arr);
  };
  return (
    <div className="flex flex-col gap-5">
      <p className="font-body text-sm" style={{ color: MID }}>
        Walk your guests through the day — up to 8 events.
      </p>
      {form.schedule.map((item, i) => (
        <EntryCard key={i} index={i} label="Event" showRemove={form.schedule.length > 1}
          onRemove={() => set("schedule", form.schedule.filter((_, idx) => idx !== i))}>
          <div className="grid grid-cols-3 gap-4">
            <F label="Time" type="time" value={item.time} onChange={e => update(i, "time", e.target.value)} />
            <div className="col-span-2">
              <F label="Event Name" placeholder="Ceremony" value={item.event}
                onChange={e => update(i, "event", e.target.value)} />
            </div>
          </div>
          <F label="Short description (optional)" placeholder="e.g. Civil wedding ceremony"
            value={item.desc} onChange={e => update(i, "desc", e.target.value)} />
        </EntryCard>
      ))}
      {form.schedule.length < 8 && (
        <AddBtn onClick={() => set("schedule", [...form.schedule, { time: "", event: "", desc: "" }])}
          label="Add Event" />
      )}
    </div>
  );
};

// ── Step 5: Details ────────────────────────────────────────────────────────────
const StepDetails = ({ form, set }: SP) => {
  const updateHotel = (i: number, field: string, val: string | number) => {
    const arr = [...form.hotels]; arr[i] = { ...arr[i], [field]: val }; set("hotels", arr);
  };
  return (
    <div className="flex flex-col gap-10">
      <div>
        <Section icon="👗" title="Dress Code" />
        <div className="flex flex-col gap-6">
          <F label="Dress Code" placeholder="e.g. Black Tie Optional" value={form.dresscode}
            onChange={e => set("dresscode", e.target.value)} />
          <TA label="Additional note (optional)" placeholder="We kindly ask guests to dress elegantly..."
            rows={2} value={form.dresscodeNote} onChange={e => set("dresscodeNote", e.target.value)} />
        </div>
      </div>
      <div>
        <Section icon="🍽️" title="Menu" />
        <TA label="Menu note" rows={3}
          placeholder="A 3-course dinner will be served. Please inform us of any dietary requirements when you RSVP."
          value={form.menuNote} onChange={e => set("menuNote", e.target.value)} />
      </div>
      <div>
        <Section icon="🚗" title="Getting There" />
        <div className="flex flex-col gap-5">
          <TA label="By Car" rows={2} placeholder="Free parking on site. 15 minutes from the city centre."
            value={form.transportCar} onChange={e => set("transportCar", e.target.value)} />
          <TA label="By Train / Metro" rows={2} placeholder="Take Line 7 to Opéra station, then a short taxi ride."
            value={form.transportTrain} onChange={e => set("transportTrain", e.target.value)} />
          <TA label="By Plane / Other" rows={2} placeholder="Airport is 45 minutes away. We recommend pre-booking a transfer."
            value={form.transportPlane} onChange={e => set("transportPlane", e.target.value)} />
        </div>
      </div>
      <div>
        <Section icon="🏨" title="Nearby Hotels" />
        <div className="flex flex-col gap-4">
          {form.hotels.map((hotel, i) => (
            <EntryCard key={i} index={i} label="Hotel" showRemove={form.hotels.length > 1}
              onRemove={() => set("hotels", form.hotels.filter((_, idx) => idx !== i))}>
              <F label="Hotel Name" placeholder="Hôtel Le Marais" value={hotel.name}
                onChange={e => updateHotel(i, "name", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <F label="Distance from Venue" placeholder="e.g. 500 m or 1.2 km" value={hotel.distance}
                  onChange={e => updateHotel(i, "distance", e.target.value)} />
                <div>
                  <label className="font-body" style={labelSt}>Stars</label>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => updateHotel(i, "stars", n)}
                        className="text-2xl leading-none select-none transition-transform hover:scale-110"
                        style={{ color: n <= hotel.stars ? "var(--tg)" : "hsl(38 22% 80%)" }}>★</button>
                    ))}
                  </div>
                </div>
              </div>
              <TA label="Note for guests (optional)" placeholder="Mention our wedding for a 15% discount..."
                rows={2} value={hotel.note} onChange={e => updateHotel(i, "note", e.target.value)} />
            </EntryCard>
          ))}
          {form.hotels.length < 3 && (
            <AddBtn onClick={() => set("hotels", [...form.hotels, { name: "", stars: 4, distance: "", note: "" }])}
              label="Add Hotel" />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Preparing screen ──────────────────────────────────────────────────────────
const PREP_STEPS = [
  { label: "Setting up your invitation",        duration: 5000 },
  { label: "Applying your theme & colours",     duration: 5000 },
  { label: "Adding your details & schedule",    duration: 5000 },
  { label: "Configuring your RSVP dashboard",   duration: 5000 },
  { label: "Securing your invite link",         duration: 5000 },
  { label: "Putting the finishing touches…",    duration: 5000 },
];
const PREP_TOTAL_MS = PREP_STEPS.reduce((s, x) => s + x.duration, 0); // 30 000

const PreparingScreen = ({ onDone, coupleName, templateName }: {
  onDone: () => void;
  coupleName: string;
  templateName: string;
}) => {
  const [elapsed, setElapsed]   = useState(0);
  const [stepIdx, setStepIdx]   = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const ms = Date.now() - startRef.current;
      setElapsed(ms);

      // advance step
      let acc = 0;
      for (let i = 0; i < PREP_STEPS.length; i++) {
        acc += PREP_STEPS[i].duration;
        if (ms < acc) { setStepIdx(i); break; }
      }

      if (ms >= PREP_TOTAL_MS) {
        clearInterval(id);
        onDone();
      }
    }, 80);
    return () => clearInterval(id);
  }, [onDone]);

  const progress = Math.min(elapsed / PREP_TOTAL_MS, 1);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(38 50% 96%) 50%, hsl(350 35% 97%))" }}
    >
      {/* Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(38 72% 60% / 0.10) 0%, transparent 65%)", transform: "translate(30%,-30%)" }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(340 50% 70% / 0.07) 0%, transparent 65%)", transform: "translate(-25%,25%)" }} />

      <div className="relative w-full max-w-sm text-center">

        {/* Spinning ring */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(38 45% 88%)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="hsl(38 72% 44%)" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress)}`}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-sm" style={{ color: "hsl(38 72% 44%)" }}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Eyebrow */}
        <p className="font-body text-[9px] tracking-[0.32em] uppercase font-semibold mb-3"
          style={{ color: "hsl(38 50% 54%)" }}>
          {coupleName ? `${coupleName} · ` : ""}{templateName}
        </p>

        {/* Current step */}
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="font-display font-bold mb-8"
            style={{ fontSize: "1.35rem", color: "hsl(30 20% 14%)" }}
          >
            {PREP_STEPS[stepIdx]?.label}
          </motion.p>
        </AnimatePresence>

        {/* Step checklist */}
        <ul className="flex flex-col gap-2.5 text-left">
          {PREP_STEPS.map((s, i) => {
            const done    = i < stepIdx;
            const current = i === stepIdx;
            return (
              <li key={s.label} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    background: done ? "hsl(38 72% 44%)" : current ? "hsl(38 60% 92%)" : "hsl(38 28% 90%)",
                    border: current ? "2px solid hsl(38 72% 60%)" : "2px solid transparent",
                  }}
                >
                  {done && <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>✓</span>}
                  {current && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "hsl(38 72% 44%)" }}
                    />
                  )}
                </div>
                <span
                  className="font-body text-xs transition-all duration-300"
                  style={{
                    color: done ? "hsl(30 16% 36%)" : current ? "hsl(30 20% 14%)" : "hsl(30 10% 68%)",
                    fontWeight: current ? 600 : 400,
                  }}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="font-body text-[10px] mt-8" style={{ color: "hsl(30 10% 64%)" }}>
          Please don't close this tab — your invitation is being prepared.
        </p>
      </div>
    </div>
  );
};

// ── Preview & Confirm ─────────────────────────────────────────────────────────
const TEMPLATE_NAMES: Record<string, string> = {
  "golden-hour":   "Golden Hour",
  "garden-rose":   "Garden Rose",
  "rustic-bloom":  "Rustic Bloom",
  "midnight-luxe": "Midnight Luxe",
  "soft-love":     "Soft Love",
};

const InvitePreviewPay = ({
  form, onCreate, onPay, templateId, photoCount, hasPaid, entLoading, awaitingPayment,
}: {
  form: FormState;
  onCreate: () => void;
  onPay: () => void;
  templateId: string;
  photoCount: number;
  hasPaid: boolean;
  entLoading: boolean;
  awaitingPayment: boolean;
}) => {
  useEffect(() => {
    const draft: StoredInvite = {
      id: "invite-preview-draft",
      partner1: form.partner1 || "Partner 1", partner2: form.partner2 || "Partner 2",
      hashtag: form.hashtag, email: form.email, phone: form.phone,
      date: formatDisplayDate(form.dateISO) || "Your Wedding Day",
      dateISO: form.dateISO || "2026-12-31",
      time: formatDisplayTime(form.timeRaw),
      rsvpDeadline: formatDisplayDate(form.rsvpISO), rsvpDeadlineISO: form.rsvpISO,
      venueName: form.venueName || "Your Venue", venueAddress: form.venueAddress, venueCity: form.venueCity,
      venueLat: form.venueLat, venueLng: form.venueLng,
      story: form.story, schedule: form.schedule,
      dresscode: form.dresscode, dresscodeNote: form.dresscodeNote, menuNote: form.menuNote,
      transportCar: form.transportCar, transportTrain: form.transportTrain, transportPlane: form.transportPlane,
      hotels: form.hotels,
      selectedMusic: form.selectedMusic,
      createdAt: new Date().toISOString(),
    };
    saveInviteLocal(draft);
  }, []);

  const coupleName = form.partner1 && form.partner2
    ? `${form.partner1} & ${form.partner2}`
    : form.partner1 || form.partner2 || "—";

  const storyCount  = form.story.filter(s => s.title.trim()).length;
  const scheduleCount = form.schedule.filter(s => s.event.trim()).length;
  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;

  const summaryRows = [
    { label: "Couple",   value: coupleName },
    { label: "Date",     value: [formatDisplayDate(form.dateISO), formatDisplayTime(form.timeRaw)].filter(Boolean).join(" · ") || "—" },
    { label: "Venue",    value: [form.venueName, form.venueCity].filter(Boolean).join(", ") || "—" },
    { label: "Template", value: templateName },
    { label: "Music",    value: form.selectedMusic ? "Selected ✓" : "None" },
    { label: "Photos",   value: photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? "s" : ""}` : "None" },
    { label: "Story",    value: storyCount > 0 ? `${storyCount} moment${storyCount !== 1 ? "s" : ""}` : "None" },
    { label: "Program",  value: scheduleCount > 0 ? `${scheduleCount} event${scheduleCount !== 1 ? "s" : ""}` : "None" },
    ...(form.rsvpISO ? [{ label: "RSVP by", value: formatDisplayDate(form.rsvpISO) }] : []),
  ];

  const chips = [
    { icon: "✦", label: templateName },
    ...(form.selectedMusic    ? [{ icon: "♪", label: "Music added" }]                                       : []),
    ...(photoCount > 0        ? [{ icon: "◈", label: `${photoCount} photo${photoCount !== 1 ? "s" : ""}` }] : []),
    ...(storyCount > 0        ? [{ icon: "◇", label: `${storyCount} moment${storyCount !== 1 ? "s" : ""}` }]: []),
    ...(scheduleCount > 0     ? [{ icon: "◉", label: `${scheduleCount} program events` }]                    : []),
    ...(form.dresscode        ? [{ icon: "◈", label: form.dresscode }]                                       : []),
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* ── Luxury summary card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(155deg, hsl(42 60% 98%) 0%, hsl(38 50% 96%) 50%, hsl(350 35% 97%) 100%)",
          boxShadow: "0 20px 60px hsl(38 40% 55% / 0.14), 0 1px 0 hsl(38 55% 80%) inset",
        }}
      >
        {/* Shimmer blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(38 72% 60% / 0.12) 0%, transparent 65%)", transform: "translate(25%,-25%)" }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(340 50% 70% / 0.08) 0%, transparent 65%)", transform: "translate(-20%,25%)" }} />

        <div className="relative px-6 pt-7 pb-6">

          {/* Eyebrow */}
          <p className="font-body text-[9px] tracking-[0.35em] uppercase font-semibold text-center mb-5"
            style={{ color: "hsl(38 55% 48%)" }}>
            Wedding Invitation
          </p>

          {/* Decorative line */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(38 50% 72%))" }} />
            <span style={{ color: "hsl(38 62% 52%)", fontSize: 10 }}>✦</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, hsl(38 50% 72%))" }} />
          </div>

          {/* Couple names */}
          <p className="font-handwritten text-center leading-tight mb-1 break-words px-2"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.4rem)", color: "hsl(30 20% 14%)", letterSpacing: "0.01em" }}>
            {form.partner1 || "Partner 1"}
          </p>
          <p className="font-body text-center text-[10px] tracking-[0.3em] uppercase mb-1"
            style={{ color: "hsl(38 55% 52%)" }}>
            &amp;
          </p>
          <p className="font-handwritten text-center leading-tight mb-6 break-words px-2"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.4rem)", color: "hsl(30 20% 14%)", letterSpacing: "0.01em" }}>
            {form.partner2 || "Partner 2"}
          </p>

          {/* Date + venue */}
          {(form.dateISO || form.venueName) && (
            <div className="text-center mb-5 flex flex-col gap-1.5">
              {form.dateISO && (
                <p className="font-body text-sm font-semibold" style={{ color: "hsl(30 18% 26%)" }}>
                  {formatDisplayDate(form.dateISO)}
                  {form.timeRaw && (
                    <span style={{ color: "hsl(38 45% 52%)" }}> · {formatDisplayTime(form.timeRaw)}</span>
                  )}
                </p>
              )}
              {form.venueName && (
                <p className="font-body text-xs" style={{ color: "hsl(30 12% 46%)" }}>
                  {[form.venueName, form.venueCity].filter(Boolean).join("  ·  ")}
                </p>
              )}
              {form.rsvpISO && (
                <p className="font-body text-[10px]" style={{ color: "hsl(30 10% 56%)" }}>
                  RSVP by {formatDisplayDate(form.rsvpISO)}
                </p>
              )}
            </div>
          )}

          {/* Decorative line */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, hsl(38 45% 70%))" }} />
            <span style={{ color: "hsl(38 50% 60%)", fontSize: 9 }}>◆ ◆ ◆</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, hsl(38 45% 70%))" }} />
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map(c => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[10px] font-semibold"
                style={{
                  background: "hsl(38 55% 94%)",
                  border: "1px solid hsl(38 45% 82%)",
                  color: "hsl(38 55% 40%)",
                }}
              >
                <span style={{ fontSize: 9 }}>{c.icon}</span>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Preview button */}
      <motion.button
        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
        onClick={() => window.open("/invite/invite-preview-draft", "_blank")}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-body text-sm font-semibold"
        style={{
          background: "white",
          color: "hsl(38 55% 44%)",
          border: "1.5px solid hsl(38 45% 78%)",
          boxShadow: "0 2px 12px hsl(38 40% 60% / 0.10)",
        }}
      >
        <span style={{ fontSize: 15 }}>👁️</span> Preview Your Invitation
      </motion.button>

      {/* ── Single unlock package — $49 ── */}
      {!hasPaid && (
        <div
          className="rounded-3xl px-6 py-6 flex flex-col gap-4"
          style={{ background: "white", border: "1.5px solid hsl(38 45% 82%)", boxShadow: "0 10px 34px hsl(38 40% 55% / 0.12)" }}
        >
          <div className="text-center">
            <p className="font-body text-[9px] tracking-[0.32em] uppercase font-semibold mb-2" style={{ color: "hsl(38 55% 48%)" }}>
              One package · Everything included
            </p>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-body text-xs" style={{ color: LIGHT }}>$</span>
              <span className="font-display text-4xl font-bold" style={{ color: DARK }}>49</span>
              <span className="font-body text-xs" style={{ color: LIGHT }}>one-time</span>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {[
              "Your live invitation link, published instantly",
              "All 5 cinematic templates",
              "Unlimited guest invites & RSVP tracking",
              "Private RSVP dashboard with check-in & QR code",
              "Photos, music, countdown, venue map & love story",
            ].map(f => (
              <li key={f} className="flex items-start gap-2">
                <span style={{ color: "var(--tg)", fontSize: 12, lineHeight: "18px" }}>✓</span>
                <span className="font-body text-xs leading-snug" style={{ color: MID }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pay / publish button */}
      <motion.button
        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
        onClick={hasPaid ? onCreate : onPay}
        disabled={entLoading || awaitingPayment}
        className="w-full py-4 rounded-2xl font-body text-base font-bold text-white disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, var(--tg), var(--tgg))",
          boxShadow: "0 8px 28px var(--tglow), inset 0 1px 0 rgba(255,255,255,0.14)",
        }}
      >
        {entLoading
          ? "Checking your access…"
          : awaitingPayment
          ? "Waiting for payment confirmation…"
          : hasPaid
          ? "Publish My Invitation ✨"
          : "Pay $49 & Publish →"}
      </motion.button>
      <p className="font-body text-[11px] text-center -mt-1" style={{ color: LIGHT }}>
        {awaitingPayment
          ? "Complete the payment in the new tab — this page unlocks automatically."
          : hasPaid
          ? "Your invitation and RSVP dashboard go live right away."
          : "Secure one-time payment · Your invitation goes live the moment you pay."}
      </p>

    </div>
  );
};

// ── Step 6: Photos ─────────────────────────────────────────────────────────────
const MAX_PHOTOS = 6;
const MAX_DIM = 1600;
const IMG_QUALITY = 0.82;

const compressImage = (file: File): Promise<File> =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
        "image/jpeg", IMG_QUALITY
      );
    };
    img.src = url;
  });

interface StepPhotosProps { images: File[]; setImages: React.Dispatch<React.SetStateAction<File[]>>; }

const StepPhotos = ({ images, setImages }: StepPhotosProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = images.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [images]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const compressed = await Promise.all(toAdd.map(compressImage));
    setImages(prev => [...prev, ...compressed]);
  };

  const remove = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: MID }}>
        Add up to {MAX_PHOTOS} photos — they'll appear in your invite for guests to enjoy.
      </p>

      {images.length < MAX_PHOTOS && (
        <>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }} />
          <button onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 w-full py-10 rounded-2xl font-body text-sm font-semibold transition-colors"
            style={{ border: "2px dashed var(--tgl)", color: "var(--tg)", background: "rgba(255,255,255,0.5)" }}>
            <span style={{ fontSize: 32 }}>📷</span>
            <span>Tap to add photos</span>
            <span className="font-normal" style={{ color: LIGHT, fontSize: "0.72rem" }}>
              {images.length}/{MAX_PHOTOS} added · JPEG, PNG, WebP
            </span>
          </button>
        </>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group"
              style={{ border: "1.5px solid hsl(36 28% 78%)" }}>
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "hsl(0 52% 58%)", color: "white" }}>
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_PHOTOS && (
            <button onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 font-body text-xs font-semibold transition-colors"
              style={{ border: "2px dashed var(--tgl)", color: "var(--tg)", background: "rgba(255,255,255,0.4)" }}>
              <Plus className="w-5 h-5" />
              Add
            </button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <p className="font-body text-xs text-center" style={{ color: LIGHT }}>
          Photos are optional — you can skip this step
        </p>
      )}
    </div>
  );
};

// ── Step 7: Music ──────────────────────────────────────────────────────────────
interface StepMusicProps { selectedMusic: string | null; onSelect: (id: string | null) => void; }

const StepMusic = ({ selectedMusic, onSelect }: StepMusicProps) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (preset: MusicPreset) => {
    if (playing === preset.id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(preset.url);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => setPlaying(null);
      setPlaying(preset.id);
    }
  };

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-sm" style={{ color: MID }}>
        Pick a song to play when guests open your invite. Press ▶ to preview.
      </p>

      <div className="flex flex-col gap-2.5">
        {MUSIC_PRESETS.map(preset => {
          const isSelected = selectedMusic === preset.id;
          const isPlaying = playing === preset.id;
          return (
            <div key={preset.id}
              onClick={() => onSelect(isSelected ? null : preset.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200"
              style={{
                background: isSelected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                border: isSelected ? "1.5px solid var(--tg)" : "1.5px solid hsl(36 28% 78%)",
                boxShadow: isSelected ? "0 4px 16px var(--tglow)" : "none",
              }}>
              <button
                onClick={e => { e.stopPropagation(); togglePlay(preset); }}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
                style={{ background: isPlaying ? "var(--tg)" : "hsl(38 30% 90%)", color: isPlaying ? "white" : "var(--tg)" }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}>{isPlaying ? "⏸" : "▶"}</span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold truncate" style={{ color: DARK }}>{preset.title}</p>
                <p className="font-body text-xs truncate" style={{ color: LIGHT }}>{preset.artist}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--tg)" }}>
                  <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Premium custom music — locked */}
      <div className="relative rounded-2xl overflow-hidden mt-2" style={{ border: "1.5px solid hsl(36 28% 78%)" }}>
        <div className="px-4 pt-4 pb-12 select-none" style={{ opacity: 0.35, pointerEvents: "none" }}>
          <p className="font-body text-sm font-semibold mb-1" style={{ color: DARK }}>Custom Music URL</p>
          <p className="font-body text-xs mb-3" style={{ color: LIGHT }}>Paste any direct audio URL or YouTube link</p>
          <input className="font-body" style={{ ...lineInput, opacity: 0.6 }} disabled placeholder="https://…" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: "rgba(255,255,255,0.84)", backdropFilter: "blur(5px)" }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <p className="font-body text-sm font-bold" style={{ color: DARK }}>Coming Soon</p>
          <p className="font-body text-xs text-center px-8" style={{ color: MID }}>Custom music uploads land soon — pick a preset for now</p>
        </div>
      </div>

      {!selectedMusic && (
        <p className="font-body text-xs text-center mt-1" style={{ color: LIGHT }}>
          Music is optional — you can skip this step
        </p>
      )}
    </div>
  );
};

// ── Invitation live screen ────────────────────────────────────────────────────
const OrderConfirmedScreen = ({ inviteId }: { inviteId: string }) => (
  <div
    className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 overflow-y-auto py-10"
    style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(38 50% 96%) 50%, hsl(350 35% 97%))" }}
  >
    <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(38 72% 60% / 0.10) 0%, transparent 65%)", transform: "translate(30%,-30%)" }} />
    <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(340 50% 70% / 0.07) 0%, transparent 65%)", transform: "translate(-25%,25%)" }} />

    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm text-center"
    >
      {/* Checkmark circle */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
        style={{
          background: "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))",
          boxShadow: "0 10px 40px hsl(38 72% 44% / 0.32)",
        }}
      >
        <span style={{ color: "white", fontSize: 40, lineHeight: 1 }}>✓</span>
      </div>

      <p className="font-body text-[9px] tracking-[0.32em] uppercase font-semibold mb-3"
        style={{ color: "hsl(38 50% 54%)" }}>
        Payment Confirmed
      </p>

      <h1 className="font-display font-bold mb-4"
        style={{ fontSize: "clamp(1.4rem, 5vw, 2rem)", color: "hsl(30 20% 14%)" }}>
        Your invitation is live!
      </h1>

      <p className="font-body text-sm mb-6 leading-relaxed" style={{ color: "hsl(30 14% 36%)" }}>
        Share the link with your guests — every RSVP lands in your dashboard instantly.
      </p>

      <div className="flex flex-col gap-3 mb-6">
        <a
          href={`/invite/${inviteId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-2xl font-body text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))", boxShadow: "0 8px 26px hsl(38 72% 44% / 0.28)" }}
        >
          View My Invitation →
        </a>
        <a
          href={`/dashboard/${inviteId}`}
          className="w-full py-3.5 rounded-2xl font-body text-sm font-bold transition-opacity hover:opacity-80"
          style={{ background: "white", color: "hsl(38 55% 42%)", border: "1.5px solid hsl(38 45% 78%)" }}
        >
          Open RSVP Dashboard
        </a>
        <button
          onClick={() => {
            void navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteId}`);
          }}
          className="w-full py-3 rounded-2xl font-body text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ background: "hsl(38 40% 95%)", color: "hsl(30 14% 38%)" }}
        >
          Copy shareable link
        </button>
      </div>

      <p className="font-body text-sm mb-8 leading-relaxed" style={{ color: "hsl(30 14% 36%)" }}>
        Thank you for using <span style={{ color: "hsl(38 72% 44%)", fontWeight: 600 }}>Wed4Love</span>!
      </p>


      {/* WhatsApp contact */}
      <a
        href="https://wa.me/9779702238084"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, hsl(142 60% 38%), hsl(142 60% 46%))",
          boxShadow: "0 6px 24px hsl(142 60% 38% / 0.28)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.554 4.112 1.522 5.838L.057 23.429a.75.75 0 0 0 .917.914l5.701-1.497A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.73 9.73 0 0 1-4.953-1.352l-.355-.212-3.683.967.984-3.596-.232-.37A9.733 9.733 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        Contact us on WhatsApp
      </a>

      <p className="font-body text-[10px] mt-5" style={{ color: "hsl(30 10% 64%)" }}>
        +977 970 2238084
      </p>
    </motion.div>
  </div>
);

// ── Step meta ──────────────────────────────────────────────────────────────────
const STEP_META = [
  { icon: "💍", title: "The Happy Couple",     sub: "Start with the stars of the show" },
  { icon: "📅", title: "The Big Day",           sub: "When and where love becomes forever" },
  { icon: "📖", title: "Your Love Story",       sub: "Share the moments that led you here" },
  { icon: "🥂", title: "Day of Celebrations",   sub: "Walk your guests through the perfect day" },
  { icon: "🌸", title: "The Finishing Touches", sub: "Dress code, menu & travel details" },
  { icon: "📷", title: "Your Photos",           sub: "Add photos guests will cherish" },
  { icon: "🎵", title: "Choose Your Song",      sub: "A song that plays when they open the invite" },
  { icon: "✨", title: "Almost There!",         sub: "Preview your invite, then share it with love" },
];

// ── Draft ID ───────────────────────────────────────────────────────────────────
const DRAFT_PREFIX = "draft";

// ── Main component ─────────────────────────────────────────────────────────────
const CreateInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template") ?? "garden-rose";
  const theme = THEMES[templateId] ?? DEFAULT_THEME;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [images, setImages] = useState<File[]>([]);
  const [dir, setDir] = useState(1);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);
  const { user } = useAuth();
  const { plan: userPlan, loading: entLoading } = useInviteEntitlement(awaitingPayment);
  const hasPaid = !!userPlan;


  const draftIdRef = useRef<string>(`${DRAFT_PREFIX}-${Date.now()}`);

  // ── Load existing draft on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const existing = loadDraftLocal(user.id);
    if (!existing) return;

    // Restore form state
    setForm({
      partner1: existing.partner1 ?? "",
      partner2: existing.partner2 ?? "",
      hashtag: existing.hashtag ?? "",
      email: existing.email ?? "",
      phone: existing.phone ?? "",
      dateISO: existing.dateISO ?? "",
      timeRaw: existing.time ? existing.time.replace(/ (AM|PM)/, "").trim() : "16:30",
      rsvpISO: existing.rsvpDeadlineISO ?? "",
      venueName: existing.venueName ?? "",
      venueAddress: existing.venueAddress ?? "",
      venueCity: existing.venueCity ?? "",
      venueLat: existing.venueLat ?? null,
      venueLng: existing.venueLng ?? null,
      story: existing.story?.length ? existing.story : DEFAULT.story,
      schedule: existing.schedule?.length ? existing.schedule : DEFAULT.schedule,
      dresscode: existing.dresscode ?? "",
      dresscodeNote: existing.dresscodeNote ?? "",
      menuNote: existing.menuNote ?? "",
      transportCar: existing.transportCar ?? "",
      transportTrain: existing.transportTrain ?? "",
      transportPlane: existing.transportPlane ?? "",
      hotels: existing.hotels?.length ? existing.hotels : DEFAULT.hotels,
      selectedMusic: existing.selectedMusic ?? null,
    });
    if (existing.currentStep && existing.currentStep > 1) {
      setStep(existing.currentStep);
    }
    draftIdRef.current = existing.id;
    setDraftRestored(true);
  }, [user]);

  const set = (k: keyof FormState, v: FormState[keyof FormState]) =>
    setForm(f => ({ ...f, [k]: v }));

  const buildDraft = (currentStep: number): StoredInvite => ({
    id: draftIdRef.current,
    template: templateId,
    partner1: form.partner1, partner2: form.partner2,
    hashtag: form.hashtag, email: form.email, phone: form.phone,
    date: formatDisplayDate(form.dateISO), dateISO: form.dateISO,
    time: formatDisplayTime(form.timeRaw),
    rsvpDeadline: formatDisplayDate(form.rsvpISO), rsvpDeadlineISO: form.rsvpISO,
    venueName: form.venueName, venueAddress: form.venueAddress, venueCity: form.venueCity,
    venueLat: form.venueLat, venueLng: form.venueLng,
    story: form.story, schedule: form.schedule,
    dresscode: form.dresscode, dresscodeNote: form.dresscodeNote, menuNote: form.menuNote,
    transportCar: form.transportCar, transportTrain: form.transportTrain, transportPlane: form.transportPlane,
    hotels: form.hotels, selectedMusic: form.selectedMusic,
    createdAt: new Date().toISOString(),
    currentStep,
    status: 'draft',
  });

  const saveDraft = (nextStep: number) => {
    if (!user) return;
    saveDraftLocal(buildDraft(nextStep), user.id);
  };

  const goNext = () => {
    setDir(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const nextStep = Math.min(step + 1, STEP_META.length);
    setStep(nextStep);
    saveDraft(nextStep);
  };
  const goBack = () => {
    setDir(-1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step > 1) setStep(s => s - 1);
  };

  const isLastStep = step === STEP_META.length;
  const meta = STEP_META[step - 1];

  const handleCreate = () => setIsPreparing(true);

  const handlePay = () => {
    saveDraft(STEP_META.length);
    setAwaitingPayment(true);
    notify("checkout_started", { email: user?.email, template: templateId, couple: `${form.partner1} & ${form.partner2}` });
    const url = user?.email
      ? `${CHECKOUT_URL}?d2c=true&email=${encodeURIComponent(user.email)}`
      : `${CHECKOUT_URL}?d2c=true`;
    window.open(url, "_blank", "noopener");
  };

  // Auto-publish as soon as the payment webhook grants access
  useEffect(() => {
    if (awaitingPayment && hasPaid) {
      setAwaitingPayment(false);
      setIsPreparing(true);
    }
  }, [awaitingPayment, hasPaid]);

  const finaliseCreate = () => {
    const id = `invite-${Date.now()}`;
    const stored: StoredInvite = {
      id, template: templateId,
      partner1: form.partner1, partner2: form.partner2,
      hashtag: form.hashtag, email: form.email, phone: form.phone,
      date: formatDisplayDate(form.dateISO), dateISO: form.dateISO,
      time: formatDisplayTime(form.timeRaw),
      rsvpDeadline: formatDisplayDate(form.rsvpISO), rsvpDeadlineISO: form.rsvpISO,
      venueName: form.venueName, venueAddress: form.venueAddress, venueCity: form.venueCity,
      venueLat: form.venueLat, venueLng: form.venueLng,
      story: form.story.filter(s => s.title.trim() || s.desc.trim()),
      schedule: form.schedule.filter(s => s.event.trim()),
      dresscode: form.dresscode, dresscodeNote: form.dresscodeNote, menuNote: form.menuNote,
      transportCar: form.transportCar, transportTrain: form.transportTrain, transportPlane: form.transportPlane,
      hotels: form.hotels.filter(h => h.name.trim()),
      selectedMusic: form.selectedMusic,
      createdAt: new Date().toISOString(),
      status: 'published',
    };
    saveInviteLocal(stored);
    notify("invite_published", { id, template: templateId, couple: `${form.partner1} & ${form.partner2}`, date: stored.date, venue: form.venueName, email: user?.email ?? form.email });
    if (user) clearDraftLocal(user.id);
    setIsPreparing(false);
    setCreatedId(id);
  };

  if (isPreparing) {
    const coupleName = [form.partner1, form.partner2].filter(Boolean).join(" & ");
    const tName = TEMPLATE_NAMES[templateId] ?? templateId;
    return <PreparingScreen onDone={finaliseCreate} coupleName={coupleName} templateName={tName} />;
  }

  if (createdId) {
    return <OrderConfirmedScreen inviteId={createdId} />;
  }

  return (
    <div className="min-h-screen" style={{ background: BG, "--tg": theme.gold, "--tgl": theme.goldL, "--tgg": theme.goldGrad, "--tglow": theme.glow } as React.CSSProperties}>

      {/* ── Floating ✕ ── */}
      <button onClick={() => navigate(-1)}
        style={{ position: "fixed", top: 14, right: 20, zIndex: 50, color: MID, opacity: 0.7, lineHeight: 1 }}
        className="transition-opacity hover:opacity-40">
        <X className="w-5 h-5" />
      </button>

      {/* ── Draft restored banner ── */}
      <AnimatePresence>
        {draftRestored && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
              zIndex: 50, display: "flex", alignItems: "center", gap: 10,
              padding: "8px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
              border: `1.5px solid ${theme.goldL}`,
              boxShadow: "0 4px 20px hsl(30 20% 50% / 0.12)",
              color: theme.gold, fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 14 }}>✦</span>
            Draft restored — continue where you left off
            <button
              onClick={() => setDraftRestored(false)}
              style={{ color: MID, opacity: 0.6, lineHeight: 1, marginLeft: 4 }}
              className="hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main className="px-5 pb-24" style={{ paddingTop: 40 }}>
        <div className="max-w-lg mx-auto">

          {/* Progress bar */}
          <ProgressBar
            currentStep={step - 1}
            totalSteps={8}
            stepLabels={["Couple", "Big Day", "Story", "Program", "Details", "Photos", "Music", "Preview"]}
            accentColor={theme.gold}
          />

          {/* Step hero */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={`hero-${step}`}
              custom={dir}
              initial={{ opacity: 0, x: dir * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10">

            <div className="text-center">
              {/* Gold rule */}
              <div style={{ width: 40, height: 1.5, background: "linear-gradient(90deg, transparent, var(--tgl), transparent)", margin: "0 auto 12px" }} />

              <div className="flex items-center mb-1">
                {step > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={goBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    style={{ background: "hsl(var(--secondary))" }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                ) : <div className="w-16" />}
                <h2 className="flex-1 text-center font-display font-bold"
                  style={{ fontSize: "clamp(1.1rem, 4vw, 1.35rem)", color: DARK }}>
                  {meta.title}
                </h2>
                <div className="w-16" />
              </div>
              <p className="font-body text-sm text-center" style={{ color: LIGHT }}>{meta.sub}</p>
            </div>
            </motion.div>
          </AnimatePresence>


          {/* Form fields */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -30 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              {step === 1 && <StepCouple  form={form} set={set} />}
              {step === 2 && <StepBigDay  form={form} set={set} theme={theme} />}
              {step === 3 && <StepStory   form={form} set={set} />}
              {step === 4 && <StepProgram form={form} set={set} />}
              {step === 5 && <StepDetails form={form} set={set} />}
              {step === 6 && <StepPhotos  images={images} setImages={setImages} />}
              {step === 7 && <StepMusic   selectedMusic={form.selectedMusic} onSelect={id => set("selectedMusic", id)} />}
              {step === 8 && (
                <InvitePreviewPay
                  form={form}
                  onCreate={handleCreate}
                  onPay={handlePay}
                  templateId={templateId}
                  photoCount={images.length}
                  hasPaid={hasPaid}
                  entLoading={entLoading}
                  awaitingPayment={awaitingPayment}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex items-center gap-3">
            {!isLastStep && (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={step === 1 ? () => navigate(-1) : goBack}
                className="flex items-center gap-2 px-5 py-4 rounded-full font-body text-sm font-semibold transition-colors shrink-0"
                style={{ background: "rgba(255,255,255,0.92)", border: "1.5px solid hsl(36 28% 80%)", color: MID, boxShadow: "0 2px 8px hsl(30 20% 50% / 0.08)" }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </motion.button>
            )}

            {!isLastStep && (
              <motion.button
                whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-body text-base font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, var(--tg), var(--tgg))",
                  boxShadow: "0 8px 32px var(--tglow)",
                }}>
                {step === TOTAL_STEPS ? "Review & Publish" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default CreateInvite;
