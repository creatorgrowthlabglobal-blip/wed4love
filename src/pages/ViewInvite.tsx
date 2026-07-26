import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Music, VolumeX, ChevronDown, Check } from "lucide-react";

// ── Demo invite data ──────────────────────────────────────────────────────────
const INVITE = {
  groom: "Alexander",
  bride: "Diana",
  date: "22 November 2026",
  time: "4:30 PM",
  venue: {
    name: "The Grand Pavilion",
    address: "12 Rose Garden Lane, Paris, France",
    mapsUrl: "https://maps.google.com/?q=The+Grand+Pavilion+Paris+France",
  },
  story: [
    {
      year: "2020",
      emoji: "☕",
      title: "First Coffee",
      desc: "We met at a tiny café on a rainy Tuesday. Neither of us wanted to be there — and yet, we never left.",
    },
    {
      year: "2021",
      emoji: "✈️",
      title: "First Trip Together",
      desc: "Bali. We got hopelessly lost. Found something far better instead.",
    },
    {
      year: "2022",
      emoji: "🏠",
      title: "Moving In",
      desc: "We packed our whole lives into one van and somehow made it work.",
    },
    {
      year: "2024",
      emoji: "💍",
      title: "The Proposal",
      desc: "On the same beach where we got lost. This time I knew exactly where I was going.",
    },
  ],
  schedule: [
    { time: "4:30 PM", event: "Guest Arrival",  icon: "🌿", desc: "Welcome drinks in the garden" },
    { time: "5:00 PM", event: "Civil Ceremony", icon: "💍", desc: "Exchange of vows & rings" },
    { time: "6:30 PM", event: "Cocktail Hour",  icon: "🥂", desc: "Champagne & canapés" },
    { time: "8:00 PM", event: "Dinner",          icon: "🍽️", desc: "Seated dinner & speeches" },
    { time: "10:00 PM", event: "First Dance",   icon: "💃", desc: "Open dance floor follows" },
    { time: "2:00 AM",  event: "Last Song",     icon: "🎵", desc: "Goodnight, with love" },
  ],
  dresscode: "Formal · Black Tie Optional",
  rsvpDeadline: "22 October 2026",
};

// ── Envelope Reveal ───────────────────────────────────────────────────────────
type EnvPhase = "idle" | "opening" | "rising" | "done";

