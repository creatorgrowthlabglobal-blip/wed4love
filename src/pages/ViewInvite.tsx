import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";
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
    story: s.story.filter(e => e.title || e.desc),
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
    const diff = target - Date.now();
    if (diff <= 0) return null;
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
const EnvelopeReveal = ({ onOpen }: { onOpen: () => void; groom: string; bride: string; date: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const tappedRef = useRef(false); // ref so async callbacks can check without stale closure

  // Show first frame on mobile: muted autoplay → pause at 0
  // Guards against pausing AFTER the user has already tapped
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const show = async () => {
      if (tappedRef.current) return;
      v.muted = true;
      try {
        await v.play();
        if (!tappedRef.current) { v.pause(); v.currentTime = 0; }
      } catch (_) {
        if (!tappedRef.current) v.currentTime = 0.001;
      }
      v.muted = false;
    };
    v.readyState >= 2 ? show() : v.addEventListener('loadeddata', show, { once: true });
  }, []);

  const tap = () => {
    if (tappedRef.current) return;
    tappedRef.current = true;
    setStarted(true);
    const v = videoRef.current;
    if (!v) { onOpen(); return; }
    v.currentTime = 0;
    v.muted = false;
    v.play().catch(onOpen);
  };

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeIn" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer select-none"
      onClick={tap}
    >
      <video
        ref={videoRef}
        src="/envelope.mp4"
        playsInline
        preload="auto"
        onEnded={() => setTimeout(onOpen, 500)}
        className="w-full h-full object-cover"
        style={{ pointerEvents: "none" }}
      />

      <AnimatePresence>
        {!started && (
          <motion.p
            exit={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-16 left-0 right-0 text-center font-body tracking-[0.28em] uppercase"
            style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.75)" }}
          >
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
  "golden-hour":   "/wedding-bg-golden-hour.mp4",
  "midnight-luxe": "/wedding-bg-midnight-luxe.mp4",
  "soft-love":     "/wedding-bg-soft-love.mp4",
};

const TEMPLATE_VIDEO_FIT: Record<string, "cover" | "contain-width"> = {
  "rustic-bloom": "contain-width",
};

const HeroBackground = ({ themeId, videoRef }: { themeId: string; videoRef?: React.RefObject<HTMLVideoElement> }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const src = TEMPLATE_VIDEOS[themeId];
  const fit = TEMPLATE_VIDEO_FIT[themeId] ?? "cover";

  if (!src || videoFailed) return <HeroSlideshow />;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#000" }}>
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        src={src}
        onError={() => setVideoFailed(true)}
        className="absolute"
        style={fit === "contain-width" ? {
          width: "100%",
          height: "auto",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
        } : {
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
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

// ── Ornamental baroque divider ─────────────────────────────────────────────────
const OrnamentalDivider = ({ color }: { color: string }) => (
  <div className="flex items-center justify-center my-5">
    <svg width="230" height="30" viewBox="0 0 230 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="15" x2="82" y2="15" stroke={color} strokeWidth="0.8" opacity="0.4"/>
      <line x1="148" y1="15" x2="230" y2="15" stroke={color} strokeWidth="0.8" opacity="0.4"/>
      <circle cx="87" cy="15" r="3.5" fill="none" stroke={color} strokeWidth="1" opacity="0.6"/>
      <circle cx="143" cy="15" r="3.5" fill="none" stroke={color} strokeWidth="1" opacity="0.6"/>
      <path d="M93 15 Q99 9.5 105 15 Q99 20.5 93 15Z" fill={color} opacity="0.55"/>
      <path d="M125 15 Q131 9.5 137 15 Q131 20.5 125 15Z" fill={color} opacity="0.55"/>
      <circle cx="115" cy="15" r="8" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="115" cy="15" r="3.5" fill="none" stroke={color} strokeWidth="0.9" opacity="0.65"/>
      <circle cx="115" cy="15" r="1.5" fill={color}/>
      <path d="M107 15 Q111 11 114 15" fill="none" stroke={color} strokeWidth="0.9" opacity="0.5"/>
      <path d="M116 15 Q119 11 123 15" fill="none" stroke={color} strokeWidth="0.9" opacity="0.5"/>
    </svg>
  </div>
);

// ── Golden curtain header (for Garden Rose Our Story section) ──────────────────
const GoldenCurtainTop = () => {
  const C = useTheme();
  const crystals = [
    { left: "31%", h: 55 }, { left: "35%", h: 82 }, { left: "39%", h: 68 },
    { left: "43%", h: 105 }, { left: "47%", h: 122 }, { left: "50%", h: 130 },
    { left: "53%", h: 122 }, { left: "57%", h: 105 }, { left: "61%", h: 68 },
    { left: "65%", h: 82 }, { left: "69%", h: 55 },
  ];
  return (
    <div className="relative overflow-hidden w-full" style={{ height: 240 }}>
      <div className="absolute inset-0" style={{ background: C.creamAlt }}/>

      {/* Rod */}
      <div className="absolute top-0 inset-x-0" style={{
        zIndex: 10, height: 9,
        background: "linear-gradient(to bottom, hsl(38 48% 34%), hsl(38 78% 58%), hsl(40 70% 54%), hsl(38 50% 36%))",
        boxShadow: "0 3px 10px rgba(0,0,0,0.22)",
      }}/>

      {/* Rod rings */}
      {[8, 18, 28, 38, 48, 58, 68, 78, 88, 98].map((pct, i) => (
        <div key={i} className="absolute" style={{
          zIndex: 20, top: 1.5, left: `${pct}%`,
          width: 6, height: 6, borderRadius: "50%",
          background: "hsl(38 65% 42%)",
          border: "1.5px solid hsl(38 50% 34%)",
          transform: "translateX(-50%)",
        }}/>
      ))}

      {/* Left curtain */}
      <div className="absolute top-0 left-0" style={{
        zIndex: 5, width: "43%", height: "100%",
        background: "linear-gradient(168deg, hsl(38 78% 56%) 0%, hsl(40 72% 62%) 15%, hsl(42 68% 58%) 25%, hsl(39 65% 50%) 45%, hsl(37 62% 44%) 65%, hsl(35 58% 36%) 100%)",
        clipPath: "polygon(0 0, 100% 0, 52% 100%, 0 100%)",
      }}>
        {[20, 38, 56, 74].map((x, i) => (
          <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${x}%`, width:1, background:"rgba(0,0,0,0.12)" }}/>
        ))}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0))" }}/>
      </div>

      {/* Right curtain */}
      <div className="absolute top-0 right-0" style={{
        zIndex: 5, width: "43%", height: "100%",
        background: "linear-gradient(192deg, hsl(38 78% 56%) 0%, hsl(40 72% 62%) 15%, hsl(42 68% 58%) 25%, hsl(39 65% 50%) 45%, hsl(37 62% 44%) 65%, hsl(35 58% 36%) 100%)",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 48% 100%)",
      }}>
        {[26, 44, 62, 80].map((x, i) => (
          <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${x}%`, width:1, background:"rgba(0,0,0,0.1)" }}/>
        ))}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to left, rgba(255,255,255,0.08), rgba(255,255,255,0))" }}/>
      </div>

      {/* Crystal chains */}
      {crystals.map((c, i) => (
        <div key={i} className="absolute" style={{ zIndex: 20, top: 9, left: c.left, height: c.h }}>
          <div style={{ width:1, height:`calc(100% - 11px)`, background:"linear-gradient(to bottom, rgba(215,175,70,0.9), rgba(225,190,95,0.55), rgba(225,190,95,0))", margin:"0 auto" }}/>
          <div style={{ width:5, height:9, borderRadius:"50% 50% 50% 50% / 35% 35% 65% 65%", background:"radial-gradient(circle at 35% 30%, hsl(42 90% 86%), hsl(40 75% 68%), hsl(37 62% 52%))", margin:"0 auto", boxShadow:"0 1px 4px rgba(150,110,20,0.45), inset 0 1px 2px rgba(255,255,255,0.45)" }}/>
        </div>
      ))}

      {/* Center chandelier ornament */}
      <div className="absolute" style={{ zIndex: 30, top: 9, left: "50%", transform: "translateX(-50%)" }}>
        <div style={{ width:1.5, height:20, background:"linear-gradient(to bottom, hsl(38 65% 52%), hsl(38 70% 60%))", margin:"0 auto" }}/>
        <div style={{ width:14, height:28, background:"linear-gradient(180deg, hsl(38 70% 46%), hsl(40 78% 60%), hsl(40 72% 56%), hsl(38 65% 46%), hsl(36 58% 38%))", borderRadius:"2px 2px 48% 48% / 2px 2px 58% 58%", margin:"0 auto", boxShadow:"0 4px 16px rgba(140,100,20,0.5), inset 0 1px 3px rgba(255,255,255,0.3)" }}/>
        <div style={{ width:8, height:14, background:"radial-gradient(circle at 35% 30%, hsl(43 92% 88%), hsl(40 76% 66%), hsl(37 62% 50%))", borderRadius:"50% 50% 50% 50% / 35% 35% 65% 65%", margin:"-1px auto 0", boxShadow:"0 3px 10px rgba(140,100,20,0.45), inset 0 1px 3px rgba(255,255,255,0.5)" }}/>
      </div>

      {/* Bottom fade into section background */}
      <div className="absolute bottom-0 inset-x-0" style={{
        zIndex: 40, height: 55,
        background: C.creamAlt,
        WebkitMaskImage: "linear-gradient(to bottom, transparent, black)",
        maskImage: "linear-gradient(to bottom, transparent, black)",
      }}/>
    </div>
  );
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
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const countdown = useCountdown(INVITE.dateISO);

  const handleEnvelopeOpen = () => {
    setOpened(true);
    heroVideoRef.current?.play().catch(() => {});
    setTimeout(() => setMusicOn(true), 600);
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

    notify("rsvp_submitted", {
      invite_id: id ?? "demo-wedding",
      name: fd.get("name"),
      email: fd.get("email"),
      attendance,
      guests: fd.get("guests_count"),
      message: fd.get("message") || undefined,
    });

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
        <HeroBackground themeId={themeId} videoRef={heroVideoRef} />

        <div className="relative z-20">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body tracking-[0.32em] uppercase mb-6" style={{ fontSize: "0.62rem", color: C.goldLight }}>
            You are cordially invited to the wedding of
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-handwritten leading-none" style={{ fontSize: "clamp(3.5rem, 12vw, 7rem)", color: "white", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
            {INVITE.groom} &amp; {INVITE.bride}
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.85 }}
            className="my-6">
            {themeId === "garden-rose" ? (
              <OrnamentalDivider color="rgba(255,230,160,0.75)" />
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div style={{ height: 1, width: 48, background: C.goldLight }} />
                <Heart className="w-4 h-4" style={{ color: C.goldLight }} />
                <div style={{ height: 1, width: 48, background: C.goldLight }} />
              </div>
            )}
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

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.65 }}>
            {countdown === null ? (
              <div className="text-center py-8 px-5 rounded-2xl" style={{ background: C.primaryCard, border: `1px solid ${C.primaryBorder}` }}>
                <p className="font-handwritten text-3xl mb-1" style={{ color: C.white }}>The celebration has begun!</p>
                <p className="font-body text-sm" style={{ color: "hsl(42 28% 60%)" }}>Thank you for being part of our special day ♡</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:gap-6">
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
              </div>
            )}
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
      {INVITE.story.length > 0 && <section style={{ background: C.creamAlt }}>
        {themeId === "garden-rose" && <GoldenCurtainTop />}
        <div className={`max-w-3xl mx-auto px-5 sm:px-8 ${themeId === "garden-rose" ? "pt-6 pb-24 sm:pb-32" : "py-24 sm:py-32"}`}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            {themeId === "garden-rose" ? (
              <div className="text-center mb-12 sm:mb-16">
                <p className="font-body font-semibold tracking-[0.3em] uppercase mb-3" style={{ fontSize: "0.65rem", color: C.gold }}>Our Journey</p>
                <h2 className="font-handwritten" style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", color: C.dark, lineHeight: 1.1 }}>Our Story</h2>
                <OrnamentalDivider color={C.gold} />
              </div>
            ) : (
              <SectionHead eyebrow="Our Journey" title="Our Story" />
            )}
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
                    {entry.year ? <p className="font-display text-sm font-bold italic mb-1" style={{ color: C.gold }}>{entry.year}</p> : null}
                    <h3 className="font-handwritten mb-2" style={{ fontSize: "1.5rem", color: C.dark, lineHeight: 1.2 }}>{entry.title || entry.desc}</h3>
                    {entry.title && entry.desc ? <p className="font-body text-sm italic leading-relaxed" style={{ color: C.mid }}>{entry.desc}</p> : null}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tree of life illustration — closing flourish */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mt-10 mb-4">
            <img
              src="/botanical-tree.png"
              alt=""
              className="w-40 sm:w-52 opacity-90"
              style={{ filter: "drop-shadow(0 8px 28px rgba(100,80,40,0.14))" }}
            />
          </motion.div>
        </div>
      </section>}

      {/* ── Day Program / Timeline ── */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ background: C.green }}>
        {/* Botanical pattern background */}
        <div className="absolute inset-0 pointer-events-none select-none" style={{ zIndex: 0 }}>
          <img src="/botanical-pattern.png" alt="" className="w-full h-full object-cover" style={{ opacity: 0.07 }} />
        </div>
        <div className="max-w-5xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
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

          {/* Fountain illustration */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.75 }}
            className="flex justify-center mb-10">
            <img
              src="/botanical-fountain.png"
              alt=""
              className="w-44 sm:w-56 opacity-90"
              style={{ filter: "drop-shadow(0 10px 32px rgba(100,80,40,0.18))" }}
            />
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
            {themeId === "garden-rose" ? (
              <div className="text-center mb-10">
                <p className="font-body tracking-[0.32em] uppercase mb-4" style={{ fontSize: "0.62rem", color: C.gold }}>
                  Be Our Guest
                </p>
                <h2 className="font-handwritten mb-2" style={{ fontSize: "clamp(4rem, 14vw, 6rem)", color: C.dark, lineHeight: 1 }}>
                  RSVP
                </h2>
                <OrnamentalDivider color={C.gold} />
                <p className="font-body text-sm italic leading-relaxed mt-2 max-w-xs mx-auto" style={{ color: C.mid }}>
                  Kindly RSVP by {INVITE.rsvpDeadline}. Due to limited capacity, each reservation is limited to two guests, with exceptions for immediate family.
                </p>
              </div>
            ) : (
              <SectionHead eyebrow="Confirm Attendance" title="Will You Join Us?" subtitle={`Please RSVP by ${INVITE.rsvpDeadline}`} />
            )}
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
