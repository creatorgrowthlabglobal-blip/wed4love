import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Plus, Trash2, ArrowRight, ChevronLeft } from "lucide-react";
import { saveInviteLocal, formatDisplayDate, formatDisplayTime } from "@/lib/inviteStorage";
import type { StoredInvite } from "@/lib/inviteStorage";

// ── Palette ────────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5;
const GOLD   = "hsl(28 62% 50%)";
const GOLD_L = "hsl(28 52% 68%)";
const DARK   = "hsl(24 22% 16%)";
const MID    = "hsl(24 12% 42%)";
const LIGHT  = "hsl(24 8% 60%)";
const LINE   = "hsl(36 28% 80%)";
const BG     = "radial-gradient(ellipse 130% 80% at 15% -10%, hsl(340 48% 95%) 0%, hsl(44 36% 95%) 50%, hsl(38 40% 93%) 100%)";

// ── Input styles ──────────────────────────────────────────────────────────────
const labelSt: React.CSSProperties = {
  fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.22em",
  textTransform: "uppercase", color: LIGHT, display: "block", marginBottom: 6,
};

const lineInput: React.CSSProperties = {
  width: "100%", padding: "10px 0", fontSize: "1rem", fontFamily: "inherit",
  background: "transparent", color: DARK, outline: "none", borderRadius: 0,
  border: "none", borderBottom: `1.5px solid ${LINE}`,
  transition: "border-color 0.18s",
};

const boxArea: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "0.92rem", fontFamily: "inherit",
  background: "rgba(255,255,255,0.55)", backdropFilter: "blur(6px)",
  color: DARK, outline: "none", borderRadius: 10, resize: "none",
  border: `1.5px solid ${LINE}`,
  transition: "border-color 0.18s, background 0.18s",
};

const onLineF = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderBottomColor = GOLD;
};
const onLineB = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderBottomColor = LINE;
};
const onBoxF = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = GOLD;
  e.currentTarget.style.background = "rgba(255,255,255,0.85)";
};
const onBoxB = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = LINE;
  e.currentTarget.style.background = "rgba(255,255,255,0.55)";
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
  <div className="flex items-center gap-2.5 mb-5">
    <span style={{ fontSize: 18 }}>{icon}</span>
    <p className="font-display font-bold text-sm" style={{ color: DARK }}>{title}</p>
    <div className="flex-1 h-px ml-2" style={{ background: LINE }} />
  </div>
);

// ── Entry card ────────────────────────────────────────────────────────────────
const EntryCard = ({ index, label, onRemove, showRemove, children }: {
  index: number; label: string; onRemove: () => void; showRemove: boolean; children: React.ReactNode;
}) => (
  <div className="rounded-2xl p-5 flex flex-col gap-4"
    style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: `1px solid hsl(38 28% 85%)` }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold"
          style={{ background: GOLD, color: "white", fontSize: 10 }}>{index + 1}</div>
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
    style={{ border: `1.5px dashed ${GOLD_L}`, color: GOLD, background: "transparent" }}>
    <Plus className="w-4 h-4" /> {label}
  </button>
);

// ── Form state ────────────────────────────────────────────────────────────────
interface FormState {
  partner1: string; partner2: string; hashtag: string; email: string; phone: string;
  dateISO: string; timeRaw: string; rsvpISO: string;
  venueName: string; venueAddress: string; venueCity: string;
  story: { year: string; title: string; desc: string }[];
  schedule: { time: string; event: string; desc: string }[];
  dresscode: string; dresscodeNote: string; menuNote: string;
  transportCar: string; transportTrain: string; transportPlane: string;
  hotels: { name: string; stars: number; distance: string; note: string }[];
}

const DEFAULT: FormState = {
  partner1: "", partner2: "", hashtag: "", email: "", phone: "",
  dateISO: "", timeRaw: "16:30", rsvpISO: "",
  venueName: "", venueAddress: "", venueCity: "",
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
const StepBigDay = ({ form, set }: SP) => (
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
    <F label="Venue Name" placeholder="The Grand Pavilion" value={form.venueName}
      onChange={e => set("venueName", e.target.value)} />
    <F label="Street Address" placeholder="12 Rose Garden Lane" value={form.venueAddress}
      onChange={e => set("venueAddress", e.target.value)} />
    <F label="City & Country" placeholder="Paris, France" value={form.venueCity}
      onChange={e => set("venueCity", e.target.value)} />
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
                <F label="Distance from Venue" placeholder="0.3 km" value={hotel.distance}
                  onChange={e => updateHotel(i, "distance", e.target.value)} />
                <div>
                  <label className="font-body" style={labelSt}>Stars</label>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => updateHotel(i, "stars", n)}
                        className="text-2xl leading-none select-none transition-transform hover:scale-110"
                        style={{ color: n <= hotel.stars ? GOLD : "hsl(38 22% 80%)" }}>★</button>
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

// ── Preview & Pay ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sofia R.",  quote: "She cried when she saw our invite. Every guest complimented it." },
  { name: "Marco T.",  quote: "Our guests said they'd never seen anything like it. Truly magical." },
  { name: "Aisha K.",  quote: "The envelope reveal had my mum in happy tears. Worth every penny." },
  { name: "James L.",  quote: "Guests actually RSVP'd early because the invite was so beautiful." },
  { name: "Priya D.",  quote: "My fiancé said it was the most beautiful thing he'd ever seen." },
];

