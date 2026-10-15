import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Palette, PenTool, Languages, Code2, Headphones,
  Heart, Globe, Clock, Users, ArrowRight, Quote, Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";

const GOLD      = "hsl(192 60% 24%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(192 60% 24%), hsl(192 55% 32%))";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

type Member = {
  name: string;
  role: string;
  shortRole: string;
  icon: typeof Palette;
  city: string;
  flag: string;
  years: string;
  photo: string;
  quote: string;
  specialties: string[];
};

const TEAM: Member[] = [
  {
    name: "Aria Patel",
    role: "UI/UX Lead",
    shortRole: "Design systems · Interaction",
    icon: Palette,
    city: "Lisbon",
    flag: "🇵🇹",
    years: "9 yrs",
    photo: "https://i.pravatar.cc/600?img=47",
    quote: "Interface is empathy made visible. Every tap, every pause — I design them so the moment feels effortless, never engineered.",
    specialties: ["Design systems", "Motion", "Accessibility"],
  },
  {
    name: "Isabella Rossi",
    role: "Web Wedding Invitation Designer",
    shortRole: "Art direction · Visual identity",
    icon: PenTool,
    city: "Milan",
    flag: "🇮🇹",
    years: "11 yrs",
    photo: "https://i.pravatar.cc/600?img=45",
    quote: "I treat your invitation like a love letter you'd keep in a drawer forever — paper weight, ink, every curl of a swash.",
    specialties: ["Typography", "Color story", "Editorial layouts"],
  },
  {
    name: "Noor Al-Mansoori",
    role: "Content & Localization Specialist",
    shortRole: "Copywriting · 7 languages",
    icon: Languages,
    city: "Dubai",
    flag: "🇦🇪",
    years: "7 yrs",
    photo: "https://i.pravatar.cc/600?img=16",
    quote: "Translation isn't about words — it's about carrying feeling across cultures. The warmth has to arrive intact.",
    specialties: ["Arabic", "Hindi", "English", "Spanish"],
  },
  {
    name: "Kenji Nakamura",
    role: "Front-end Developer / Integrator",
    shortRole: "React · Performance",
    icon: Code2,
    city: "Kyoto",
    flag: "🇯🇵",
    years: "10 yrs",
    photo: "https://i.pravatar.cc/600?img=12",
    quote: "Good code should disappear. All you should feel is the invitation — not the browser, not the loader, not the API.",
    specialties: ["React", "Supabase", "Perf tuning"],
  },
  {
    name: "Sofía García",
    role: "Client Success & Support",
    shortRole: "WhatsApp-first · 24/7",
    icon: Headphones,
    city: "Buenos Aires",
    flag: "🇦🇷",
    years: "6 yrs",
    photo: "https://i.pravatar.cc/600?img=48",
    quote: "Weddings have no snooze button. We don't either. Message me at 3am two days before the wedding — I'll answer.",
    specialties: ["WhatsApp", "Project mgmt", "Crisis fixes"],
  },
];

const STATS = [
  { value: "1,693+", label: "Invitations crafted" },
  { value: "7",       label: "Languages spoken in-house" },
  { value: "13",      label: "Countries represented" },
  { value: "~2h",     label: "Average response time" },
];

const WORKFLOW: { step: string; title: string; who: string; icon: typeof Palette; desc: string }[] = [
  { step: "01", title: "Discovery call",      who: "Aria",     icon: Users,       desc: "A 20-minute conversation about your story, your families, and the feeling you want guests to open to." },
  { step: "02", title: "Design & concept",    who: "Isabella", icon: PenTool,     desc: "First visual direction in 48 hours — colour, type, imagery. Yours to react to, not approve." },
  { step: "03", title: "Copy & translation",  who: "Noor",     icon: Languages,   desc: "Every section written in your voice, then localized for every guest group — no awkward literal translations." },
  { step: "04", title: "Build & integration", who: "Kenji",    icon: Code2,       desc: "Hand-tuned front-end: 3D envelope, live RSVP, map, music — all in a single link that loads instantly." },
  { step: "05", title: "Launch & lifetime support", who: "Sofía", icon: Headphones, desc: "Live walk-through on launch day, then unlimited edits — right up to the morning you say I do." },
];