const EnvelopeReveal = ({ onOpen }: { onOpen: () => void }) => {
  const [phase, setPhase] = useState<EnvPhase>("idle");

  const tap = () => {
    if (phase !== "idle") return;
    setPhase("opening");
    setTimeout(() => setPhase("rising"), 750);
    setTimeout(() => setPhase("done"), 1900);
    setTimeout(onOpen, 2500);
  };

  const W = 300;
  const H = 200;

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeIn" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 overflow-hidden select-none"
      style={{ background: "linear-gradient(155deg, hsl(42 55% 96%), hsl(36 44% 93%) 55%, hsl(340 35% 95%))" }}
    >
      {/* Decorative background rings */}
      {[280, 440, 600].map((s, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width: s, height: s, border: "1px solid hsl(38 30% 68% / 0.18)" }} />
      ))}

      {/* Envelope wrapper */}
      <div
        className="relative cursor-pointer"
        style={{ width: W, height: H }}
        onClick={tap}
      >
        {/* Body */}
        <div
          className="absolute inset-0"
          style={{
            background: "hsl(42 50% 91%)",
            border: "1.5px solid hsl(38 30% 74%)",
            boxShadow: "0 14px 40px hsl(38 28% 44% / 0.16), 0 3px 10px hsl(38 24% 56% / 0.10)",
          }}
        />

        {/* Bottom V fold */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ clipPath: "polygon(0 100%, 50% 55%, 100% 100%)", background: "hsl(38 36% 82%)" }} />

        {/* Left fold */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ clipPath: "polygon(0 0, 44% 50%, 0 100%)", background: "hsl(42 42% 86%)" }} />

        {/* Right fold */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 56% 50%, 100% 100%)", background: "hsl(42 42% 86%)" }} />

        {/* Wedding card — slides up out of envelope */}
        <AnimatePresence>
          {(phase === "rising" || phase === "done") && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: -H * 0.62, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-5 bottom-3 flex items-center justify-center rounded-lg overflow-hidden pointer-events-none"
              style={{
                height: H * 0.78,
                background: "white",
                border: "1px solid hsl(38 26% 82%)",
                boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
                zIndex: 3,
              }}
            >
              <div className="text-center px-5">
                <p className="font-body tracking-[0.26em] uppercase mb-2"
                  style={{ fontSize: "0.55rem", color: "hsl(38 38% 52%)" }}>
                  You are invited
                </p>
                <p className="font-display font-bold leading-tight"
                  style={{ fontSize: "1.05rem", color: "hsl(28 28% 16%)" }}>
                  {INVITE.groom}
                </p>
                <p className="font-handwritten italic"
                  style={{ fontSize: "1.4rem", color: "hsl(38 58% 44%)", lineHeight: 1.2 }}>
                  &amp;
                </p>
                <p className="font-display font-bold leading-tight"
                  style={{ fontSize: "1.05rem", color: "hsl(28 28% 16%)" }}>
                  {INVITE.bride}
                </p>
                <div style={{ width: 26, height: 1, background: "hsl(38 44% 62%)", margin: "8px auto" }} />
                <p className="font-body" style={{ fontSize: "0.6rem", color: "hsl(38 34% 50%)" }}>
                  {INVITE.date}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flap — slides up and fades when opening */}
        <motion.div
          className="absolute top-0 inset-x-0 pointer-events-none"
          style={{
            height: "57%",
            clipPath: "polygon(0 0, 50% 72%, 100% 0)",
            background: "hsl(42 54% 94%)",
            borderBottom: "1px solid hsl(38 28% 76%)",
            zIndex: 10,
          }}
          animate={phase !== "idle"
            ? { y: -H * 0.65, opacity: 0 }
            : { y: 0, opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Wax seal */}
        <motion.div
          className="absolute flex items-center justify-center rounded-full pointer-events-none"
          style={{
            width: 36, height: 36,
            top: "26%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "hsl(340 60% 50%)",
            boxShadow: "0 2px 10px hsl(340 50% 38% / 0.32)",
            fontSize: 16,
            zIndex: 11,
          }}
          animate={phase !== "idle" ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          💍
        </motion.div>
      </div>

      {/* Tap prompt */}
      <AnimatePresence>
        {phase === "idle" && (
          <motion.p
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="font-body tracking-[0.26em] uppercase relative z-10"
            style={{ fontSize: "0.62rem", color: "hsl(38 35% 50%)" }}
          >
            Tap to open
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Celebration overlay ───────────────────────────────────────────────────────
const CONFETTI_EMOJIS = ["💍", "🌸", "✨", "💕", "🥂", "🌿", "💐"];

const CelebrationOverlay = ({ onDone }: { onDone: () => void }) => {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${4 + Math.random() * 92}%`,
    delay: `${Math.random() * 1.4}s`,
    emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{ background: "hsl(28 30% 8% / 0.90)", backdropFilter: "blur(10px)" }}
      onClick={onDone}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 text-2xl select-none pointer-events-none"
          style={{ left: p.left, animation: `float-heart 3.8s ease-out forwards`, animationDelay: p.delay }}
        >
          {p.emoji}
        </span>
      ))}

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center px-8"
      >
        <p className="text-5xl mb-5">💕</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
          We can't wait to see you!
        </h2>
        <p className="font-body text-sm" style={{ color: "hsl(38 40% 66%)" }}>
          Your RSVP has been received.
        </p>
        <p className="font-body text-xs mt-4" style={{ color: "hsl(36 20% 42%)" }}>
          Tap anywhere to close
        </p>
      </motion.div>
    </motion.div>
  );
};

// ── Music toggle (floating) ───────────────────────────────────────────────────
const MusicBtn = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1.2, duration: 0.4 }}
    onClick={onToggle}
    className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
    style={{
      background: "hsl(28 22% 11%)",
      border: "1px solid hsl(38 25% 26%)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
    }}
    aria-label={on ? "Mute music" : "Play music"}
  >
    {on
      ? <Music className="w-5 h-5" style={{ color: "hsl(38 62% 52%)" }} />
      : <VolumeX className="w-5 h-5" style={{ color: "hsl(36 18% 50%)" }} />
    }
  </motion.button>
);

// ── Section divider ───────────────────────────────────────────────────────────
const Divider = ({ light = false }) => (
  <div className="flex items-center justify-center gap-3 py-2">
    <div className="h-px flex-1" style={{ background: light ? "hsl(38 30% 80%)" : "hsl(38 20% 22%)" }} />
    <span style={{ color: light ? "hsl(38 45% 65%)" : "hsl(38 30% 36%)", fontSize: 14 }}>✦</span>
    <div className="h-px flex-1" style={{ background: light ? "hsl(38 30% 80%)" : "hsl(38 20% 22%)" }} />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ViewInvite = () => {
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const handleRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      setRsvpDone(true);
    }, 3800);
  };

  return (
    <div className="min-h-screen" style={{ background: "hsl(42 50% 95%)" }}>
      {/* Envelope reveal */}
      <AnimatePresence>
        {!opened && <EnvelopeReveal onOpen={() => setOpened(true)} />}
      </AnimatePresence>

      {/* RSVP celebration */}
      <AnimatePresence>
        {celebrating && <CelebrationOverlay onDone={() => { setCelebrating(false); setRsvpDone(true); }} />}
      </AnimatePresence>

      {/* Floating music button */}
      <MusicBtn on={musicOn} onToggle={() => setMusicOn(!musicOn)} />

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ background: "linear-gradient(170deg, hsl(42 55% 96%) 0%, hsl(36 44% 92%) 60%, hsl(30 38% 90%) 100%)" }}
      >
        {/* Ornamental rings */}
        {[300, 480, 660].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ width: size, height: size, border: "1px solid hsl(38 35% 68% / 0.18)" }}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body tracking-[0.3em] uppercase mb-8"
            style={{ fontSize: "0.65rem", color: "hsl(38 45% 46%)" }}
          >
            You are cordially invited to the wedding of
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold leading-[1.04]"
            style={{ fontSize: "clamp(3rem, 10vw, 6rem)", color: "hsl(28 28% 16%)" }}
          >
            {INVITE.groom}
            <span
              className="font-handwritten italic font-normal block"
              style={{ fontSize: "0.55em", color: "hsl(38 62% 44%)", lineHeight: 1.4 }}
            >
              &amp;
            </span>
            {INVITE.bride}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="my-7"
            style={{ width: 56, height: 1, background: "hsl(38 55% 52%)" }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center gap-1.5"
          >
            <p className="font-display text-xl sm:text-2xl font-medium" style={{ color: "hsl(28 25% 28%)" }}>
              {INVITE.date}
            </p>
            <p className="font-body text-sm tracking-widest" style={{ color: "hsl(38 40% 50%)" }}>
              {INVITE.time} · {INVITE.venue.name}
            </p>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.7 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          style={{ color: "hsl(38 35% 52%)" }}
        >
          <p className="font-body tracking-[0.22em] uppercase" style={{ fontSize: "0.6rem" }}>Scroll</p>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Love Story ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: "hsl(26 22% 10%)" }}>
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-body tracking-[0.28em] uppercase mb-4" style={{ fontSize: "0.65rem", color: "hsl(38 45% 50%)" }}>
              Our story
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "hsl(36 38% 88%)" }}>
              How it{" "}
              <span className="font-handwritten italic font-normal" style={{ color: "hsl(38 62% 54%)", fontSize: "1.1em" }}>
                began
              </span>
            </h2>
          </motion.div>

          <div className="relative flex flex-col gap-10 pl-10">
            {/* Vertical line */}
            <div
              className="absolute left-3 top-2 bottom-2 w-px"
              style={{ background: "linear-gradient(to bottom, transparent, hsl(38 25% 28%), hsl(38 25% 28%), transparent)" }}
            />

            {INVITE.story.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
                className="relative"
              >
                {/* Dot */}
                <div
                  className="absolute -left-[29px] top-1.5 w-3.5 h-3.5 rounded-full border-2"
                  style={{ background: "hsl(26 22% 10%)", borderColor: "hsl(38 58% 48%)" }}
                />

                <span className="font-body text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "hsl(38 50% 46%)" }}>
                  {entry.year}
                </span>
                <p className="text-2xl mt-1">{entry.emoji}</p>
                <h3 className="font-display text-lg font-bold mt-1 mb-1.5" style={{ color: "hsl(36 38% 86%)" }}>
                  {entry.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "hsl(36 18% 58%)" }}>
                  {entry.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Day Program ── */}
      <section
        className="py-24 sm:py-32 px-5 sm:px-8"
        style={{ background: "linear-gradient(170deg, hsl(42 55% 96%) 0%, hsl(36 44% 93%) 100%)" }}
      >
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="font-body tracking-[0.28em] uppercase mb-4" style={{ fontSize: "0.65rem", color: "hsl(38 45% 46%)" }}>
              The day
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "hsl(28 28% 16%)" }}>
              Day{" "}
              <span className="font-handwritten italic font-normal" style={{ color: "hsl(38 62% 44%)", fontSize: "1.1em" }}>
                program
              </span>
            </h2>
          </motion.div>

          <div className="flex flex-col gap-3">
            {INVITE.schedule.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}
                className="flex items-center gap-4 rounded-2xl px-5 py-4"
                style={{
                  background: "white",
                  border: "1px solid hsl(38 32% 86%)",
                  boxShadow: "0 2px 12px hsl(38 28% 60% / 0.07)",
                }}
              >
                <span className="text-xl shrink-0 w-8 text-center">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold" style={{ color: "hsl(28 28% 16%)" }}>{item.event}</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: "hsl(28 14% 50%)" }}>{item.desc}</p>
                </div>
                <p className="font-body text-xs font-semibold tracking-wide shrink-0" style={{ color: "hsl(38 52% 44%)" }}>
                  {item.time}
                </p>
              </motion.div>
            ))}
          </div>

          <Divider light />
        </div>
      </section>

      {/* ── Venue ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: "hsl(26 22% 10%)" }}>
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="font-body tracking-[0.28em] uppercase mb-4" style={{ fontSize: "0.65rem", color: "hsl(38 45% 50%)" }}>
              Where to find us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "hsl(36 38% 88%)" }}>
              The{" "}
              <span className="font-handwritten italic font-normal" style={{ color: "hsl(38 62% 54%)", fontSize: "1.1em" }}>
                venue
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="rounded-3xl overflow-hidden"
            style={{ border: "1px solid hsl(38 18% 22%)", background: "hsl(26 18% 14%)" }}
          >
            {/* Map placeholder */}
            <div
              className="h-44 flex flex-col items-center justify-center gap-2"
              style={{ background: "hsl(26 16% 17%)" }}
            >
              <MapPin className="w-7 h-7" style={{ color: "hsl(38 58% 48%)" }} />
              <p className="font-body text-xs" style={{ color: "hsl(36 18% 52%)" }}>
                {INVITE.venue.name}
              </p>
            </div>

            <div className="p-6">
              <p className="font-display text-lg font-bold mb-1" style={{ color: "hsl(36 38% 86%)" }}>
                {INVITE.venue.name}
              </p>
              <p className="font-body text-sm mb-6" style={{ color: "hsl(36 18% 56%)" }}>
                {INVITE.venue.address}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={INVITE.venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "hsl(38 62% 48%)", color: "hsl(28 30% 10%)" }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Open in Maps
                </a>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Alexander+%26+Diana%27s+Wedding&dates=20261122T163000/20261123T020000&location=${encodeURIComponent(INVITE.venue.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "hsl(26 16% 20%)", color: "hsl(36 28% 72%)", border: "1px solid hsl(26 14% 26%)" }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Add to Cal
                </a>
              </div>

              <div
                className="mt-5 pt-5 flex items-center justify-between"
                style={{ borderTop: "1px solid hsl(26 14% 20%)" }}
              >
                <p className="font-body text-xs" style={{ color: "hsl(36 18% 50%)" }}>Dress code</p>
                <p className="font-body text-xs font-semibold" style={{ color: "hsl(38 48% 58%)" }}>
                  {INVITE.dresscode}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <section
        className="py-24 sm:py-32 px-5 sm:px-8"
        style={{ background: "linear-gradient(170deg, hsl(42 55% 96%) 0%, hsl(36 44% 93%) 100%)" }}
      >
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="font-body tracking-[0.28em] uppercase mb-4" style={{ fontSize: "0.65rem", color: "hsl(38 45% 46%)" }}>
              Confirm attendance
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "hsl(28 28% 16%)" }}>
              Will you{" "}
              <span className="font-handwritten italic font-normal" style={{ color: "hsl(38 62% 44%)", fontSize: "1.1em" }}>
                join us?
              </span>
            </h2>
            <p className="font-body text-sm mt-3" style={{ color: "hsl(28 14% 46%)" }}>
              Please RSVP by {INVITE.rsvpDeadline}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {rsvpDone ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-14 px-8 rounded-3xl"
                style={{ background: "white", border: "1.5px solid hsl(38 38% 82%)" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "hsl(38 60% 90%)" }}
                >
                  <Check className="w-7 h-7" style={{ color: "hsl(38 62% 44%)" }} />
                </div>
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: "hsl(28 28% 16%)" }}>
                  Can't wait to see you!
                </h3>
                <p className="font-body text-sm" style={{ color: "hsl(28 14% 46%)" }}>
                  Your RSVP has been received. See you on {INVITE.date}.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleRsvp}
                className="rounded-3xl p-7 sm:p-8 flex flex-col gap-5"
                style={{
                  background: "white",
                  border: "1.5px solid hsl(38 38% 82%)",
                  boxShadow: "0 8px 32px hsl(38 28% 58% / 0.10)",
                }}
              >
                {[
                  { label: "Full Name", type: "text", placeholder: "Your full name" },
                  { label: "Email",     type: "email", placeholder: "your@email.com" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="font-body text-[10px] font-bold uppercase tracking-[0.18em] mb-2 block" style={{ color: "hsl(28 18% 38%)" }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      required
                      placeholder={f.placeholder}
                      className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none transition-colors"
                      style={{ background: "hsl(42 38% 96%)", border: "1px solid hsl(38 28% 82%)", color: "hsl(28 28% 16%)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "hsl(38 55% 52%)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "hsl(38 28% 82%)")}
                    />
                  </div>
                ))}

                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-[0.18em] mb-3 block" style={{ color: "hsl(28 18% 38%)" }}>
                    Attendance
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Joyfully accepts", "Regretfully declines"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                        style={{ border: "1.5px solid hsl(38 28% 82%)" }}
                      >
                        <input type="radio" name="attendance" required value={opt} className="accent-amber-600 shrink-0" />
                        <span className="font-body text-xs" style={{ color: "hsl(28 22% 26%)" }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-[0.18em] mb-2 block" style={{ color: "hsl(28 18% 38%)" }}>
                    Message <span style={{ color: "hsl(28 10% 60%)", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Leave a warm wish for the couple…"
                    className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none resize-none transition-colors"
                    style={{ background: "hsl(42 38% 96%)", border: "1px solid hsl(38 28% 82%)", color: "hsl(28 28% 16%)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "hsl(38 55% 52%)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "hsl(38 28% 82%)")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl font-body text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, hsl(38 62% 44%), hsl(38 72% 52%))",
                    boxShadow: "0 8px 24px hsl(38 62% 48% / 0.28)",
                  }}
                >
                  Confirm Attendance
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <div className="py-10 text-center" style={{ background: "hsl(26 22% 10%)" }}>
        <p className="font-body text-xs" style={{ color: "hsl(36 14% 36%)" }}>
          Made with 💍 on{" "}
          <span className="font-display" style={{ color: "hsl(38 45% 46%)" }}>Wish4Love</span>
        </p>
      </div>
    </div>
  );
};

export default ViewInvite;