const InvitePreviewPay = ({ form, onCreate }: { form: FormState; onCreate: () => void }) => {
  const [saleTimeLeft, setSaleTimeLeft] = useState("");
  const [tIdx, setTIdx] = useState(0);

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
      story: form.story, schedule: form.schedule,
      dresscode: form.dresscode, dresscodeNote: form.dresscodeNote, menuNote: form.menuNote,
      transportCar: form.transportCar, transportTrain: form.transportTrain, transportPlane: form.transportPlane,
      hotels: form.hotels,
      createdAt: new Date().toISOString(),
    };
    saveInviteLocal(draft);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const end = Date.now() + 2 * 86_400_000;
    const tick = () => {
      const d = Math.max(0, end - Date.now());
      const h = Math.floor(d / 3_600_000);
      const m = Math.floor((d % 3_600_000) / 60_000);
      const s = Math.floor((d % 60_000) / 1_000);
      setSaleTimeLeft(`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <motion.button
        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
        onClick={() => window.open("/invite/invite-preview-draft", "_blank")}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-body text-base font-semibold"
        style={{
          background: "linear-gradient(135deg, hsl(100 26% 90%), hsl(42 50% 87%), hsl(28 50% 84%))",
          color: "hsl(28 25% 26%)",
          boxShadow: "0 4px 20px hsl(30 20% 50% / 0.10)",
        }}>
        <span className="text-xl">👁️</span> Preview Your Invitation
      </motion.button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: LINE }} />
        <span className="font-body text-xs" style={{ color: LIGHT }}>unlock & share</span>
        <div className="flex-1 h-px" style={{ background: LINE }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)",
          border: `1.5px solid hsl(38 36% 86%)`,
          boxShadow: "0 24px 60px hsl(30 26% 56% / 0.10), 0 4px 16px hsl(38 36% 66% / 0.08)",
        }}>
        <div className="px-6 py-7">
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-body text-xs font-semibold"
              style={{ background: "hsl(38 76% 95%)", border: "1px solid hsl(38 56% 82%)", color: "hsl(30 58% 34%)" }}>
              ✦ Limited Launch Offer · 30% Off{saleTimeLeft ? ` · ${saleTimeLeft}` : ""}
            </div>
          </div>
          <div className="text-center mb-5">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="font-display text-6xl font-bold" style={{ color: DARK }}>$9.99</span>
              <span className="font-body text-sm" style={{ color: LIGHT }}>USD</span>
            </div>
            <p className="font-body text-sm" style={{ color: LIGHT }}>
              <span className="line-through mr-1.5" style={{ color: "hsl(38 25% 72%)" }}>$14.27</span>
              One-time · Yours forever
            </p>
          </div>
          <div className="mb-5" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
          <ul className="space-y-3 mb-5">
            {[
              "Cinematic 3D envelope opening reveal",
              "Live countdown timer to your big day",
              "RSVP tracking with live headcount",
              "All 5 colour templates included",
              "Shareable link that never expires",
              "Full refund if you're not satisfied",
            ].map(item => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "hsl(38 56% 94%)", border: `1px solid hsl(38 42% 82%)` }}>
                  <span style={{ color: GOLD, fontSize: 10, fontWeight: 700 }}>✓</span>
                </div>
                <p className="font-body text-sm" style={{ color: MID }}>{item}</p>
              </li>
            ))}
          </ul>
          <div className="mb-5" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)` }} />
          <div className="flex items-center gap-3 mb-5 min-h-[44px]">
            <div className="flex -space-x-2 shrink-0">
              {["S","M","A"].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px]"
                  style={{ background: "hsl(340 50% 90%)", border: "2px solid white", color: "hsl(340 50% 44%)" }}>
                  {l}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-0.5 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: GOLD, fontSize: 11 }}>★</span>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={tIdx}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="font-body text-xs leading-snug" style={{ color: MID }}>
                  "{TESTIMONIALS[tIdx].quote}"
                  <span style={{ color: LIGHT }}> — {TESTIMONIALS[tIdx].name}</span>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
            onClick={onCreate}
            className="w-full py-4 rounded-2xl font-body text-base font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, hsl(38 76% 56%))`,
              boxShadow: `0 8px 28px hsl(28 76% 56% / 0.26), inset 0 1px 0 rgba(255,255,255,0.14)`,
            }}>
            Create My Invitation — $9.99
          </motion.button>
          <p className="mt-3 font-body text-[11px] text-center" style={{ color: LIGHT }}>
            🔒 Secure checkout · Instant access after payment
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ── Step meta ──────────────────────────────────────────────────────────────────
const STEP_META = [
  { icon: "💍", title: "The Happy Couple",     sub: "Start with the stars of the show" },
  { icon: "📅", title: "The Big Day",           sub: "When and where love becomes forever" },
  { icon: "📖", title: "Your Love Story",       sub: "Share the moments that led you here" },
  { icon: "🥂", title: "Day of Celebrations",   sub: "Walk your guests through the perfect day" },
  { icon: "🌸", title: "The Finishing Touches", sub: "Dress code, menu & travel details" },
  { icon: "✨", title: "Almost There!",         sub: "Preview your invite, then share it with love" },
];

