import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Crown, Palette, Sparkles, Zap, Calendar as CalendarIcon,
  MapPin, Heart, Users, Gift, Bus, PartyPopper, Camera, UtensilsCrossed, Clock, Globe2,
  BookHeart, HelpCircle, Baby, Film, Hotel, Shirt, MessageSquare, Mail, Phone, User,
  CheckCircle2, Loader2, Play, Search, ChevronDown, X,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";
import goldenHourThumbnail   from "@/assets/golden-hour-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import softLoveThumbnail     from "@/assets/soft-love-thumbnail.jpg";
import { COUNTRIES, type Country } from "@/lib/countries";

const GOLD      = "hsl(192 60% 24%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(192 60% 24%), hsl(192 55% 32%))";

const flagOf = (iso: string) =>
  iso.toUpperCase().replace(/./g, c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0)));

// ── Static data ──────────────────────────────────────────────────────────────
type PackageId = "essential" | "signature" | "luxe";
const PACKAGES: {
  id: PackageId; name: string; price: string; tagline: string; features: string[]; icon: typeof Crown; featured?: boolean;
}[] = [
  {
    id: "essential",
    name: "Essential",
    price: "$20",
    tagline: "A beautiful, polished invitation — delivered in days.",
    features: ["All templates", "Up to 3 revision rounds", "Standard 3–5 day delivery", "Email support"],
    icon: Sparkles,
  },
  {
    id: "signature",
    name: "Signature",
    price: "$50",
    tagline: "Our most-loved package — dedicated designer, unlimited revisions.",
    features: ["Everything in Essential", "Unlimited revisions", "Dedicated designer on WhatsApp", "Priority 48h delivery"],
    icon: Crown,
    featured: true,
  },
  {
    id: "luxe",
    name: "Luxe (Done For You)",
    price: "$299",
    tagline: "The whole invitation — concept to launch — handled by our team.",
    features: ["Everything in Signature", "Bespoke opening animation", "Custom couple portrait", "Express 24h delivery available"],
    icon: Palette,
  },
];

const TEMPLATES = [
  { id: "golden-hour",   src: goldenHourThumbnail,   name: "Golden Hour",   tag: "Warm · Sunset · Timeless" },
  { id: "garden-rose",   src: gardenRoseThumbnail,   name: "Garden Rose",   tag: "Romantic · Floral · Soft" },
  { id: "rustic-bloom",  src: rusticBloomThumbnail,  name: "Rustic Bloom",  tag: "Earthy · Botanical · Warm" },
  { id: "midnight-luxe", src: midnightLuxeThumbnail, name: "Midnight Luxe", tag: "Dark · Opulent · Grand" },
  { id: "soft-love",     src: softLoveThumbnail,     name: "Soft Love",     tag: "Intimate · Pastel · Pure" },
];

const ENVELOPES = [
  { id: "classic", name: "Classic",  desc: "Timeless wax-seal reveal" },
  { id: "modern",  name: "Modern",   desc: "Clean fold with gold trim" },
  { id: "vintage", name: "Vintage",  desc: "Textured paper, hand-tied" },
  { id: "floral",  name: "Floral",   desc: "Pressed-flower overlay" },
  { id: "minimal", name: "Minimal",  desc: "Monogram, zero clutter" },
];

type Badge = "popular" | "new" | null;
type SectionDef = { id: string; label: string; icon: typeof CalendarIcon; always?: boolean; badge?: Badge };

const SECTIONS: SectionDef[] = [
  // Always included
  { id: "date-location",   label: "Date & Location", icon: CalendarIcon, always: true },
  { id: "welcome",         label: "Welcome Message", icon: MessageSquare, always: true },
  { id: "rsvp",            label: "RSVP",            icon: CheckCircle2,  always: true },
  // Optional
  { id: "timeline",        label: "Event Timeline",  icon: Clock,          badge: "popular" },
  { id: "gifts",           label: "Gift List",       icon: Gift,           badge: null },
  { id: "transport",       label: "Transport",       icon: Bus,            badge: null },
  { id: "activities",      label: "Activities",      icon: PartyPopper,    badge: null },
  { id: "prewedding",      label: "Pre-wedding",     icon: Heart,          badge: null },
  { id: "accommodation",   label: "Accommodation",   icon: Hotel,          badge: null },
  { id: "dress-code",      label: "Dress Code",      icon: Shirt,          badge: "popular" },
  { id: "menu",            label: "Menu",            icon: UtensilsCrossed, badge: null },
  { id: "gallery",         label: "Photo Gallery",   icon: Camera,         badge: null },
  { id: "countdown",       label: "Countdown Timer", icon: Clock,          badge: "popular" },
  { id: "map",             label: "Google Map",      icon: MapPin,         badge: "popular" },
  { id: "love-story",      label: "Your Love Story", icon: BookHeart,      badge: null },
  { id: "faq",             label: "FAQ",             icon: HelpCircle,     badge: "popular" },
  { id: "childhood",       label: "Childhood Pictures", icon: Baby,        badge: "new" },
  { id: "video",           label: "Your Video",      icon: Film,           badge: null },
];

