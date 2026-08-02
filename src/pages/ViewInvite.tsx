import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, Calendar, Music, VolumeX, ChevronDown, Check, Mail, Phone,
  Clock, Users, Wine, Utensils, Heart, PartyPopper, Car, Train,
  Plane, ChevronUp, Gift, Camera, Shirt, Hotel, LayoutDashboard
} from "lucide-react";
import couplePhoto from "@/assets/photo1.jpg";
import photo2 from "@/assets/photo2.jpg";
import photo3 from "@/assets/photo3.jpg";
import { getInviteLocal } from "@/lib/inviteStorage";
import type { StoredInvite } from "@/lib/inviteStorage";
import { THEMES } from "@/lib/themes";
import type { Theme } from "@/lib/themes";

// ── Theme context ──────────────────────────────────────────────────────────────
const ThemeCtx = createContext<Theme>(THEMES["garden-rose"]);
const useTheme = () => useContext(ThemeCtx);

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_INVITE = {
  groom: "Alexander",
  bride: "Diana",
  hashtag: "#AlexAndDiana2026",
  date: "22 November 2026",
  dateISO: "2026-11-22",
  time: "4:30 PM",
  email: "wedding@example.com",
  phone: "+1 (234) 567-890",
  venue: {
    name: "The Grand Pavilion",
    address: "12 Rose Garden Lane",
    city: "75019 Paris, France",
    mapsUrl: "https://maps.google.com/?q=Paris+France",
    embedUrl: "https://www.google.com/maps?q=48.8566,2.3522&output=embed",
  },
  story: [
    { year: "2020", title: "Our First Meeting",   desc: "Our paths crossed in the most unexpected way. What started as a chance encounter became the beginning of our beautiful story." },
    { year: "2021", title: "First Adventure",      desc: "We discovered our shared love for exploration. From late-night conversations to spontaneous trips, every moment brought us closer." },
    { year: "2023", title: "Moving Forward",       desc: "We built our home together — not just a place, but a feeling of belonging we had never known before." },
    { year: "2025", title: "The Proposal",         desc: "On the beach where it all began, under a sky full of stars, I asked the question I had been holding in my heart for years." },
  ],
  schedule: [
    { time: "4:30 PM",  event: "Guest Arrival",  desc: "Welcome and reception",  Icon: Users },
    { time: "5:00 PM",  event: "Ceremony",        desc: "Civil wedding",          Icon: Heart },
    { time: "6:00 PM",  event: "Cocktail",        desc: "Aperitifs and drinks",   Icon: Wine },
    { time: "8:00 PM",  event: "Dinner",          desc: "Wedding banquet",        Icon: Utensils },
    { time: "10:30 PM", event: "First Dance",     desc: "The newlyweds' dance",   Icon: Heart },
    { time: "11:00 PM", event: "Party",           desc: "Let's dance!",           Icon: Music },
    { time: "2:30 AM",  event: "End",             desc: "Goodbye",                Icon: PartyPopper },
  ],
  dresscode: "Formal / Black Tie Optional",
  dresscodeNote: "We kindly ask guests to dress elegantly for our celebration.",
  dresscodeColors: ["Ivory", "Champagne", "Forest Green", "Deep Navy", "Blush"],
  rsvpDeadline: "22 October 2026",

  menu: {
    starter: [
      { name: "Burrata & Heirloom Tomatoes", note: "with basil oil and aged balsamic" },
      { name: "Smoked Salmon Rosette",        note: "with crème fraîche and dill" },
    ],
    main: [
      { name: "Herb-Crusted Rack of Lamb",    note: "with truffle jus and roasted root vegetables" },
      { name: "Pan-Seared Sea Bass",           note: "with saffron beurre blanc and asparagus" },
      { name: "Wild Mushroom Risotto (v)",     note: "with aged parmesan and truffle oil" },
    ],
    dessert: [
      { name: "Wedding Cake",                  note: "5-tier vanilla and raspberry" },
      { name: "Crème Brûlée",                  note: "classic vanilla bean" },
    ],
    note: "Please inform us of any dietary requirements when you RSVP.",
  },

  transport: [
    { Icon: Car,   label: "By Car",    desc: "The Grand Pavilion is 15 minutes from the city centre. Free parking is available on site for all guests." },
    { Icon: Train, label: "By Train",  desc: "Take Metro Line 7 to Opéra station, then a 5-minute taxi ride. Trains run until 1:00 AM." },
    { Icon: Plane, label: "By Plane",  desc: "Charles de Gaulle Airport is 45 minutes away. We recommend pre-booking a taxi or the RER B direct train." },
  ],

  hotels: [
    { name: "Hôtel Le Marais",     stars: 5, distance: "0.3 km from venue", note: "Preferred partner — mention our wedding for 15% off", tag: "Partner" },
    { name: "Boutique Rivoli",      stars: 4, distance: "0.8 km from venue", note: "Charming rooms with Parisian courtyard views", tag: null },
    { name: "Ibis Paris Opéra",     stars: 3, distance: "1.4 km from venue", note: "Great value, breakfast included, easy Metro access", tag: null },
  ],

  destination: {
    city: "Paris",
    country: "France",
    tagline: "The City of Light",
    desc: "Paris has been captivating visitors for centuries with its art, gastronomy, and timeless elegance. From the iconic Eiffel Tower to hidden garden courtyards, every corner holds a new wonder. We couldn't imagine a more perfect backdrop for the beginning of our forever.",
    highlights: ["Eiffel Tower", "Louvre Museum", "Montmartre", "Seine River Cruise", "Versailles Day Trip"],
  },

  thingsToDo: [
    { emoji: "🗼", title: "Eiffel Tower",         desc: "Book a sunrise visit for the most magical experience — no queues and golden light." },
    { emoji: "🎨", title: "Musée d'Orsay",        desc: "Home to the world's greatest Impressionist collection. Allow at least 3 hours." },
    { emoji: "🥐", title: "Le Marais Brunch",     desc: "Explore the Jewish quarter and indulge in the best croissants and cafés in Paris." },
    { emoji: "🛥️", title: "Seine River Cruise",   desc: "A 1-hour Bateaux Mouches cruise offers stunning views of Notre-Dame and the city skyline." },
    { emoji: "🍷", title: "Wine Tasting",          desc: "Book a Burgundy or Bordeaux tasting session at Ô Château — great sommelier tours available." },
    { emoji: "🌿", title: "Jardin du Luxembourg", desc: "A peaceful escape from the city — perfect for a morning walk or reading by the fountain." },
  ],

  giftRegistry: {
    note: "Your presence at our wedding is the greatest gift of all. If you do wish to contribute, we have set up a honeymoon fund and a few registry options below.",
    options: [
      { label: "Honeymoon Fund",    detail: "Help us create memories in Santorini & Maldives", link: "#" },
      { label: "Bank Transfer",     detail: "IBAN: FR76 3000 6000 0112 3456 7890 189 · BIC: BNPAFRPP", link: null },
      { label: "Amazon Registry",   detail: "A curated list of things for our new home", link: "#" },
    ],
  },

  faq: [
    { q: "Is there a gift list?",                    a: "Yes! Please see the Gift Registry section above. Your presence means the world to us, but if you'd like to give a gift, we'd love contributions to our honeymoon fund." },
    { q: "Can I bring a plus one?",                  a: "Plus ones are indicated on your invitation. Please reach out if you have any questions — we'd love to accommodate you where possible." },
    { q: "Are children welcome?",                    a: "We love your little ones! Children aged 5 and above are warmly welcomed. Please let us know when you RSVP so we can arrange seating." },
    { q: "What time should I arrive?",               a: "We recommend arriving 15–20 minutes before the ceremony starts at 5:00 PM so you can find your seat and enjoy the welcome drinks." },
    { q: "Is there parking at the venue?",           a: "Yes — complimentary parking is available for all guests directly at The Grand Pavilion. Follow the signs to the dedicated wedding car park." },
    { q: "Will there be vegetarian options?",        a: "Absolutely. Our caterers have prepared a delicious wild mushroom risotto and other plant-based options. Please note dietary requirements on your RSVP." },
  ],

  customText: {
    title: "A Note From Us",
    body: "We have spent years dreaming of this moment — and now it's finally here. Thank you for being part of our story. Whether you have known us for decades or just a few beautiful years, your presence in our lives has shaped who we are today. We cannot wait to stand before you and make our promises to each other. Come ready to dance, laugh, and celebrate — this is a party to remember. With all our love,",
  },
};