// ── Main component ─────────────────────────────────────────────────────────────
const CreateInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template") ?? "garden-rose";
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [dir, setDir] = useState(1);

  const set = (k: keyof FormState, v: FormState[keyof FormState]) =>
    setForm(f => ({ ...f, [k]: v }));

  const goNext = () => {
    setDir(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(s => Math.min(s + 1, STEP_META.length));
  };
  const goBack = () => {
    setDir(-1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step > 1) setStep(s => s - 1);
  };

  const isLastStep = step === STEP_META.length;
  const meta = STEP_META[step - 1];

  const coupleLabel = form.partner1 && form.partner2
    ? `${form.partner1} & ${form.partner2}`
    : form.partner1 || form.partner2 || null;

  const handleCreate = () => {
    const id = `invite-${Date.now()}`;
    const stored: StoredInvite = {
      id, template: templateId,
      partner1: form.partner1, partner2: form.partner2,
      hashtag: form.hashtag, email: form.email, phone: form.phone,
      date: formatDisplayDate(form.dateISO), dateISO: form.dateISO,
      time: formatDisplayTime(form.timeRaw),
      rsvpDeadline: formatDisplayDate(form.rsvpISO), rsvpDeadlineISO: form.rsvpISO,
      venueName: form.venueName, venueAddress: form.venueAddress, venueCity: form.venueCity,
      story: form.story, schedule: form.schedule,
      dresscode: form.dresscode, dresscodeNote: form.dresscodeNote, menuNote: form.menuNote,
      transportCar: form.transportCar, transportTrain: form.transportTrain, transportPlane: form.transportPlane,
      hotels: form.hotels,
      createdAt: new Date().toISOString(),
    };
    saveInviteLocal(stored);
    navigate(`/invite/${id}`);
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>

      {/* ── Pill progress dots ── */}
      <div style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 50, pointerEvents: "none" }}>
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div key={i}
              animate={{ width: i === step - 1 ? 22 : 6, opacity: i < step ? 1 : 0.35 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: 5, borderRadius: 3, background: i < step ? GOLD : "hsl(38 28% 72%)" }}
            />
          ))}
        </div>
      </div>

      {/* ── Floating ✕ ── */}
      <button onClick={() => navigate(-1)}
        style={{ position: "fixed", top: 14, left: 20, zIndex: 50, color: MID, opacity: 0.7, lineHeight: 1 }}
        className="transition-opacity hover:opacity-40">
        <X className="w-5 h-5" />
      </button>

      {/* ── Main ── */}
      <main className="px-5 pb-24" style={{ paddingTop: 60 }}>
        <div className="max-w-lg mx-auto">

          {/* Step hero */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={`hero-${step}`}
              custom={dir}
              initial={{ opacity: 0, x: dir * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-10">

              <div className="text-4xl mb-4 select-none">{meta.icon}</div>

              <AnimatePresence mode="wait">
                {coupleLabel ? (
                  <motion.p key="couple"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="font-handwritten mb-2"
                    style={{ fontSize: "clamp(1.7rem, 7vw, 2.4rem)", color: "hsl(24 38% 34%)", lineHeight: 1.1 }}>
                    {coupleLabel}
                  </motion.p>
                ) : (
                  <motion.div key="space" style={{ height: "clamp(1.7rem, 7vw, 2.4rem)", marginBottom: 8 }} />
                )}
              </AnimatePresence>

              {/* Gold rule */}
              <div style={{ width: 40, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD_L}, transparent)`, margin: "0 auto 12px" }} />

              <h2 className="font-display font-bold mb-1"
                style={{ fontSize: "clamp(1.1rem, 4vw, 1.35rem)", color: DARK }}>
                {meta.title}
              </h2>
              <p className="font-body text-sm" style={{ color: LIGHT }}>{meta.sub}</p>
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
              {step === 2 && <StepBigDay  form={form} set={set} />}
              {step === 3 && <StepStory   form={form} set={set} />}
              {step === 4 && <StepProgram form={form} set={set} />}
              {step === 5 && <StepDetails form={form} set={set} />}
              {step === 6 && <InvitePreviewPay form={form} onCreate={handleCreate} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {!isLastStep && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-body text-base font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, hsl(38 76% 56%))`,
                  boxShadow: `0 8px 32px hsl(28 76% 54% / 0.22)`,
                }}>
                {step === TOTAL_STEPS ? "Review & Publish" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              {step > 1 && (
                <button onClick={goBack}
                  className="flex items-center gap-1.5 font-body text-sm py-1 transition-opacity hover:opacity-40"
                  style={{ color: LIGHT }}>
                  <ChevronLeft className="w-3.5 h-3.5" /> Go back
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CreateInvite;