// Comprehensive language list — all commonly-spoken world languages (ISO 639)
const LANGUAGES = [
  "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Assamese", "Azerbaijani",
  "Basque", "Belarusian", "Bengali", "Bhojpuri", "Bosnian", "Bulgarian", "Burmese",
  "Catalan", "Cebuano", "Chichewa", "Chinese", "Chinese (Cantonese)", "Chinese (Simplified)",
  "Chinese (Traditional)", "Corsican", "Croatian", "Czech",
  "Danish", "Dari", "Dhivehi", "Dutch", "Dzongkha",
  "English", "Esperanto", "Estonian",
  "Faroese", "Fijian", "Filipino", "Finnish", "French", "Frisian",
  "Galician", "Georgian", "German", "Greek", "Gujarati",
  "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian",
  "Icelandic", "Igbo", "Ilocano", "Indonesian", "Irish", "Italian",
  "Japanese", "Javanese",
  "Kannada", "Kashmiri", "Kazakh", "Khmer", "Kinyarwanda", "Konkani", "Korean", "Kurdish", "Kyrgyz",
  "Lao", "Latin", "Latvian", "Lingala", "Lithuanian", "Luganda", "Luxembourgish",
  "Macedonian", "Maithili", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Meitei", "Mizo", "Mongolian",
  "Nepali", "Norwegian",
  "Odia (Oriya)",
  "Pashto", "Persian", "Polish", "Portuguese", "Portuguese (Brazilian)", "Punjabi",
  "Quechua",
  "Romanian", "Russian",
  "Samoan", "Sanskrit", "Scots Gaelic", "Sepedi", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian",
  "Somali", "Spanish", "Sundanese", "Swahili", "Swedish",
  "Tagalog", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Tigrinya", "Tsonga", "Turkish", "Turkmen", "Twi",
  "Ukrainian", "Urdu", "Uyghur", "Uzbek",
  "Vietnamese",
  "Welsh",
  "Xhosa",
  "Yiddish", "Yoruba",
  "Zulu",
];

const GUEST_RANGES = [
  { value: "Under 50",  display: "< 50",      sub: "intimate"   },
  { value: "50–100",    display: "50 – 100",  sub: "medium"     },
  { value: "100–200",   display: "100 – 200", sub: "big day"    },
  { value: "200–400",   display: "200 – 400", sub: "large"      },
  { value: "400+",      display: "400+",      sub: "grand"      },
];

const DELIVERY_SPEEDS: { id: "standard" | "express"; label: string; detail: string; icon: typeof Zap }[] = [
  { id: "standard", label: "Standard", detail: "3–5 days — our usual turnaround",    icon: Clock },
  { id: "express",  label: "Express",  detail: "24-hour priority delivery (+$30)",   icon: Zap   },
];

// ── Form state ────────────────────────────────────────────────────────────────
type OrderState = {
  package: PackageId | null;
  template: string | null;
  envelope: string | null;
  sections: string[]; // includes "always" IDs by default
  primaryLang: string;
  secondaryLang: string;
  customLang: string;
  guestCount: string;
  contactName: string;
  contactEmail: string;
  contactCountry: Country;
  contactPhone: string;
  eventDate: string;
  delivery: "standard" | "express" | null;
  designerNote: string;
};

const INITIAL: OrderState = {
  package: null,
  template: null,
  envelope: null,
  sections: SECTIONS.filter(s => s.always).map(s => s.id),
  primaryLang: "English",
  secondaryLang: "",
  customLang: "",
  guestCount: "",
  contactName: "",
  contactEmail: "",
  contactCountry: COUNTRIES.find(c => c.code === "US") ?? COUNTRIES[0],
  contactPhone: "",
  eventDate: "",
  delivery: null,
  designerNote: "",
};

type Action =
  | { type: "SET"; patch: Partial<OrderState> }
  | { type: "TOGGLE_SECTION"; id: string }
  | { type: "RESET" };

const reducer = (s: OrderState, a: Action): OrderState => {
  switch (a.type) {
    case "SET": return { ...s, ...a.patch };
    case "TOGGLE_SECTION": {
      const def = SECTIONS.find(x => x.id === a.id);
      if (def?.always) return s; // can't toggle required sections
      return s.sections.includes(a.id)
        ? { ...s, sections: s.sections.filter(x => x !== a.id) }
        : { ...s, sections: [...s.sections, a.id] };
    }
    case "RESET": return INITIAL;
  }
};

const STORAGE_KEY = "wed4love_order_draft_v1";

// ── Shared select indicator ──────────────────────────────────────────────────
// Empty teal-outlined circle when unselected, filled teal with white check when selected.
// Signals to users that a card is a toggleable choice they must make.
const SelectIndicator = ({ selected, size = "md" }: { selected: boolean; size?: "sm" | "md" }) => {
  const dim = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const iconDim = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <span
      className={`${dim} rounded-full flex items-center justify-center shrink-0 transition-all`}
      style={
        selected
          ? { background: GOLD, boxShadow: "0 2px 6px hsl(192 60% 24% / 0.25)", border: `2px solid ${GOLD}` }
          : { background: "white", border: "2px solid hsl(220 15% 82%)" }
      }
    >
      {selected && <Check className={`${iconDim} text-white`} strokeWidth={3} />}
    </span>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const STEP_LABELS = ["Package", "Design", "Sections", "Languages", "Guests", "Details", "Submit"];

const ProgressBar = ({ step }: { step: number }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-3">
      <p className="font-body text-[11px] tracking-[0.26em] uppercase font-bold" style={{ color: GOLD }}>
        Step {step + 1} of {STEP_LABELS.length}
      </p>
      <p className="font-body text-sm font-semibold" style={{ color: "hsl(220 20% 16%)" }}>
        {STEP_LABELS[step]}
      </p>
    </div>
    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "hsl(220 12% 93%)" }}>
      <motion.div
        animate={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: GOLD_GRAD }}
      />
    </div>
  </div>
);