// ── Build invite from stored data ─────────────────────────────────────────────
function scheduleIcon(event: string) {
  const e = event.toLowerCase();
  if (e.includes("arrival") || e.includes("guest") || e.includes("welcome")) return Users;
  if (e.includes("ceremony") || e.includes("wedding") || e.includes("vow"))   return Heart;
  if (e.includes("cocktail") || e.includes("drink") || e.includes("aperitif")) return Wine;
  if (e.includes("dinner") || e.includes("banquet") || e.includes("meal"))     return Utensils;
  if (e.includes("dance") || e.includes("party") || e.includes("music"))       return Music;
  if (e.includes("end") || e.includes("farewell") || e.includes("bye"))        return PartyPopper;
  return Clock;
}

function buildInviteData(s: StoredInvite): typeof DEMO_INVITE {
  return {
    groom: s.partner1,
    bride: s.partner2,
    hashtag: s.hashtag || `#${s.partner1}And${s.partner2}`,
    date: s.date,
    dateISO: s.dateISO,
    time: s.time || "5:00 PM",
    email: s.email,
    phone: s.phone,
    venue: {
      name: s.venueName,
      address: s.venueAddress,
      city: s.venueCity,
      mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(s.venueName + " " + s.venueCity)}`,
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(s.venueName + " " + s.venueCity)}&output=embed`,
    },
    story: s.story.filter(e => e.title),
    schedule: s.schedule
      .filter(e => e.event)
      .map(e => ({ time: e.time, event: e.event, desc: e.desc, Icon: scheduleIcon(e.event) })),
    dresscode: s.dresscode || "Smart Casual",
    dresscodeNote: s.dresscodeNote || "Please dress comfortably and elegantly.",
    dresscodeColors: DEMO_INVITE.dresscodeColors,
    rsvpDeadline: s.rsvpDeadline,
    menu: {
      starter: [],
      main: [],
      dessert: [],
      note: s.menuNote || "Please inform us of any dietary requirements when you RSVP.",
    },
    transport: [
      s.transportCar   ? { Icon: Car,   label: "By Car",   desc: s.transportCar   } : null,
      s.transportTrain ? { Icon: Train, label: "By Train", desc: s.transportTrain } : null,
      s.transportPlane ? { Icon: Plane, label: "By Plane", desc: s.transportPlane } : null,
    ].filter(Boolean) as typeof DEMO_INVITE.transport,
    hotels: s.hotels.filter(h => h.name).map(h => ({ ...h, tag: null })),
    destination: DEMO_INVITE.destination,
    thingsToDo: DEMO_INVITE.thingsToDo,
    giftRegistry: DEMO_INVITE.giftRegistry,
    faq: DEMO_INVITE.faq,
    customText: DEMO_INVITE.customText,
  };
}

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(dateISO: string) {
  const target = new Date(`${dateISO}T16:30:00`).getTime();
  const calc = () => {
    const diff = Math.max(0, target - Date.now());
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ── Envelope Reveal ───────────────────────────────────────────────────────────
type EnvPhase = "idle" | "opening" | "rising" | "done";

const EnvelopeReveal = ({ onOpen, groom, bride, date }: { onOpen: () => void; groom: string; bride: string; date: string }) => {
  const C = useTheme();
  const [phase, setPhase] = useState<EnvPhase>("idle");
  const W = 300; const H = 200;

  const tap = () => {
    if (phase !== "idle") return;
    setPhase("opening");
    setTimeout(() => setPhase("rising"), 750);
    setTimeout(() => setPhase("done"), 1900);
    setTimeout(onOpen, 2500);
  };

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeIn" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 overflow-hidden select-none"
      style={{ background: C.cream }}
    >
      {[280, 440, 600].map((s, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width: s, height: s, border: `1px solid hsl(28 30% 68% / 0.18)` }} />
      ))}

      <div className="relative cursor-pointer" style={{ width: W, height: H }} onClick={tap}>
        <div className="absolute inset-0"
          style={{ background: "hsl(42 50% 91%)", border: `1.5px solid hsl(38 30% 74%)`, boxShadow: "0 14px 40px hsl(38 28% 44% / 0.16)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ clipPath: "polygon(0 100%, 50% 55%, 100% 100%)", background: "hsl(38 36% 82%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ clipPath: "polygon(0 0, 44% 50%, 0 100%)", background: "hsl(42 42% 86%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 56% 50%, 100% 100%)", background: "hsl(42 42% 86%)" }} />

        <AnimatePresence>
          {(phase === "rising" || phase === "done") && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: -H * 0.62, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-5 bottom-3 flex items-center justify-center rounded-lg pointer-events-none"
              style={{ height: H * 0.78, background: C.white, border: "1px solid hsl(38 26% 82%)", boxShadow: "0 8px 28px rgba(0,0,0,0.13)", zIndex: 3 }}
            >
              <div className="text-center px-5">
                <p className="font-body tracking-[0.26em] uppercase mb-2" style={{ fontSize: "0.55rem", color: C.gold }}>You are invited</p>
                <p className="font-handwritten" style={{ fontSize: "1.35rem", color: C.dark, lineHeight: 1.1 }}>
                  {groom} & {bride}
                </p>
                <div style={{ width: 26, height: 1, background: C.gold, margin: "8px auto" }} />
                <p className="font-body" style={{ fontSize: "0.6rem", color: C.mid }}>{date}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="absolute top-0 inset-x-0 pointer-events-none"
          style={{ height: "57%", clipPath: "polygon(0 0, 50% 72%, 100% 0)", background: "hsl(42 54% 94%)", zIndex: 10 }}
          animate={phase !== "idle" ? { y: -H * 0.65, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        />

        <motion.div className="absolute flex items-center justify-center rounded-full pointer-events-none"
          style={{ width: 36, height: 36, top: "26%", left: "50%", transform: "translate(-50%, -50%)", background: C.green, fontSize: 15, zIndex: 11 }}
          animate={phase !== "idle" ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          💍
        </motion.div>
      </div>

      <AnimatePresence>
        {phase === "idle" && (
          <motion.p exit={{ opacity: 0 }} animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.4, repeat: Infinity }}
            className="font-body tracking-[0.26em] uppercase relative z-10" style={{ fontSize: "0.62rem", color: C.mid }}>
            Tap to open
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Celebration overlay ───────────────────────────────────────────────────────
const CONFETTI = ["💍", "🌸", "✨", "💕", "🥂", "🌿", "💐"];

const CelebrationOverlay = ({ onDone }: { onDone: () => void }) => {
  const C = useTheme();
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i, left: `${4 + Math.random() * 92}%`, delay: `${Math.random() * 1.4}s`,
    emoji: CONFETTI[i % CONFETTI.length],
  }));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{ background: `${C.greenMid}ee`, backdropFilter: "blur(10px)" }} onClick={onDone}>
      {pieces.map((p) => (
        <span key={p.id} className="absolute bottom-0 text-2xl select-none pointer-events-none"
          style={{ left: p.left, animation: `float-heart 3.8s ease-out forwards`, animationDelay: p.delay }}>
          {p.emoji}
        </span>
      ))}
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 text-center px-8">
        <p className="text-5xl mb-5">💕</p>
        <h2 className="font-handwritten text-4xl sm:text-5xl font-bold mb-2" style={{ color: C.white }}>
          We can't wait to see you!
        </h2>
        <p className="font-body text-sm mt-2" style={{ color: C.goldLight }}>Your RSVP has been received.</p>
        <p className="font-body text-xs mt-4" style={{ color: "hsl(44 20% 55%)" }}>Tap to close</p>
      </motion.div>
    </motion.div>
  );
};

// ── Music button ──────────────────────────────────────────────────────────────
const MusicBtn = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => {
  const C = useTheme();
  return (
    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110"
      style={{ background: C.green, boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
      {on ? <Music className="w-4 h-4" style={{ color: C.goldLight }} />
          : <VolumeX className="w-4 h-4" style={{ color: "hsl(44 25% 65%)" }} />}
    </motion.button>
  );
};

// ── Section heading ───────────────────────────────────────────────────────────
const SectionHead = ({ eyebrow, title, subtitle, light = false }: { eyebrow: string; title: string; subtitle?: string; light?: boolean }) => {
  const C = useTheme();
  return (
    <div className="text-center mb-12 sm:mb-16">
      <p className="font-body font-semibold tracking-[0.3em] uppercase mb-3" style={{ fontSize: "0.65rem", color: light ? C.goldLight : C.gold }}>
        {eyebrow}
      </p>
      <h2 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: light ? C.creamCard : C.dark }}>
        {title}
      </h2>
      {subtitle && <p className="font-body text-sm mt-3 max-w-md mx-auto" style={{ color: light ? "hsl(44 20% 70%)" : C.mid }}>{subtitle}</p>}
    </div>
  );
};

// ── FAQ item ──────────────────────────────────────────────────────────────────
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const C = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "hsl(38 28% 84%)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-body text-sm font-semibold" style={{ color: C.dark }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
          <ChevronUp className="w-4 h-4" style={{ color: C.gold }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="font-body text-sm leading-relaxed pb-5" style={{ color: C.mid }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Ken Burns Slideshow ───────────────────────────────────────────────────────
const SLIDES = [
  { src: couplePhoto, anim: "kenBurns-a 10s ease-out forwards" },
  { src: photo2,      anim: "kenBurns-b 10s ease-out forwards" },
  { src: photo3,      anim: "kenBurns-c 10s ease-out forwards" },
];

const HeroSlideshow = () => {
  const C = useTheme();
  const [index, setIndex] = useState(0);
  const [prev,  setPrev]  = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPrev(index);
      setIndex(i => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, [index]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SLIDES.map((slide, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          style={{ zIndex: i === index ? 1 : 0 }}
        >
          <img
            key={`${i}-${Math.floor(Date.now() / 6000)}`}
            src={slide.src}
            alt=""
            className="w-full h-full object-cover"
            style={{ animation: i === index ? slide.anim : "none", transformOrigin: "center center" }}
          />
        </motion.div>
      ))}
      {/* Cinematic gradient overlay */}
      <div className="absolute inset-0 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(10,7,4,0.52) 0%, rgba(10,7,4,0.22) 38%, rgba(10,7,4,0.38) 68%, rgba(10,7,4,0.78) 100%)" }} />
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.45)" }} />

      {/* Slide dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setPrev(index); setIndex(i); }}
            className="rounded-full transition-all duration-500"
            style={{
              width:   i === index ? 20 : 6,
              height:  6,
              background: i === index ? C.goldLight : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ── Hero Background (default template video, falls back to photo slideshow) ───
const HERO_OVERLAY: React.CSSProperties = {
  background: "linear-gradient(to bottom, rgba(10,7,4,0.52) 0%, rgba(10,7,4,0.22) 38%, rgba(10,7,4,0.38) 68%, rgba(10,7,4,0.78) 100%)",
};

const TEMPLATE_VIDEOS: Record<string, string> = {
  "garden-rose":   "/wedding-bg.mp4",
  "rustic-bloom":  "/wedding-bg-rustic-bloom.mp4",
};

const HeroBackground = ({ themeId }: { themeId: string }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const src = TEMPLATE_VIDEOS[themeId];

  if (!src || videoFailed) return <HeroSlideshow />;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        autoPlay muted loop playsInline
        className="absolute w-full h-full object-cover"
        src={src}
        onError={() => setVideoFailed(true)}
      />
      <div className="absolute inset-0 z-10" style={HERO_OVERLAY} />
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.45)" }} />
    </div>
  );
};

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ n }: { n: number }) => {
  const C = useTheme();
  return <span>{Array.from({ length: n }, (_, i) => <span key={i} style={{ color: C.gold }}>★</span>)}</span>;
};

// ── Main component ────────────────────────────────────────────────────────────
const ViewInvite = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const stored = id && id !== "demo-wedding" ? getInviteLocal(id) : null;
  const INVITE = stored ? buildInviteData(stored) : DEMO_INVITE;
  const isDemo = !stored;

  const themeId = stored?.template ?? searchParams.get("theme") ?? "garden-rose";
  const C = THEMES[themeId] ?? THEMES["garden-rose"];

  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const countdown = useCountdown(INVITE.dateISO);

  const handleEnvelopeOpen = () => {
    setOpened(true);
    setTimeout(() => {
      setMusicOn(true);
      audioRef.current?.play().catch(() => {});
    }, 600);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) audio.play().catch(() => {});
    else audio.pause();
  }, [musicOn]);

  const handleRsvp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const attendanceRaw = fd.get("attendance") as string;
    const attendance = attendanceRaw === "Joyfully accepts" ? "attending" : "not_attending";

    supabase.from("rsvps").insert({
      invite_id: id ?? "demo-wedding",
      event_name: `${INVITE.groom} & ${INVITE.bride}`,
      event_date: INVITE.date,
      event_venue: INVITE.venue.name,
      event_location: INVITE.venue.city,
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      attendance,
      guests_count: parseInt(fd.get("guests_count") as string) || 1,
      message: (fd.get("message") as string) || null,
    }).then(() => {});

    setCelebrating(true);
    setTimeout(() => { setCelebrating(false); setRsvpDone(true); }, 3800);
  };

  return (
    <ThemeCtx.Provider value={C}>
    <div className="min-h-screen" style={{ background: C.cream }}>
      <audio ref={audioRef} src="/music/birds-of-a-feather.mp3" loop preload="auto" />
      <AnimatePresence>
        {!opened && <EnvelopeReveal onOpen={handleEnvelopeOpen} groom={INVITE.groom} bride={INVITE.bride} date={INVITE.date} />}
      </AnimatePresence>
      <AnimatePresence>
        {celebrating && <CelebrationOverlay onDone={() => { setCelebrating(false); setRsvpDone(true); }} />}
      </AnimatePresence>
      <MusicBtn on={musicOn} onToggle={() => setMusicOn(!musicOn)} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <HeroBackground themeId={themeId} />

        <div className="relative z-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body tracking-[0.32em] uppercase mb-6" style={{ fontSize: "0.62rem", color: C.goldLight }}>
            You are cordially invited to the wedding of
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-handwritten leading-none" style={{ fontSize: "clamp(3.5rem, 12vw, 7rem)", color: "white", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
            {INVITE.groom} &amp; {INVITE.bride}
          </motion.h1>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.85 }}
            className="flex items-center justify-center gap-3 my-6">
            <div style={{ height: 1, width: 48, background: C.goldLight }} />
            <Heart className="w-4 h-4" style={{ color: C.goldLight }} />
            <div style={{ height: 1, width: 48, background: C.goldLight }} />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center gap-1.5">
            <p className="font-display text-xl sm:text-2xl font-semibold text-white">{INVITE.date}</p>
            <p className="font-body text-sm tracking-widest" style={{ color: "hsl(42 40% 78%)" }}>{INVITE.time} · {INVITE.venue.name}</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/60 z-20">
          <p className="font-body tracking-[0.22em] uppercase" style={{ fontSize: "0.58rem" }}>Scroll</p>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Countdown ── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8" style={{ background: C.green }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Time Until We Say I Do" title="Counting Down" light />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="grid grid-cols-4 gap-3 sm:gap-6">
            {[
              { value: countdown.days,    label: "Days" },
              { value: countdown.hours,   label: "Hours" },
              { value: countdown.minutes, label: "Minutes" },
              { value: countdown.seconds, label: "Seconds" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center rounded-2xl py-6 sm:py-8"
                style={{ background: C.primaryCard, border: `1px solid ${C.primaryBorder}` }}>
                <span className="font-display font-bold leading-none mb-2"
                  style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", color: C.white }}>
                  {String(value).padStart(2, "0")}
                </span>
                <span className="font-body tracking-[0.18em] uppercase" style={{ fontSize: "0.6rem", color: "hsl(42 28% 60%)" }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center font-body text-sm mt-8" style={{ color: C.primaryMuted }}>
            {INVITE.date} at {INVITE.time} · {INVITE.venue.name}, {INVITE.venue.city}
          </motion.p>
        </div>
      </section>

      {/* ── Boarding Pass ── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8" style={{ background: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Your Invitation" title="Boarding Pass" subtitle="Present this at the entrance on the day of our celebration." />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="rounded-3xl overflow-hidden relative"
            style={{ boxShadow: "0 16px 48px hsl(28 20% 40% / 0.18)", border: "1.5px solid hsl(38 30% 82%)" }}>
            {/* Main ticket body */}
            <div className="flex flex-col sm:flex-row" style={{ background: C.creamCard }}>
              {/* Left/Top — route info */}
              <div className="flex-1 p-8 sm:p-10">
                {/* Airline-style header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" style={{ color: C.gold }} />
                    <span className="font-body font-bold tracking-[0.22em] uppercase" style={{ fontSize: "0.65rem", color: C.mid }}>
                      Wedding Air
                    </span>
                  </div>
                  <span className="font-body font-bold tracking-[0.18em] uppercase rounded-full px-3 py-1"
                    style={{ fontSize: "0.6rem", background: C.green, color: "hsl(42 40% 85%)" }}>
                    First Class
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-center">
                    <p className="font-display font-bold" style={{ fontSize: "2.2rem", color: C.dark, lineHeight: 1 }}>♡</p>
                    <p className="font-body text-[10px] tracking-widest uppercase mt-1" style={{ color: C.mid }}>Heart</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-center gap-1">
                      <div style={{ flex: 1, height: 1, background: "hsl(38 28% 78%)" }} />
                      <Plane className="w-4 h-4 rotate-90 sm:rotate-0" style={{ color: C.gold }} />
                      <div style={{ flex: 1, height: 1, background: "hsl(38 28% 78%)" }} />
                    </div>
                    <p className="font-body tracking-[0.14em] uppercase" style={{ fontSize: "0.58rem", color: C.light }}>
                      {INVITE.date}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold" style={{ fontSize: "2.2rem", color: C.dark, lineHeight: 1 }}>∞</p>
                    <p className="font-body text-[10px] tracking-widest uppercase mt-1" style={{ color: C.mid }}>Forever</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: "Passenger",  value: "Honoured Guest" },
                    { label: "Flight",     value: `${INVITE.groom} & ${INVITE.bride}` },
                    { label: "Departure",  value: INVITE.time },
                    { label: "Gate",       value: INVITE.venue.name },
                    { label: "Seat",       value: "Reserved for You" },
                    { label: "Date",       value: INVITE.date },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="font-body tracking-[0.18em] uppercase mb-1" style={{ fontSize: "0.55rem", color: C.light }}>{label}</p>
                      <p className="font-body text-sm font-semibold" style={{ color: C.dark }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perforation */}
              <div className="flex sm:flex-col items-center" style={{ position: "relative" }}>
                <div className="hidden sm:block w-px h-full border-l-2 border-dashed" style={{ borderColor: "hsl(38 28% 78%)" }} />
                <div className="sm:hidden w-full h-px border-t-2 border-dashed" style={{ borderColor: "hsl(38 28% 78%)" }} />
                {/* Scallop cuts */}
                {[-1, 1].map((_, i) => (
                  <div key={i} className="absolute w-6 h-6 rounded-full"
                    style={{
                      background: C.cream,
                      ...(i === 0
                        ? { top: -12, left: "50%", transform: "translateX(-50%)" }
                        : { bottom: -12, left: "50%", transform: "translateX(-50%)" }),
                    }} />
                ))}
              </div>

              {/* Right/Bottom — stub */}
              <div className="p-7 sm:p-8 flex flex-col items-center justify-center gap-5 min-w-[140px]"
                style={{ background: C.cream }}>
                {/* Barcode-style decoration */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} style={{
                      width: i % 3 === 0 ? 3 : 1.5,
                      height: i % 5 === 0 ? 40 : i % 2 === 0 ? 32 : 28,
                      background: C.dark,
                      opacity: 0.7 + (i % 3) * 0.1,
                    }} />
                  ))}
                </div>
                <p className="font-body text-center" style={{ fontSize: "0.58rem", color: C.mid, letterSpacing: "0.12em" }}>
                  {INVITE.hashtag}
                </p>
                <div className="text-center">
                  <p className="font-handwritten" style={{ fontSize: "1.6rem", color: C.dark, lineHeight: 1.1 }}>
                    {INVITE.groom}<br />&amp; {INVITE.bride}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Our Story ── */}
      {INVITE.story.length > 0 && <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.creamAlt }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Our Journey" title="Our Story" />
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-px hidden sm:block"
              style={{ background: "hsl(28 28% 78%)" }} />

            {INVITE.story.map((entry, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`relative flex mb-12 sm:mb-16 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3 h-3 rounded-full z-10 hidden sm:block"
                    style={{ background: C.gold, border: `3px solid ${C.creamAlt}`, boxShadow: `0 0 0 1px ${C.gold}` }} />
                  <div className={`w-full sm:w-[calc(50%-2rem)] ${isLeft ? "sm:pr-10 sm:text-right" : "sm:pl-10"} pl-6 sm:pl-0`}>
                    <div className="absolute left-0 top-2 w-3 h-3 rounded-full sm:hidden"
                      style={{ background: C.gold }} />
                    <p className="font-display text-sm font-bold italic mb-1" style={{ color: C.gold }}>{entry.year}</p>
                    <h3 className="font-handwritten mb-2" style={{ fontSize: "1.5rem", color: C.dark, lineHeight: 1.2 }}>{entry.title}</h3>
                    <p className="font-body text-sm italic leading-relaxed" style={{ color: C.mid }}>{entry.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>}

      {/* ── Day Program / Timeline ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.green }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="What we have prepared for you" title="Day Program" light />
          </motion.div>

          <div className="overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0">
            <div className="flex gap-0 min-w-max sm:min-w-0 sm:justify-center relative">
              <div className="absolute top-[calc(2.75rem+1.5rem)] left-[2.5rem] right-[2.5rem] h-px hidden sm:block"
                style={{ background: C.primaryLine }} />
              {INVITE.schedule.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex flex-col items-center text-center relative"
                  style={{ minWidth: 120, padding: "0 12px" }}>
                  <div className="rounded-full px-3 py-1.5 mb-3 font-body text-xs font-semibold"
                    style={{ background: "hsl(42 40% 84%)", color: C.dark, whiteSpace: "nowrap" }}>
                    {item.time}
                  </div>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center relative z-10 mb-3"
                    style={{ border: `1.5px solid ${C.primaryBorder}`, background: C.green }}>
                    <item.Icon className="w-4 h-4" style={{ color: "hsl(42 40% 78%)" }} />
                  </div>
                  <p className="font-body text-sm font-semibold mb-1" style={{ color: "hsl(42 35% 88%)" }}>{item.event}</p>
                  <p className="font-body text-xs" style={{ color: C.primaryMuted, maxWidth: 90 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Venue & Map ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Join Us" title="Venue & Map" subtitle="We can't wait to celebrate this special day with you. Here's everything you need to know." />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ background: C.creamCard, border: "1px solid hsl(38 28% 84%)", boxShadow: "0 4px 24px hsl(28 20% 50% / 0.08)" }}>
            <div className="px-7 pt-8 pb-5 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "hsl(38 45% 88%)" }}>
                <span style={{ fontSize: 20 }}>✦</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3" style={{ color: C.dark }}>Wedding Ceremony</h3>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5" style={{ color: C.gold }} />
                <p className="font-body text-sm" style={{ color: C.mid }}>{INVITE.time}</p>
              </div>
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: C.gold }} />
                <p className="font-body text-sm font-medium" style={{ color: C.dark }}>{INVITE.venue.name}</p>
              </div>
              <p className="font-body text-sm mt-0.5" style={{ color: C.mid }}>{INVITE.venue.address}</p>
              <p className="font-body text-sm" style={{ color: C.mid }}>{INVITE.venue.city}</p>
            </div>

            <div className="w-full" style={{ height: 280 }}>
              <iframe
                src={INVITE.venue.embedUrl}
                width="100%" height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wedding venue map"
              />
            </div>

            <div className="px-7 py-5 grid grid-cols-2 gap-3">
              <a href={INVITE.venue.mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: C.green, color: "hsl(42 35% 88%)" }}>
                <MapPin className="w-3.5 h-3.5" /> Open in Maps
              </a>
              <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${INVITE.groom}+%26+${INVITE.bride}+Wedding&dates=${INVITE.dateISO.replace(/-/g,"")}T163000/${INVITE.dateISO.replace(/-/g,"")}T020000&location=${encodeURIComponent(INVITE.venue.address)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: "hsl(38 30% 88%)", color: C.dark }}>
                <Calendar className="w-3.5 h-3.5" /> Add to Calendar
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Dress Code ── */}
      <section className="pb-20 sm:pb-28 px-5 sm:px-8" style={{ background: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="What to Wear" title="Dress Code" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: C.green }}>
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: C.primaryCard }}>
                <Shirt className="w-5 h-5" style={{ color: C.goldLight }} />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "hsl(42 40% 85%)" }}>{INVITE.dresscode}</h3>
              <p className="font-body text-sm mb-8" style={{ color: C.primaryMuted }}>{INVITE.dresscodeNote}</p>

              <p className="font-body tracking-[0.18em] uppercase mb-4" style={{ fontSize: "0.6rem", color: "hsl(42 28% 60%)" }}>
                Suggested Palette
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  "hsl(44 40% 94%)",   // ivory
                  "hsl(38 45% 80%)",   // champagne
                  "hsl(100 20% 27%)",  // forest green
                  "hsl(220 30% 24%)",  // deep navy
                  "hsl(18 52% 82%)",   // blush
                ].map((color, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-full border-2"
                      style={{ background: color, borderColor: C.primaryBorder }} />
                    <span className="font-body" style={{ fontSize: "0.55rem", color: "hsl(42 22% 58%)" }}>
                      {INVITE.dresscodeColors[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Menu ── */}
      {(INVITE.menu.note || INVITE.menu.starter.length > 0) && (
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.creamAlt }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Culinary Experience" title="Wedding Menu" />
          </motion.div>

          {/* Full menu (demo) — show course cards */}
          {INVITE.menu.starter.length > 0 && [
            { label: "Starters",  emoji: "🥗", items: INVITE.menu.starter },
            { label: "Mains",     emoji: "🍽️", items: INVITE.menu.main },
            { label: "Desserts",  emoji: "🎂", items: INVITE.menu.dessert },
          ].map((course, ci) => (
            <motion.div key={course.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, delay: ci * 0.1 }}
              className="mb-5 rounded-2xl overflow-hidden"
              style={{ background: C.white, border: "1px solid hsl(38 28% 84%)" }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: C.green }}>
                <span className="text-lg">{course.emoji}</span>
                <h3 className="font-body font-bold tracking-[0.18em] uppercase" style={{ fontSize: "0.7rem", color: "hsl(42 35% 82%)" }}>
                  {course.label}
                </h3>
              </div>
              <div className="divide-y" style={{ borderColor: "hsl(38 24% 90%)" }}>
                {course.items.map((item) => (
                  <div key={item.name} className="px-6 py-4">
                    <p className="font-body text-sm font-semibold mb-0.5" style={{ color: C.dark }}>{item.name}</p>
                    <p className="font-body text-xs italic" style={{ color: C.light }}>{item.note}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Simple note card (user-created invites) */}
          {INVITE.menu.starter.length === 0 && INVITE.menu.note && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: C.white, border: "1px solid hsl(38 28% 84%)" }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: C.green }}>
                <span className="text-lg">🍽️</span>
                <h3 className="font-body font-bold tracking-[0.18em] uppercase" style={{ fontSize: "0.7rem", color: "hsl(42 35% 82%)" }}>
                  Menu
                </h3>
              </div>
              <div className="px-7 py-6 text-center">
                <p className="font-body text-sm leading-relaxed" style={{ color: C.mid }}>{INVITE.menu.note}</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
      )}

      {/* ── Transport ── */}
      {INVITE.transport.length > 0 && <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.green }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Getting Here" title="Transport" subtitle="We want your journey to be as smooth as possible." light />
          </motion.div>

          <div className="flex flex-col gap-4">
            {INVITE.transport.map((t, i) => (
              <motion.div key={t.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 flex gap-5 items-start"
                style={{ background: C.primaryCard, border: `1px solid ${C.primaryBorder}` }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: C.primaryCardDark, border: `1px solid ${C.primaryBorder}` }}>
                  <t.Icon className="w-5 h-5" style={{ color: C.goldLight }} />
                </div>
                <div>
                  <p className="font-body font-bold mb-1.5" style={{ color: "hsl(42 38% 88%)" }}>{t.label}</p>
                  <p className="font-body text-sm leading-relaxed" style={{ color: C.primaryMuted }}>{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>}

      {/* ── Hotels ── */}
      {INVITE.hotels.length > 0 && <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Stay Nearby" title="Recommended Hotels" subtitle="We've handpicked a selection of hotels for different budgets, all within walking distance of the venue." />
          </motion.div>

          <div className="flex flex-col gap-4">
            {INVITE.hotels.map((hotel, i) => (
              <motion.div key={hotel.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 flex gap-4 items-start relative"
                style={{ background: C.creamCard, border: "1px solid hsl(38 28% 84%)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "hsl(38 36% 88%)" }}>
                  <Hotel className="w-5 h-5" style={{ color: C.gold }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-body font-bold" style={{ color: C.dark }}>{hotel.name}</p>
                    {hotel.tag && (
                      <span className="font-body rounded-full px-2 py-0.5"
                        style={{ fontSize: "0.58rem", fontWeight: 700, background: C.green, color: "hsl(42 40% 85%)" }}>
                        {hotel.tag}
                      </span>
                    )}
                  </div>
                  <div className="mb-1"><Stars n={hotel.stars} /></div>
                  <p className="font-body text-xs mb-1" style={{ color: C.gold }}>{hotel.distance}</p>
                  <p className="font-body text-sm" style={{ color: C.mid }}>{hotel.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>}

      {/* ── Demo-only sections ── */}
      {isDemo && (<>
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ background: C.greenMid }}>
        {/* Decorative large text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-handwritten opacity-[0.04]" style={{ fontSize: "clamp(8rem, 28vw, 20rem)", color: "white", lineHeight: 1 }}>
            {INVITE.destination.city}
          </span>
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow={`${INVITE.destination.city}, ${INVITE.destination.country}`} title={INVITE.destination.tagline} light />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="font-body text-sm sm:text-base leading-relaxed text-center mb-10"
            style={{ color: "hsl(44 20% 72%)" }}>
            {INVITE.destination.desc}
          </motion.p>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2.5">
            {INVITE.destination.highlights.map((h) => (
              <span key={h} className="font-body text-xs font-semibold rounded-full px-4 py-2"
                style={{ background: C.primaryCard, color: "hsl(42 32% 80%)", border: `1px solid ${C.primaryBorder}` }}>
                {h}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Things To Do ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.cream }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Make the Most of Paris" title="Things To Do" subtitle="Whether you're arriving early or staying on, here are our favourite spots in the city." />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INVITE.thingsToDo.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl p-6"
                style={{ background: C.creamCard, border: "1px solid hsl(38 28% 84%)" }}>
                <span className="text-2xl mb-3 block">{item.emoji}</span>
                <p className="font-body font-bold mb-1.5" style={{ color: C.dark }}>{item.title}</p>
                <p className="font-body text-sm leading-relaxed" style={{ color: C.mid }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gift Registry ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.green }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="With Gratitude" title="Gift Registry" light />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
            className="font-body text-sm text-center leading-relaxed mb-10"
            style={{ color: "hsl(44 20% 68%)" }}>
            {INVITE.giftRegistry.note}
          </motion.p>

          <div className="flex flex-col gap-4">
            {INVITE.giftRegistry.options.map((opt, i) => (
              <motion.div key={opt.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 flex gap-4 items-center"
                style={{ background: C.primaryCard, border: `1px solid ${C.primaryBorder}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.primaryCardDark }}>
                  <Gift className="w-5 h-5" style={{ color: C.goldLight }} />
                </div>
                <div className="flex-1">
                  <p className="font-body font-bold mb-0.5" style={{ color: "hsl(42 38% 88%)" }}>{opt.label}</p>
                  <p className="font-body text-xs leading-relaxed" style={{ color: C.primaryMuted }}>{opt.detail}</p>
                </div>
                {opt.link && (
                  <a href={opt.link} className="font-body text-xs font-bold rounded-full px-4 py-2 shrink-0 transition-opacity hover:opacity-80"
                    style={{ background: "hsl(42 40% 84%)", color: C.dark }}>
                    View
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.creamAlt }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Captured Moments" title="Our Gallery" subtitle="A few of our favourite photographs together." />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { src: couplePhoto, alt: "Walking together at sunset", span: "col-span-2 sm:col-span-1 row-span-2" },
              { src: photo2,      alt: "Love letter with roses",      span: "" },
              { src: photo3,      alt: "Together",                    span: "" },
            ].map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}
                className={`rounded-2xl overflow-hidden ${img.span}`}
                style={{ minHeight: 200, border: "1px solid hsl(38 26% 82%)" }}>
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" style={{ minHeight: "inherit" }} />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-8">
            <Camera className="w-4 h-4" style={{ color: C.gold }} />
            <p className="font-body text-sm" style={{ color: C.mid }}>Share your photos with us using {INVITE.hashtag}</p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Common Questions" title="FAQ" subtitle="Everything you need to know before the big day." />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-2xl px-6 sm:px-8 py-2"
            style={{ background: C.creamCard, border: "1px solid hsl(38 28% 84%)" }}>
            {INVITE.faq.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Custom Text ── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8" style={{ background: C.green }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="font-body font-semibold tracking-[0.3em] uppercase mb-4" style={{ fontSize: "0.65rem", color: C.goldLight }}>
              From the Couple
            </p>
            <h2 className="font-display font-bold leading-tight mb-8" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: C.creamCard }}>
              {INVITE.customText.title}
            </h2>

            <div style={{ height: 1, background: C.primaryLine, maxWidth: 60, margin: "0 auto 28px" }} />

            <p className="font-body text-sm sm:text-base leading-loose mb-8" style={{ color: "hsl(44 20% 70%)" }}>
              {INVITE.customText.body}
            </p>

            <p className="font-handwritten" style={{ fontSize: "2rem", color: C.goldLight, lineHeight: 1.2 }}>
              {INVITE.groom} &amp; {INVITE.bride}
            </p>
          </motion.div>
        </div>
      </section>

      </>)}

      {/* ── RSVP ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: C.creamAlt }}>
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <SectionHead eyebrow="Confirm Attendance" title="Will You Join Us?" subtitle={`Please RSVP by ${INVITE.rsvpDeadline}`} />
          </motion.div>

          <AnimatePresence mode="wait">
            {rsvpDone ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                className="text-center py-14 px-8 rounded-2xl"
                style={{ background: C.creamCard, border: "1px solid hsl(38 28% 84%)" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "hsl(38 36% 88%)" }}>
                  <Check className="w-7 h-7" style={{ color: C.gold }} />
                </div>
                <h3 className="font-handwritten text-3xl mb-2" style={{ color: C.dark }}>Can't wait to see you!</h3>
                <p className="font-body text-sm" style={{ color: C.mid }}>Your RSVP has been received. See you on {INVITE.date}.</p>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                onSubmit={handleRsvp}
                className="rounded-2xl p-7 sm:p-8 flex flex-col gap-5"
                style={{ background: C.creamCard, border: "1px solid hsl(38 28% 84%)" }}>

                {[
                  { label: "Full Name", type: "text",  name: "name",  placeholder: "Your full name" },
                  { label: "Email",     type: "email", name: "email", placeholder: "your@email.com" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="font-body text-[10px] font-bold uppercase tracking-[0.18em] mb-2 block" style={{ color: C.light }}>
                      {f.label}
                    </label>
                    <input type={f.type} name={f.name} required placeholder={f.placeholder}
                      className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none transition-colors"
                      style={{ background: "white", border: "1px solid hsl(38 26% 84%)", color: C.dark }}
                      onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
                      onBlur={e => (e.currentTarget.style.borderColor = "hsl(38 26% 84%)")} />
                  </div>
                ))}

                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-[0.18em] mb-3 block" style={{ color: C.light }}>
                    Attendance
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Joyfully accepts", "Regretfully declines"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2.5 rounded-xl px-4 py-3 cursor-pointer"
                        style={{ border: "1.5px solid hsl(38 26% 84%)", background: "white" }}>
                        <input type="radio" name="attendance" required value={opt} style={{ accentColor: C.gold }} />
                        <span className="font-body text-xs" style={{ color: C.mid }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-[0.18em] mb-2 block" style={{ color: C.light }}>
                    Number of Guests
                  </label>
                  <select
                    name="guests_count"
                    defaultValue="1"
                    className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none appearance-none"
                    style={{ background: "white", border: "1px solid hsl(38 26% 84%)", color: C.dark }}
                    onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
                    onBlur={e => (e.currentTarget.style.borderColor = "hsl(38 26% 84%)")}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? "person (just me)" : "people"}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-body text-[10px] font-bold uppercase tracking-[0.18em] mb-2 block" style={{ color: C.light }}>
                    Message <span style={{ color: C.light, textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea rows={3} name="message" placeholder="Leave a warm wish for the couple…"
                    className="w-full rounded-xl px-4 py-3 font-body text-sm outline-none resize-none transition-colors"
                    style={{ background: "white", border: "1px solid hsl(38 26% 84%)", color: C.dark }}
                    onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
                    onBlur={e => (e.currentTarget.style.borderColor = "hsl(38 26% 84%)")} />
                </div>

                <button type="submit"
                  className="w-full py-4 rounded-xl font-body text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: C.green, color: "hsl(42 35% 88%)" }}>
                  Confirm Attendance
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Questions ── */}
      <section className="py-16 px-5 sm:px-8" style={{ background: C.cream }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl px-8 py-8 text-center"
            style={{ background: C.blush }}>
            <h3 className="font-display text-xl font-semibold mb-2" style={{ color: C.dark }}>Still Have Questions?</h3>
            <p className="font-body text-sm mb-5" style={{ color: C.mid }}>
              Don't hesitate to reach out — we're happy to help you plan your journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={`mailto:${INVITE.email}`}
                className="inline-flex items-center gap-2 font-body text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: C.gold }}>
                <Mail className="w-4 h-4" /> {INVITE.email}
              </a>
              <a href={`tel:${INVITE.phone}`}
                className="inline-flex items-center gap-2 font-body text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: C.gold }}>
                <Phone className="w-4 h-4" /> {INVITE.phone}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-14 px-6 text-center" style={{ background: C.green }}>
        <p className="font-handwritten mb-3" style={{ fontSize: "2.4rem", color: C.goldLight }}>
          {INVITE.groom} &amp; {INVITE.bride}
        </p>
        <p className="font-body text-sm mb-6" style={{ color: "hsl(42 25% 65%)" }}>{INVITE.date}</p>
        <div style={{ height: 1, background: C.primaryLine, maxWidth: 240, margin: "0 auto 20px" }} />
        <p className="font-body text-xs" style={{ color: C.primaryMuted }}>{INVITE.hashtag}</p>
        <a
          href={`/dashboard/${id ?? "demo-wedding"}`}
          className="inline-flex items-center gap-1.5 mt-6 font-body text-xs transition-opacity hover:opacity-70"
          style={{ color: "hsl(42 22% 48%)" }}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          RSVP Dashboard
        </a>
      </footer>
    </div>
    </ThemeCtx.Provider>
  );
};

export default ViewInvite;