// ── Member Card ──────────────────────────────────────────────────────────────
const MemberCard = ({ m, featured }: { m: Member; featured?: boolean }) => {
  const Icon = m.icon;
  return (
    <motion.article
      {...fade()}
      className="group relative rounded-3xl overflow-hidden bg-white transition-all hover:-translate-y-1"
      style={{
        border: "1.5px solid hsl(220 12% 91%)",
        boxShadow: "0 6px 18px hsl(220 20% 20% / 0.07)",
      }}
    >
      {/* Portrait */}
      <div className="relative overflow-hidden" style={{ aspectRatio: featured ? "16/11" : "4/5" }}>
        <img
          src={m.photo}
          alt={`${m.name}, ${m.role}`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(28,20,10,0.70) 0%, rgba(28,20,10,0.08) 35%, transparent 60%)" }}
        />

        {/* Role badge top-left */}
        <div
          className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-body text-[10px] md:text-[11px] font-bold uppercase tracking-wider"
          style={{ background: "rgba(255,255,255,0.95)", color: "hsl(220 20% 16%)", backdropFilter: "blur(6px)" }}
        >
          <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" style={{ color: GOLD }} />
          {m.shortRole}
        </div>

        {/* City flag top-right */}
        <div
          className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-body text-[11px] font-semibold"
          style={{ background: "rgba(255,255,255,0.9)", color: "hsl(220 15% 20%)", backdropFilter: "blur(6px)" }}
        >
          <span className="text-sm leading-none" aria-hidden>{m.flag}</span>
          {m.city}
        </div>

        {/* Name block over image */}
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <p className="font-display font-bold leading-tight" style={{ fontSize: featured ? "clamp(1.5rem, 2.6vw, 2.2rem)" : "clamp(1.25rem, 2vw, 1.6rem)" }}>
            {m.name}
          </p>
          <p className="font-body text-[11px] md:text-xs tracking-[0.22em] uppercase font-semibold mt-1" style={{ color: "hsl(192 40% 78%)" }}>
            {m.role}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-7">
        <div className="flex items-start gap-2.5 mb-5">
          <Quote className="w-4 h-4 shrink-0 mt-1" style={{ color: GOLD, transform: "scaleX(-1)" }} />
          <p className="font-body text-sm md:text-base leading-relaxed italic" style={{ color: "hsl(220 15% 26%)" }}>
            {m.quote}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid hsl(220 12% 92%)" }}>
          <div className="flex flex-wrap gap-1.5">
            {m.specialties.map(s => (
              <span
                key={s}
                className="inline-flex items-center px-2.5 py-1 rounded-full font-body text-[10px] md:text-[11px] font-semibold"
                style={{ background: "hsl(190 25% 96%)", color: "hsl(220 15% 30%)" }}
              >
                {s}
              </span>
            ))}
          </div>
          <span className="font-body text-xs font-bold tabular-nums shrink-0 ml-2" style={{ color: GOLD }}>
            {m.years}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

// ── Workflow step ────────────────────────────────────────────────────────────
const WorkflowStep = ({ w, index }: { w: typeof WORKFLOW[0]; index: number }) => {
  const Icon = w.icon;
  return (
    <motion.div
      {...fade(0.05 + index * 0.08)}
      className="relative rounded-2xl p-5 md:p-6 flex flex-col gap-3 bg-white"
      style={{ border: "1.5px solid hsl(220 12% 91%)", boxShadow: "0 4px 18px hsl(38 50% 35% / 0.05)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-display font-bold text-xs md:text-sm px-2 py-1 rounded-md"
          style={{ background: "hsl(190 25% 96%)", color: GOLD, letterSpacing: "0.08em" }}
        >
          {w.step}
        </span>
        <div
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
          style={{ background: GOLD_GRAD, boxShadow: "0 2px 6px hsl(220 20% 20% / 0.08)" }}
        >
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
      </div>
      <div>
        <p className="font-display font-bold text-base md:text-lg text-foreground leading-tight">
          {w.title}
        </p>
        <p className="font-body text-xs md:text-sm font-semibold mt-0.5" style={{ color: GOLD }}>
          Led by {w.who}
        </p>
      </div>
      <p className="font-body text-sm leading-relaxed" style={{ color: "hsl(220 15% 30%)" }}>
        {w.desc}
      </p>
    </motion.div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Team = () => (
  <div
    className="min-h-screen"
    style={{ background: "linear-gradient(180deg, hsl(0 0% 99.5%) 0%, hsl(190 20% 96%) 100%)" }}
  >
    <Seo
      title="Meet the Team — Wed4Love"
      description="The humans behind your invitation. Designers, developers, writers and client-success specialists who craft every Wed4Love wedding invitation by hand."
      path="/team"
    />
    <Header />

    {/* ── Hero ── */}
    <section className="relative pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(192 35% 82% / 0.35) 0%, transparent 65%)", filter: "blur(60px)" }} />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.p
          {...fade()}
          className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-5"
          style={{ color: GOLD }}
        >
          Meet the Team
        </motion.p>

        <motion.h1
          {...fade(0.05)}
          className="font-display leading-[1.03] mb-7 tracking-[-0.01em]"
          style={{ fontSize: "clamp(2rem, 5vw, 4.4rem)", color: "hsl(220 25% 10%)", fontWeight: 500 }}
        >
          The humans behind
          <br />
          <span
            className="font-handwritten font-normal"
            style={{
              color: "hsl(192 55% 32%)",
              fontSize: "1.1em",
              lineHeight: 1.25,
              display: "inline-block",
              paddingBottom: "0.2em",
            }}
          >
            your invitation.
          </span>
        </motion.h1>

        <motion.p
          {...fade(0.1)}
          className="font-body leading-[1.7] max-w-2xl mx-auto"
          style={{ fontSize: "clamp(1rem, 1.3vw, 1.1rem)", color: "hsl(220 12% 38%)" }}
        >
          Not a template factory. A tight, international team of five who hand-craft every invitation — from first sketch to the morning of your wedding.
        </motion.p>

        {/* Avatar strip under hero */}
        <motion.div
          {...fade(0.15)}
          className="mt-10 inline-flex items-center justify-center"
        >
          <div className="flex -space-x-3">
            {TEAM.map((m, idx) => (
              <img
                key={m.name}
                src={m.photo}
                alt=""
                aria-hidden
                className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-[3px] border-white"
                style={{ zIndex: TEAM.length - idx, boxShadow: "0 4px 12px rgba(14,30,45,0.18)" }}
              />
            ))}
          </div>
          <div className="ml-5 text-left">
            <p className="font-body text-sm font-semibold" style={{ color: "hsl(220 20% 14%)" }}>
              5 specialists · 5 cities · one shared obsession.
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: "hsl(220 10% 50%)" }}>
              Make an invitation couples remember forever.
            </p>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── Stats strip ── */}
    <section className="px-4 pb-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          {...fade()}
          className="rounded-3xl py-7 px-5 md:py-8 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4"
          style={{
            background: `linear-gradient(135deg, hsl(220 28% 8%) 0%, hsl(220 25% 15%) 100%)`,
            boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
          }}
        >
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p
                className="font-display font-bold leading-none mb-1.5 tabular-nums"
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  background: `linear-gradient(135deg, hsl(192 45% 70%) 0%, hsl(192 55% 32%) 100%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </p>
              <p className="font-body text-[10px] md:text-xs uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.68)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── Team: 2 featured on top, 3 on bottom ── */}
    <section className="py-20 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fade()} className="text-center mb-12 md:mb-16">
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
            The Five
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Five people. One obsession.
          </h2>
          <p className="font-body text-sm md:text-base max-w-xl mx-auto" style={{ color: "hsl(220 12% 44%)" }}>
            Each specialist runs point on their craft — then everyone shows up for your invitation.
          </p>
        </motion.div>

        {/* Featured row — 2 columns */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <MemberCard m={TEAM[0]} featured />
          <MemberCard m={TEAM[1]} featured />
        </div>

        {/* Supporting row — 3 columns */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <MemberCard m={TEAM[2]} />
          <MemberCard m={TEAM[3]} />
          <MemberCard m={TEAM[4]} />
        </div>
      </div>
    </section>

    {/* ── Workflow ── */}
    <section className="py-20 sm:py-24 px-4" style={{ background: "hsl(190 22% 97%)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div {...fade()} className="text-center mb-12 md:mb-16">
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
            How we work with you
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            A relay of five hands,<br className="hidden sm:inline" /> never a hand-off.
          </h2>
          <p className="font-body text-sm md:text-base max-w-xl mx-auto" style={{ color: "hsl(220 12% 44%)" }}>
            From first call to launch day — here's who you'll meet and when.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {WORKFLOW.map((w, i) => (
            <WorkflowStep key={w.step} w={w} index={i} />
          ))}
        </div>
      </div>
    </section>

    {/* ── Values card ── */}
    <section className="py-20 sm:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          {...fade()}
          className="relative rounded-[2rem] overflow-hidden p-8 sm:p-12 md:p-14"
          style={{
            background: "linear-gradient(145deg, hsl(190 30% 97%) 0%, hsl(190 22% 94%) 100%)",
            border: "1.5px solid hsl(190 22% 88%)",
            boxShadow: "0 10px 30px hsl(220 20% 15% / 0.06)",
          }}
        >
          <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(192 45% 70% / 0.35) 0%, transparent 65%)", filter: "blur(10px)" }} />

          <div className="relative text-center max-w-2xl mx-auto">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
              style={{ background: GOLD_GRAD, boxShadow: "0 8px 22px hsl(192 55% 32% / 0.35)" }}
            >
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-4 leading-tight">
              We only accept 40 weddings a month.
            </h3>
            <p className="font-body text-base md:text-lg leading-relaxed" style={{ color: "hsl(220 15% 30%)" }}>
              A small team can only do so much before quality quietly slips. We cap intake every month so your designer stays obsessive about your invitation, not spread thin across hundreds.
            </p>
            <div className="mt-6 inline-flex items-center gap-6 font-body text-xs md:text-sm font-semibold" style={{ color: "hsl(220 15% 20%)" }}>
              <span className="inline-flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" style={{ color: GOLD }} /> Global · remote-first</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" style={{ color: GOLD }} /> Timezone-adjusted</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} /> Hand-crafted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="py-20 sm:py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.p
          {...fade()}
          className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-4"
          style={{ color: GOLD }}
        >
          Ready when you are
        </motion.p>
        <motion.h2
          {...fade(0.05)}
          className="font-display font-bold mb-6"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", color: "hsl(220 25% 10%)" }}
        >
          Let's make something your<br className="hidden sm:inline" /> families won't stop talking about.
        </motion.h2>
        <motion.div {...fade(0.1)} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/order"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-body text-sm font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: GOLD_GRAD, letterSpacing: "0.14em", boxShadow: "0 20px 44px hsl(192 60% 28% / 0.35)" }}
          >
            Start your invitation
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-body text-sm font-semibold transition-colors"
            style={{ color: "hsl(220 15% 20%)", border: "1.5px solid hsl(192 25% 72%)" }}
          >
            Ask a question first
          </Link>
        </motion.div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Team;