// ── Step 1: Package ───────────────────────────────────────────────────────────
const Step1 = ({ state, dispatch }: { state: OrderState; dispatch: React.Dispatch<Action> }) => (
  <div>
    <StepHeader
      eyebrow="Pick your package"
      title="Which service level feels right?"
      subtitle="Try before you pay — you'll only be charged once you approve the final preview."
    />
    <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
      {PACKAGES.map(pkg => {
        const Icon = pkg.icon;
        const selected = state.package === pkg.id;
        return (
          <button
            key={pkg.id}
            type="button"
            onClick={() => dispatch({ type: "SET", patch: { package: pkg.id } })}
            className="relative text-left rounded-3xl p-6 transition-all hover:-translate-y-0.5"
            style={{
              background: "white",
              border: `2px solid ${selected ? GOLD : "hsl(220 12% 91%)"}`,
              boxShadow: selected
                ? "0 18px 44px hsl(192 60% 24% / 0.18)"
                : "0 4px 14px hsl(220 20% 20% / 0.06)",
            }}
          >
            {pkg.featured && (
              <div
                className="absolute -top-3 left-6 px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: GOLD_GRAD, boxShadow: "0 2px 6px hsl(220 20% 20% / 0.08)" }}
              >
                Most popular
              </div>
            )}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: GOLD_GRAD, boxShadow: "0 2px 8px hsl(220 20% 20% / 0.08)" }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-display font-bold text-lg text-foreground mb-1">{pkg.name}</p>
            <p className="font-display font-bold mb-3" style={{ color: GOLD, fontSize: "1.5rem" }}>{pkg.price}</p>
            <p className="font-body text-sm mb-4" style={{ color: "hsl(220 12% 44%)" }}>{pkg.tagline}</p>
            <ul className="flex flex-col gap-2">
              {pkg.features.map(f => (
                <li key={f} className="flex items-start gap-2 font-body text-xs" style={{ color: "hsl(220 15% 20%)" }}>
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GOLD }} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="absolute top-5 right-5">
              <SelectIndicator selected={selected} />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// ── Step 2: Template + envelope ───────────────────────────────────────────────
const Step2 = ({ state, dispatch }: { state: OrderState; dispatch: React.Dispatch<Action> }) => (
  <div>
    <StepHeader
      eyebrow="Choose your look"
      title="Pick a template and envelope"
      subtitle="You can tweak everything later — this is just a starting point for your designer."
    />
    <div className="mb-10">
      <p className="font-body text-sm md:text-base font-bold mb-4" style={{ color: "hsl(220 20% 16%)" }}>Template</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {TEMPLATES.map(t => {
          const selected = state.template === t.id;
          const choose = () => dispatch({ type: "SET", patch: { template: t.id } });
          return (
            <div
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={choose}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(); } }}
              aria-pressed={selected}
              className="group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[hsl(192_60%_24%)] h-[170px] md:h-[240px]"
              style={{
                border: `2.5px solid ${selected ? GOLD : "transparent"}`,
                boxShadow: selected ? "0 6px 14px hsl(192 60% 24% / 0.12)" : "0 4px 14px rgba(0,0,0,0.08)",
              }}
            >
              <img src={t.src} alt={t.name} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%)" }} />
              <div className="absolute bottom-2 md:bottom-3 left-2.5 md:left-3.5 right-2.5 md:right-3.5 text-left">
                <p className="font-display font-bold text-white text-xs md:text-base leading-tight">{t.name}</p>
                <p className="font-body text-[9px] md:text-[11px] leading-snug mt-0.5 md:mt-1" style={{ color: "rgba(255,255,255,0.72)" }}>{t.tag}</p>
              </div>

              {/* Preview chip — stops propagation so it doesn't also select */}
              <a
                href={`/invite/demo-wedding?theme=${t.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="absolute top-2 left-2 md:top-2.5 md:left-2.5 inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg font-body text-[10px] md:text-xs font-semibold transition-all md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100 hover:scale-105 active:scale-95"
                style={{ background: "rgba(255,255,255,0.92)", color: "hsl(220 20% 16%)", backdropFilter: "blur(6px)" }}
                aria-label={`Preview the ${t.name} template in a new tab`}
              >
                <Play className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" /> Preview
              </a>

              <div className="absolute top-2 right-2 md:top-2.5 md:right-2.5">
                <SelectIndicator selected={selected} />
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div>
      <p className="font-body text-sm md:text-base font-bold mb-4" style={{ color: "hsl(220 20% 16%)" }}>Envelope style</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {ENVELOPES.map(e => {
          const selected = state.envelope === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => dispatch({ type: "SET", patch: { envelope: e.id } })}
              className="relative rounded-2xl p-4 md:p-5 pr-10 md:pr-11 text-left transition-all hover:-translate-y-0.5"
              style={{
                background: selected ? "hsl(190 30% 97%)" : "white",
                border: `2px solid ${selected ? GOLD : "hsl(220 12% 91%)"}`,
                boxShadow: selected ? "0 4px 10px hsl(220 20% 20% / 0.07)" : "0 2px 8px hsl(220 20% 20% / 0.06)",
              }}
            >
              <p className="font-display font-bold text-sm md:text-base text-foreground mb-1 md:mb-1.5">
                {e.name}
              </p>
              <p className="font-body text-xs md:text-sm leading-snug" style={{ color: "hsl(220 12% 44%)" }}>{e.desc}</p>
              <div className="absolute top-3.5 right-3.5 md:top-4 md:right-4">
                <SelectIndicator selected={selected} size="sm" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ── Step 3: Sections grid ─────────────────────────────────────────────────────
const BadgePill = ({ badge }: { badge: Badge }) => {
  if (!badge) return null;
  const label = badge === "popular" ? "Popular" : "New";
  const bg = badge === "popular" ? "hsl(190 25% 93%)" : "hsl(140 60% 92%)";
  const fg = badge === "popular" ? "hsl(192 60% 28%)" : "hsl(140 50% 30%)";
  return (
    <span
      className="inline-flex items-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-body text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
};

const Step3 = ({ state, dispatch }: { state: OrderState; dispatch: React.Dispatch<Action> }) => {
  const always = SECTIONS.filter(s => s.always);
  const optional = SECTIONS.filter(s => !s.always);
  return (
    <div>
      <StepHeader
        eyebrow="Build your invitation"
        title="Which sections do you want?"
        subtitle="Three essentials are always included. Add any extras — you can change these later."
      />

      {/* Always included */}
      <div className="mb-10">
        <p className="font-body text-[11px] md:text-xs tracking-[0.22em] uppercase font-bold mb-4" style={{ color: GOLD }}>
          Always included · Free
        </p>
        <div className="grid sm:grid-cols-3 gap-3 md:gap-4">
          {always.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4"
                style={{
                  background: "linear-gradient(135deg, hsl(190 30% 97%) 0%, hsl(190 22% 94%) 100%)",
                  border: "1.5px solid hsl(190 22% 88%)",
                }}
              >
                <div
                  className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: GOLD_GRAD }}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm md:text-base text-foreground truncate">{s.label}</p>
                  <p className="font-body text-xs md:text-sm" style={{ color: "hsl(220 12% 44%)" }}>Pre-selected</p>
                </div>
                <Check className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: GOLD }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional add-ons */}
      <div>
        <p className="font-body text-[11px] md:text-xs tracking-[0.22em] uppercase font-bold mb-4" style={{ color: "hsl(220 12% 44%)" }}>
          Optional add-ons · Tap to toggle
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {optional.map(s => {
            const Icon = s.icon;
            const selected = state.sections.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_SECTION", id: s.id })}
                className="relative rounded-2xl p-3.5 md:p-4 flex flex-col items-start gap-2 md:gap-3 text-left transition-all hover:-translate-y-0.5"
                style={{
                  background: selected ? "hsl(190 30% 97%)" : "white",
                  border: `2px solid ${selected ? GOLD : "hsl(220 12% 91%)"}`,
                  boxShadow: selected ? "0 4px 10px hsl(220 20% 20% / 0.07)" : "0 2px 6px hsl(220 20% 20% / 0.05)",
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center"
                    style={{
                      background: selected ? GOLD_GRAD : "hsl(190 25% 96%)",
                      color: selected ? "white" : GOLD,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {s.badge && <BadgePill badge={s.badge} />}
                </div>
                <p className="font-display font-bold text-sm md:text-base text-foreground">{s.label}</p>
                <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3">
                  <SelectIndicator selected={selected} size="sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Step 4: Languages ─────────────────────────────────────────────────────────
const Step4 = ({ state, dispatch }: { state: OrderState; dispatch: React.Dispatch<Action> }) => (
  <div>
    <StepHeader
      eyebrow="Multilingual ready"
      title="Which languages do you need?"
      subtitle="Pick a primary — add a secondary if your families don't share one."
    />
    <div className="grid md:grid-cols-2 gap-6">
      <LanguageSelect
        label="Primary language"
        value={state.primaryLang}
        onChange={v => dispatch({ type: "SET", patch: { primaryLang: v } })}
      />
      <LanguageSelect
        label="Secondary language (optional)"
        value={state.secondaryLang}
        onChange={v => dispatch({ type: "SET", patch: { secondaryLang: v } })}
        allowNone
      />
    </div>

    <div
      className="mt-6 rounded-2xl p-5"
      style={{ background: "hsl(190 25% 97%)", border: "1px dashed hsl(192 25% 72%)" }}
    >
      <label htmlFor="customLang" className="block">
        <div className="flex items-center justify-between mb-2">
          <p className="font-body text-sm font-bold" style={{ color: "hsl(220 20% 16%)" }}>
            Don't see your language?
          </p>
          <span
            className="font-body text-[10px] uppercase tracking-[0.18em] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "white", color: "hsl(220 10% 50%)", border: "1px solid hsl(220 12% 88%)" }}
          >
            Optional
          </span>
        </div>
        <p className="font-body text-xs mb-3" style={{ color: "hsl(220 12% 42%)" }}>
          Type it here and we'll make sure it's included.
        </p>
        <input
          id="customLang"
          type="text"
          value={state.customLang}
          onChange={e => dispatch({ type: "SET", patch: { customLang: e.target.value } })}
          placeholder="e.g. Newari, Maithili, Yoruba…"
          className="w-full px-4 py-3 rounded-xl bg-white font-body text-sm outline-none transition-all"
          style={{
            border: "1.5px solid hsl(220 12% 88%)",
            color: "hsl(220 20% 16%)",
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = GOLD;
            e.currentTarget.style.boxShadow = "0 0 0 4px hsl(192 55% 32% / 0.14)";
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = "hsl(220 12% 88%)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </label>
    </div>
  </div>
);

const LanguageSelect = ({ label, value, onChange, allowNone }: {
  label: string; value: string; onChange: (v: string) => void; allowNone?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(l => l.toLowerCase().includes(q));
  }, [query]);

  return (
    <div ref={popRef}>
      <p className="font-body text-sm font-bold mb-3" style={{ color: "hsl(220 20% 16%)" }}>{label}</p>

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-white font-body text-sm transition-all"
          style={{
            border: `1.5px solid ${open ? GOLD : "hsl(220 12% 91%)"}`,
            boxShadow: open ? `0 0 0 4px hsl(192 55% 32% / 0.14)` : "0 1px 2px hsl(220 20% 20% / 0.04)",
            color: value ? "hsl(220 20% 16%)" : "hsl(220 10% 56%)",
          }}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Globe2 className="w-4 h-4 shrink-0" style={{ color: value ? GOLD : "hsl(220 10% 56%)" }} />
            <span className="truncate font-semibold">
              {value || (allowNone ? "None selected" : "Select a language…")}
            </span>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {value && allowNone && (
              <span
                role="button"
                tabIndex={0}
                onClick={e => { e.stopPropagation(); onChange(""); }}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onChange(""); } }}
                aria-label="Clear selection"
                className="p-0.5 rounded-full transition-colors hover:bg-amber-50"
                style={{ color: "hsl(220 10% 50%)" }}
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown className="w-4 h-4 transition-transform" style={{ color: "hsl(220 10% 50%)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
          </div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden"
              style={{ border: "1px solid hsl(220 12% 90%)" }}
            >
              <div className="relative px-3 py-2.5" style={{ borderBottom: "1px solid hsl(220 15% 93%)" }}>
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(220 10% 50%)" }} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search 120+ languages"
                  className="w-full pl-7 pr-2 py-1.5 text-sm font-body outline-none bg-transparent"
                  style={{ color: "hsl(220 20% 16%)" }}
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {allowNone && (
                  <button
                    type="button"
                    onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors"
                    style={{ color: "hsl(220 15% 20%)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "hsl(190 25% 97%)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="font-body italic" style={{ color: "hsl(220 10% 50%)" }}>None</span>
                    {value === "" && <Check className="w-4 h-4" style={{ color: GOLD }} />}
                  </button>
                )}
                {filtered.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted-foreground font-body">No languages match "{query}".</p>
                )}
                {filtered.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => { onChange(lang); setOpen(false); setQuery(""); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors"
                    style={{ color: "hsl(220 15% 20%)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "hsl(190 25% 97%)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="font-body">{lang}</span>
                    {value === lang && <Check className="w-4 h-4" style={{ color: GOLD }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Step 5: Guest count ───────────────────────────────────────────────────────
const Step5 = ({ state, dispatch }: { state: OrderState; dispatch: React.Dispatch<Action> }) => (
  <div>
    <StepHeader
      eyebrow="One link, any number"
      title="Roughly how many guests?"
      subtitle="Doesn't change the price — just helps us plan the layout and server-side scaling."
    />
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 mb-6">
      {GUEST_RANGES.map(range => {
        const selected = state.guestCount === range.value;
        return (
          <button
            key={range.value}
            type="button"
            onClick={() => dispatch({ type: "SET", patch: { guestCount: range.value } })}
            className="relative rounded-2xl py-5 md:py-7 px-3 md:px-4 flex flex-col items-center justify-center gap-1 md:gap-1.5 transition-all hover:-translate-y-0.5"
            style={{
              background: selected ? "hsl(190 30% 97%)" : "white",
              border: `2px solid ${selected ? GOLD : "hsl(220 12% 91%)"}`,
              boxShadow: selected ? "0 4px 10px hsl(220 20% 20% / 0.08)" : "0 2px 6px hsl(220 20% 20% / 0.05)",
            }}
          >
            <div className="absolute top-2.5 right-2.5">
              <SelectIndicator selected={selected} size="sm" />
            </div>
            <span
              className="font-display font-bold text-xl md:text-3xl leading-none tabular-nums tracking-tight"
              style={{ color: selected ? GOLD : "hsl(220 20% 16%)" }}
            >
              {range.display}
            </span>
            <span
              className="font-body text-[10px] md:text-xs uppercase tracking-widest font-semibold"
              style={{ color: selected ? GOLD : "hsl(220 10% 50%)" }}
            >
              {range.sub}
            </span>
          </button>
        );
      })}
    </div>
    <div className="flex items-start gap-3 rounded-2xl p-4 md:p-5" style={{ background: "hsl(190 25% 97%)", border: "1px solid hsl(190 20% 91%)" }}>
      <Users className="w-5 h-5 md:w-6 md:h-6 shrink-0" style={{ color: GOLD }} />
      <p className="font-body text-sm md:text-base" style={{ color: "hsl(220 15% 20%)" }}>
        No per-guest pricing. Send to 10 or 10,000 — same price, same link, same experience.
      </p>
    </div>
  </div>
);

// ── Step 6: Event + delivery details ─────────────────────────────────────────
const Field = ({ icon: Icon, children, label }: { icon: typeof User; label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "hsl(220 12% 44%)" }}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
    {children}
  </label>
);

const inputCls = "w-full px-4 py-3 rounded-xl font-body text-sm outline-none bg-white transition-all";
const inputStyle: React.CSSProperties = { border: "1.5px solid hsl(220 12% 91%)", color: "hsl(220 20% 16%)" };
const onFocusStyle = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = "0 0 0 4px hsl(192 55% 32% / 0.14)"; };
const onBlurStyle  = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "hsl(220 12% 91%)"; e.currentTarget.style.boxShadow = "none"; };

const Step6 = ({ state, dispatch }: { state: OrderState; dispatch: React.Dispatch<Action> }) => (
  <div>
    <StepHeader
      eyebrow="Almost there"
      title="How can we reach you?"
      subtitle="We'll send the preview and invoice to this email. No charges yet."
    />

    <div className="grid md:grid-cols-2 gap-5 mb-6">
      <Field icon={User} label="Full name">
        <input
          className={inputCls}
          style={inputStyle}
          type="text"
          value={state.contactName}
          onChange={e => dispatch({ type: "SET", patch: { contactName: e.target.value } })}
          onFocus={onFocusStyle}
          onBlur={onBlurStyle}
          placeholder="Priya Sharma"
          autoComplete="name"
        />
      </Field>
      <Field icon={Mail} label="Email">
        <input
          className={inputCls}
          style={inputStyle}
          type="email"
          value={state.contactEmail}
          onChange={e => dispatch({ type: "SET", patch: { contactEmail: e.target.value } })}
          onFocus={onFocusStyle}
          onBlur={onBlurStyle}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>
      <Field icon={Phone} label="Phone">
        <div
          className="flex items-stretch rounded-xl bg-white"
          style={{ border: "1.5px solid hsl(220 12% 91%)" }}
          onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 4px hsl(192 55% 32% / 0.14)`)}
          onBlur={e => (e.currentTarget.style.boxShadow = "none")}
        >
          <CountryTrigger
            country={state.contactCountry}
            onChange={c => dispatch({ type: "SET", patch: { contactCountry: c } })}
          />
          <input
            type="tel"
            inputMode="numeric"
            value={state.contactPhone}
            onChange={e => dispatch({ type: "SET", patch: { contactPhone: e.target.value.replace(/[^\d\s-]/g, "") } })}
            placeholder="Phone number"
            className="flex-1 px-3.5 py-3 rounded-r-xl font-body text-sm outline-none bg-transparent"
            style={{ color: "hsl(220 20% 16%)" }}
            autoComplete="tel-national"
          />
        </div>
      </Field>
      <Field icon={CalendarIcon} label="Event date">
        <input
          className={inputCls}
          style={inputStyle}
          type="date"
          value={state.eventDate}
          onChange={e => dispatch({ type: "SET", patch: { eventDate: e.target.value } })}
          onFocus={onFocusStyle}
          onBlur={onBlurStyle}
        />
      </Field>
    </div>

    <p className="font-body text-sm md:text-base font-bold mb-3" style={{ color: "hsl(220 20% 16%)" }}>Delivery speed</p>
    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
      {DELIVERY_SPEEDS.map(d => {
        const Icon = d.icon;
        const selected = state.delivery === d.id;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => dispatch({ type: "SET", patch: { delivery: d.id } })}
            className="rounded-2xl p-5 md:p-6 text-left flex items-start gap-3 md:gap-4 transition-all hover:-translate-y-0.5"
            style={{
              background: selected ? "hsl(190 30% 97%)" : "white",
              border: `2px solid ${selected ? GOLD : "hsl(220 12% 91%)"}`,
              boxShadow: selected ? "0 4px 10px hsl(220 20% 20% / 0.08)" : "0 2px 6px hsl(220 20% 20% / 0.05)",
            }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0" style={{ background: selected ? GOLD_GRAD : "hsl(190 25% 96%)", color: selected ? "white" : GOLD }}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-base md:text-lg text-foreground mb-0.5 md:mb-1">{d.label}</p>
              <p className="font-body text-sm md:text-base leading-snug" style={{ color: "hsl(220 15% 34%)" }}>{d.detail}</p>
            </div>
            <div className="shrink-0 mt-0.5">
              <SelectIndicator selected={selected} />
            </div>
          </button>
        );
      })}
    </div>

    {/* ── Note for the designer (optional) ── */}
    <div className="mt-8 md:mt-10">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="designer-note" className="flex items-center gap-1.5 font-body text-sm md:text-base font-bold" style={{ color: "hsl(220 20% 16%)" }}>
          <MessageSquare className="w-4 h-4" style={{ color: GOLD }} />
          A note for your designer
          <span className="font-normal text-xs md:text-sm ml-1.5" style={{ color: "hsl(220 10% 54%)" }}>
            (optional)
          </span>
        </label>
        <span className="font-body text-xs tabular-nums" style={{ color: "hsl(220 10% 54%)" }}>
          {state.designerNote.length}/500
        </span>
      </div>
      <textarea
        id="designer-note"
        value={state.designerNote}
        onChange={e => dispatch({ type: "SET", patch: { designerNote: e.target.value.slice(0, 500) } })}
        placeholder="Anything we should know? Favourite colours, cultural traditions to honour, a photo style you love, a surname spelling that always gets missed…"
        rows={4}
        className="w-full px-4 py-3 md:px-5 md:py-4 rounded-2xl font-body text-sm md:text-base outline-none bg-white resize-y transition-all leading-relaxed"
        style={{ border: "1.5px solid hsl(220 12% 91%)", color: "hsl(220 20% 16%)", minHeight: 110 }}
        onFocus={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = "0 0 0 4px hsl(192 55% 32% / 0.14)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "hsl(220 12% 91%)"; e.currentTarget.style.boxShadow = "none"; }}
      />
      <p className="font-body text-xs md:text-sm mt-2 leading-relaxed" style={{ color: "hsl(220 10% 50%)" }}>
        Your designer reads every note before the first draft. The more context, the fewer revision rounds.
      </p>
    </div>
  </div>
);

// ── Country trigger (simplified inline) ──────────────────────────────────────
const CountryTrigger = ({ country, onChange }: { country: Country; onChange: (c: Country) => void }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q.replace(/^\+/, "")));
  }, [query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change country code (currently ${country.name}, +${country.dial})`}
        className="flex items-center gap-1.5 pl-3 pr-2.5 py-3 rounded-l-xl font-body text-sm font-semibold transition-colors"
        style={{
          color: "hsl(220 18% 18%)",
          borderRight: "1.5px solid hsl(220 12% 91%)",
          background: open ? "hsl(190 25% 97%)" : "transparent",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "hsl(190 25% 97%)")}
        onMouseLeave={e => (e.currentTarget.style.background = open ? "hsl(190 25% 97%)" : "transparent")}
      >
        <span className="text-base leading-none">{flagOf(country.code)}</span>
        <span className="text-xs tabular-nums">+{country.dial}</span>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform"
          style={{ color: "hsl(220 10% 50%)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1 w-72 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden"
              style={{ border: "1px solid hsl(220 12% 90%)" }}
            >
              <div className="px-3 py-2" style={{ borderBottom: "1px solid hsl(220 15% 93%)" }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search country"
                  className="w-full px-2 py-1 text-sm font-body outline-none bg-transparent"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {filtered.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { onChange(c); setOpen(false); setQuery(""); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left"
                    onMouseEnter={e => (e.currentTarget.style.background = "hsl(190 25% 97%)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-lg">{flagOf(c.code)}</span>
                    <span className="flex-1 font-body truncate">{c.name}</span>
                    <span className="font-body text-xs font-semibold" style={{ color: "hsl(220 10% 50%)" }}>+{c.dial}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Step 7: Review + submit ──────────────────────────────────────────────────
const Step7 = ({ state, onSubmit, submitting }: { state: OrderState; onSubmit: () => void; submitting: boolean }) => {
  const pkg = PACKAGES.find(p => p.id === state.package);
  const tpl = TEMPLATES.find(t => t.id === state.template);
  const env = ENVELOPES.find(e => e.id === state.envelope);
  const sectionLabels = state.sections
    .map(id => SECTIONS.find(s => s.id === id)?.label)
    .filter(Boolean);

  return (
    <div>
      <StepHeader
        eyebrow="Final review"
        title="Submit your order — no payment yet"
        subtitle="Our designer builds your invitation, emails you a preview + invoice, and you only pay if you love it."
      />

      <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
        <SummaryBlock label="Package" value={pkg?.name ?? "—"} />
        <SummaryBlock label="Template & Envelope" value={`${tpl?.name ?? "—"} · ${env?.name ?? "—"}`} />
        <SummaryBlock label="Languages" value={[state.primaryLang, state.secondaryLang, state.customLang.trim()].filter(Boolean).join(" + ")} />
        <SummaryBlock label="Guests" value={state.guestCount || "—"} />
        <SummaryBlock label="Event date" value={state.eventDate || "—"} />
        <SummaryBlock label="Delivery" value={state.delivery ? (state.delivery === "express" ? "Express 24h" : "Standard 3–5 days") : "—"} />
      </div>

      <div className="mb-6 md:mb-8">
        <p className="font-body text-xs md:text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "hsl(220 12% 44%)" }}>
          Sections included
        </p>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {sectionLabels.map(l => (
            <span key={l} className="inline-flex items-center px-3 md:px-4 py-1 md:py-1.5 rounded-full font-body text-xs md:text-sm font-semibold"
              style={{ background: "white", color: "hsl(220 15% 20%)", border: "1.5px solid hsl(220 12% 88%)" }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {state.designerNote.trim() && (
        <div
          className="mb-6 md:mb-8 rounded-2xl p-5 md:p-6"
          style={{ background: "white", border: "1.5px solid hsl(220 12% 93%)" }}
        >
          <p className="flex items-center gap-1.5 font-body text-xs md:text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "hsl(220 12% 44%)" }}>
            <MessageSquare className="w-3.5 h-3.5" style={{ color: GOLD }} />
            Note for your designer
          </p>
          <p className="font-body text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(220 15% 20%)" }}>
            {state.designerNote.trim()}
          </p>
        </div>
      )}

      {/* No-risk policy card */}
      <div
        className="relative rounded-3xl p-6 sm:p-7 md:p-8 mb-6 md:mb-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(190 30% 97%) 0%, hsl(190 22% 94%) 100%)",
          border: "1.5px solid hsl(190 22% 88%)",
        }}
      >
        <div className="flex items-start gap-4 md:gap-5">
          <div
            className="shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-2xl flex items-center justify-center"
            style={{ background: GOLD_GRAD, boxShadow: "0 2px 8px hsl(220 20% 20% / 0.08)" }}
          >
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
          </div>
          <div>
            <p className="font-display font-bold text-lg md:text-xl text-foreground mb-1 md:mb-1.5">No credit card, no risk</p>
            <p className="font-body text-sm md:text-base leading-relaxed" style={{ color: "hsl(220 15% 30%)" }}>
              Submit your order now — our designer will construct your customized invitation and send a preview + invoice via email.
              <span className="block mt-1.5 font-semibold" style={{ color: GOLD }}>Pay only if you like the final invitation.</span>
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full py-4 md:py-5 rounded-2xl font-body text-sm md:text-base font-bold uppercase tracking-wider text-white transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-70"
        style={{ background: GOLD_GRAD, letterSpacing: "0.14em", boxShadow: "0 5px 14px hsl(192 60% 24% / 0.12)" }}
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Submitting…
          </span>
        ) : "Submit order"}
      </button>
    </div>
  );
};

const SummaryBlock = ({ label, value }: { label: string; value: string }) => (
  <div
    className="rounded-2xl p-4 md:p-5"
    style={{ background: "white", border: "1.5px solid hsl(220 12% 93%)" }}
  >
    <p className="font-body text-[11px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-1.5" style={{ color: "hsl(220 12% 44%)" }}>{label}</p>
    <p className="font-display font-bold text-sm md:text-lg text-foreground truncate">{value}</p>
  </div>
);

// ── Shared ────────────────────────────────────────────────────────────────────
const StepHeader = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) => (
  <div className="mb-8">
    <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
      {eyebrow}
    </p>
    <h2 className="font-display font-bold text-foreground mb-2" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)" }}>
      {title}
    </h2>
    <p className="font-body text-sm max-w-xl" style={{ color: "hsl(220 12% 44%)" }}>{subtitle}</p>
  </div>
);

// ── Confirmation screen ──────────────────────────────────────────────────────
const Confirmation = ({ email }: { email: string }) => (
  <div className="max-w-2xl mx-auto text-center">
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
      style={{ background: GOLD_GRAD, boxShadow: "0 6px 16px hsl(192 60% 24% / 0.14)" }}
    >
      <CheckCircle2 className="w-10 h-10 text-white" />
    </motion.div>
    <h1 className="font-display font-bold mb-4" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "hsl(220 25% 10%)" }}>
      Thank you!
    </h1>
    <p className="font-body text-base sm:text-lg leading-relaxed mb-3" style={{ color: "hsl(220 12% 38%)" }}>
      Your order has been submitted. Our designer will construct your customized invitation.
    </p>
    <p className="font-body text-base sm:text-lg leading-relaxed mb-6" style={{ color: "hsl(220 12% 38%)" }}>
      You'll receive the invitation preview and invoice directly via email{email ? <> at <span className="font-semibold text-foreground">{email}</span></> : null}.
    </p>
    <p className="font-display italic text-xl mb-10" style={{ color: GOLD }}>
      Pay only if you like the final invitation.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-body text-sm font-semibold text-white transition-all hover:opacity-95 active:scale-[0.98]"
        style={{ background: GOLD_GRAD, boxShadow: "0 4px 12px hsl(192 60% 24% / 0.12)" }}
      >
        Back to home
      </Link>
      <Link
        to="/#reviews"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-body text-sm font-semibold transition-colors"
        style={{ color: GOLD, border: "1.5px solid hsl(192 25% 72%)" }}
      >
        Read other reviews
      </Link>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const canAdvance = (step: number, s: OrderState): string | null => {
  switch (step) {
    case 0: return s.package ? null : "Pick a package to continue.";
    case 1: return s.template && s.envelope ? null : "Pick a template and envelope to continue.";
    case 2: return null; // sections always valid (3 required already selected)
    case 3: return s.primaryLang ? null : "Pick a primary language.";
    case 4: return s.guestCount ? null : "Pick an estimated guest count.";
    case 5: {
      if (!s.contactName.trim()) return "Please enter your name.";
      if (!/.+@.+\..+/.test(s.contactEmail)) return "Please enter a valid email.";
      if (s.contactPhone.replace(/\D/g, "").length < 6) return "Please enter a valid phone number.";
      if (!s.eventDate) return "Please pick your event date.";
      if (!s.delivery) return "Please pick a delivery speed.";
      return null;
    }
    default: return null;
  }
};

const OrderWizard = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL, init => {
    if (typeof window === "undefined") return init;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return init;
      const parsed = JSON.parse(raw);
      // Make sure contactCountry hydrates to a proper Country record
      const country = COUNTRIES.find(c => c.code === parsed?.contactCountry?.code) ?? init.contactCountry;
      return { ...init, ...parsed, contactCountry: country };
    } catch { return init; }
  });

  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Preselect package from ?pkg= query param (or localStorage fallback)
  useEffect(() => {
    const raw = searchParams.get("pkg") ?? (typeof window !== "undefined" ? localStorage.getItem("selected_package") : null);
    if (!raw) return;
    const valid: PackageId[] = ["essential", "signature", "luxe"];
    if ((valid as string[]).includes(raw) && state.package !== raw) {
      dispatch({ type: "SET", patch: { package: raw as PackageId } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Prefill from auth
  useEffect(() => {
    if (!user) return;
    const name = (user.user_metadata?.full_name as string | undefined) ?? "";
    const email = user.email ?? "";
    dispatch({ type: "SET", patch: {
      contactName: state.contactName || name,
      contactEmail: state.contactEmail || email,
    } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Persist draft
  useEffect(() => {
    if (submitted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full */ }
  }, [state, submitted]);

  const goNext = () => {
    const err = canAdvance(step, state);
    if (err) { setNotice(err); return; }
    setNotice(null);
    if (step < STEP_LABELS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const goPrev = () => {
    setNotice(null);
    if (step === 0) { navigate(-1); return; }
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      user_id: user?.id ?? null,
      package: state.package,
      template: state.template,
      envelope: state.envelope,
      sections: state.sections,
      primary_language: state.primaryLang,
      secondary_language: state.secondaryLang || null,
      custom_language: state.customLang.trim() || null,
      guest_count: state.guestCount,
      contact_name: state.contactName,
      contact_email: state.contactEmail,
      contact_phone: `+${state.contactCountry.dial}${state.contactPhone.replace(/\D/g, "")}`,
      event_date: state.eventDate,
      delivery_speed: state.delivery,
      designer_note: state.designerNote.trim() || null,
      submitted_at: new Date().toISOString(),
    };

    // TODO (Lovable): wire this up to insert into Supabase table `invitation_orders`
    // and trigger a confirmation + designer-notification email via an Edge Function.
    // Prompt for Lovable:
    //   "Create a Supabase table `invitation_orders` matching the payload shape in
    //    src/pages/Order.tsx handleSubmit, add RLS so a user can only read their own
    //    rows, and send a confirmation email to the user + a Slack-style ping to
    //    wed4loveglobal@gmail.com on new insert."
    console.info("[Order] Submitting:", payload);

    await new Promise(r => setTimeout(r, 900)); // UX: feel like something's happening

    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setSubmitting(false);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen pt-24 sm:pt-28 pb-24 px-4"
      style={{ background: "linear-gradient(180deg, hsl(0 0% 99.5%) 0%, hsl(190 20% 96%) 100%)" }}
    >
      <Seo title="Build your invitation — Wed4Love" description="Try before you pay — build your custom digital wedding invitation in minutes." path="/order" />

      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="font-display font-bold text-xl tracking-tight" style={{ color: GOLD }}>
            Wed4Love
          </Link>
          {!submitted && (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 font-body text-sm font-semibold transition-opacity hover:opacity-60"
              style={{ color: "hsl(220 10% 50%)" }}
            >
              <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Back" : "Previous"}
            </button>
          )}
        </div>

        {submitted ? (
          <Confirmation email={state.contactEmail} />
        ) : (
          <>
            <ProgressBar step={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10"
              >
                {step === 0 && <Step1 state={state} dispatch={dispatch} />}
                {step === 1 && <Step2 state={state} dispatch={dispatch} />}
                {step === 2 && <Step3 state={state} dispatch={dispatch} />}
                {step === 3 && <Step4 state={state} dispatch={dispatch} />}
                {step === 4 && <Step5 state={state} dispatch={dispatch} />}
                {step === 5 && <Step6 state={state} dispatch={dispatch} />}
                {step === 6 && <Step7 state={state} onSubmit={handleSubmit} submitting={submitting} />}
              </motion.div>
            </AnimatePresence>

            {notice && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 px-4 py-3 rounded-xl font-body text-sm"
                style={{ background: "hsl(0 80% 96%)", color: "hsl(0 65% 40%)", border: "1px solid hsl(0 70% 88%)" }}
              >
                {notice}
              </motion.div>
            )}

            {step < 6 && (
              <div className="flex items-center justify-between mt-10">
                <button
                  onClick={goPrev}
                  className="font-body text-sm font-semibold px-5 py-3 rounded-2xl transition-colors"
                  style={{ color: "hsl(220 18% 18%)", background: "white", border: "1.5px solid hsl(220 12% 90%)" }}
                >
                  <ArrowLeft className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                  {step === 0 ? "Back" : "Previous"}
                </button>
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 font-body text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-2xl text-white transition-all hover:opacity-95 active:scale-[0.98]"
                  style={{ background: GOLD_GRAD, letterSpacing: "0.14em", boxShadow: "0 4px 12px hsl(192 60% 24% / 0.12)" }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderWizard;
