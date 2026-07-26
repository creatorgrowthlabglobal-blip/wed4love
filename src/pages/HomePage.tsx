import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Star, Music, Bell, Image, Share2, Heart, Quote, PenLine } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import mailboxOpen from "@/assets/mailbox-open.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: d, ease: [0.22, 1, 0.36, 1] },
  }),
};

const HomePage = () => {

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <Header />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Blob gradient background */}
        <div className="absolute inset-0 overflow-hidden" style={{ background: "hsl(30 60% 97%)" }}>
          <div className="hero-blob hero-blob-rose" />
          <div className="hero-blob hero-blob-gold" />
          <div className="hero-blob hero-blob-lavender" />
          <div className="hero-blob hero-blob-peach" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, hsl(350 60% 98%))" }} />
        </div>

        {/* Split layout */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-20 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">

          {/* Left: Copy */}
          <div>
            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/80 border border-primary/12 shadow-sm mb-8 backdrop-blur-sm"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-body text-xs font-medium" style={{ color: "hsl(340 12% 42%)" }}>
                Loved by <strong className="text-foreground">1,200+</strong> people this month
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-bold text-foreground leading-[1.04] mb-5"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
            >
              The letter they'll{" "}
              <br />
              <span className="font-handwritten italic text-primary font-normal" style={{ fontSize: "1.08em" }}>
                read again and again.
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="font-body text-base sm:text-lg leading-relaxed mb-9"
              style={{ color: "hsl(340 12% 42%)", maxWidth: "32rem" }}
            >
              Add your music, photos & a personal quiz. They open a beautiful 3D mailbox reveal — a keepsake they'll come back to for years.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start gap-5"
            >
              <Link
                to="/get-started"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-body text-base font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, hsl(340 78% 56%), hsl(340 90% 64%))",
                  boxShadow: "0 10px 32px hsl(340 80% 65% / 0.38), 0 2px 8px hsl(340 70% 60% / 0.18)",
                }}
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {["Free to try", "$9.99 to send", "Money-back guarantee"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 font-body text-xs" style={{ color: "hsl(340 10% 52%)" }}>
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="flex flex-wrap gap-2 mt-8"
            >
              {[
                { icon: Music, label: "Custom Music" },
                { icon: Image, label: "Photos & Videos" },
                { icon: Bell, label: "Read Receipts" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid hsl(340 40% 88%)",
                    color: "hsl(340 30% 38%)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Product visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 32px 72px hsl(340 50% 60% / 0.20), 0 8px 24px hsl(0 0% 0% / 0.09)" }}
            >
              <img
                src={mailboxOpen}
                alt="Love letter mailbox experience"
                className="w-full object-cover"
                style={{ aspectRatio: "4/3" }}
              />
            </div>

            {/* Floating: read receipt */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -top-5 -right-8 bg-white rounded-2xl px-4 py-3 border border-gray-100/80"
              style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.10)", minWidth: 190 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center shrink-0 text-base">💌</div>
                <div>
                  <p className="font-body text-xs font-semibold text-foreground leading-tight">She just opened it!</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">2 minutes ago ✓✓</p>
                </div>
              </div>
            </motion.div>

            {/* Floating: music */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-5 -left-8 bg-white rounded-2xl px-4 py-3 border border-gray-100/80"
              style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.10)", minWidth: 192 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "hsl(340 80% 93%)" }}>🎵</div>
                <div>
                  <p className="font-body text-[10px] text-muted-foreground leading-tight">Now playing</p>
                  <p className="font-body text-xs font-semibold text-foreground mt-0.5">Honeymoon Avenue</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </section>


      {/* ── How It Works ── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6" style={{ background: "hsl(24 60% 98%)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-16"
          >
            <p className="font-body text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Simple as that</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Three steps to{" "}
              <span className="font-handwritten text-primary italic font-normal text-[1.1em]">blow their mind</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px" style={{ background: "linear-gradient(to right, hsl(340 60% 88%), hsl(340 60% 88%))" }} />

            {[
              {
                step: "01", icon: PenLine, emoji: "✏️",
                title: "Write your letter",
                desc: "Pick a template, pour your heart in, add up to 6 photos and a personal quiz that only they can answer.",
              },
              {
                step: "02", icon: Music, emoji: "🎵",
                title: "Add your song",
                desc: "Upload your own audio or search any song — it plays automatically the moment they open the letter.",
              },
              {
                step: "03", icon: Share2, emoji: "📤",
                title: "Share the link",
                desc: "Send one link anywhere — WhatsApp, Instagram DM, SMS. They get a full 3D cinematic reveal.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.14 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5 relative z-10"
                  style={{ background: "white", boxShadow: "0 4px 20px hsl(340 50% 70% / 0.15), 0 1px 4px hsl(0 0% 0% / 0.06)" }}
                >
                  {s.emoji}
                </div>
                <span className="font-body text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60 mb-2">{s.step}</span>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-[220px]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-14"
          >
            <p className="font-body text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Everything included</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              One letter.{" "}
              <span className="font-handwritten text-primary italic font-normal text-[1.1em]">A hundred feelings.</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-4 max-w-sm mx-auto">Every feature is included. No upgrades, no subscriptions.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: "💌", title: "3D Mailbox Reveal", desc: "A beautiful animated mailbox opens before their eyes — they'll screenshot it immediately.", accent: "hsl(340 80% 92%)" },
              { icon: "🎵", title: "Custom Music", desc: "Upload your own track or search any YouTube song. It plays the second they open.", accent: "hsl(280 55% 92%)" },
              { icon: "📸", title: "Photos & Videos", desc: "Embed up to 6 photos inside the letter, with smooth scroll reveals between them.", accent: "hsl(38 80% 92%)" },
              { icon: "🎤", title: "Voice Messages", desc: "Record a short personal note — your actual voice playing after they read means everything.", accent: "hsl(340 80% 92%)" },
              { icon: "🔔", title: "Read Receipts", desc: "Get a quiet notification the exact moment they open your letter. No more wondering.", accent: "hsl(160 50% 90%)" },
              { icon: "🔒", title: "Locked Until a Date", desc: "Lock it until midnight on their birthday or your anniversary — with a live countdown.", accent: "hsl(38 80% 92%)" },
              { icon: "🎂", title: "Birthday Edition", desc: "A special festive mailbox, balloon pop game, and birthday-exclusive design — all included.", accent: "hsl(38 80% 92%)" },
              { icon: "🎯", title: "Personal Quiz", desc: "Set a quiz only they can answer — adds an intimate, playful layer before they read.", accent: "hsl(280 55% 92%)" },
              { icon: "♾️", title: "Never Expires", desc: "Your link lives forever. They can open it years from now and relive the moment.", accent: "hsl(340 80% 92%)" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl p-5 sm:p-6 border"
                style={{ background: "white", borderColor: "hsl(340 40% 92%)", boxShadow: "0 2px 12px hsl(340 30% 70% / 0.07)" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6" style={{ background: "hsl(340 28% 16%)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-14"
          >
            <p className="font-body text-[11px] tracking-[0.25em] uppercase font-semibold mb-3" style={{ color: "hsl(340 60% 70%)" }}>Real reactions</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: "hsl(30 40% 95%)" }}>
              What people are{" "}
              <span className="font-handwritten italic font-normal" style={{ color: "hsl(340 80% 72%)", fontSize: "1.1em" }}>saying</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "She cried happy tears when she opened it. She keeps sharing it with her friends weeks later. Best $9.99 I ever spent.",
                name: "Alex", age: 24, initial: "A", color: "hsl(340 70% 65%)",
              },
              {
                quote: "I sent this for our anniversary and she still sends me screenshots of it months later. Nothing I've sent has ever hit like this.",
                name: "Marcus", age: 29, initial: "M", color: "hsl(38 70% 60%)",
              },
              {
                quote: "Way more personal than flowers or a gift. When her favorite song started playing inside the letter she completely lost it.",
                name: "Jordan", age: 26, initial: "J", color: "hsl(280 50% 68%)",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ background: "hsl(340 22% 20%)", border: "1px solid hsl(340 20% 26%)" }}
              >
                <Quote className="w-5 h-5 opacity-40" style={{ color: t.color }} />
                <p className="font-body text-sm leading-relaxed flex-1" style={{ color: "hsl(30 30% 85%)" }}>"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "hsl(340 20% 24%)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold text-white shrink-0" style={{ background: t.color }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold" style={{ color: "hsl(30 30% 88%)" }}>{t.name}, {t.age}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6" style={{ background: "hsl(24 60% 98%)" }}>
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-12"
          >
            <p className="font-body text-[11px] tracking-[0.25em] uppercase text-primary font-semibold mb-3">Simple pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              One price.{" "}
              <span className="font-handwritten text-primary italic font-normal text-[1.1em]">Theirs forever.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="rounded-3xl p-8 text-center"
            style={{
              background: "white",
              border: "1.5px solid hsl(340 50% 88%)",
              boxShadow: "0 16px 48px hsl(340 50% 70% / 0.14), 0 4px 16px hsl(0 0% 0% / 0.05)",
            }}
          >
            <div className="inline-flex items-baseline gap-1 mb-1">
              <span className="font-display text-5xl font-bold text-foreground">$9.99</span>
              <span className="font-body text-sm text-muted-foreground">/ letter</span>
            </div>
            <p className="font-body text-xs text-muted-foreground mb-8">One-time · No subscription · Link never expires</p>

            <ul className="space-y-3 text-left mb-8">
              {[
                "All templates — love & birthday",
                "Custom music + YouTube search",
                "3D mailbox & paper reveals",
                "Photos, voice notes & videos",
                "Personal quiz & locked date",
                "Read receipts & reactions",
                "Full money-back guarantee",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 font-body text-sm text-foreground/80">
                  <div className="w-5 h-5 rounded-full bg-primary/12 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/get-started"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl font-body text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, hsl(340 78% 56%), hsl(340 90% 64%))",
                boxShadow: "0 8px 28px hsl(340 80% 65% / 0.35)",
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-5 flex flex-col items-center gap-1.5">
              <p className="font-body text-xs text-muted-foreground">🛡️ If they never open it, we'll refund you — no questions asked.</p>
              <p className="font-body text-xs text-muted-foreground">🔒 Visa · Mastercard · Apple Pay · Google Pay · GCash</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-24 sm:py-32 px-4 sm:px-6 text-center"
        style={{ background: "linear-gradient(135deg, hsl(340 80% 96%) 0%, hsl(330 60% 94%) 50%, hsl(38 70% 95%) 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-4xl mb-6">💌</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              Ready to make{" "}
              <span className="font-handwritten text-primary italic font-normal text-[1.08em]">their day?</span>
            </h2>
            <p className="font-body text-base sm:text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              It takes 10 minutes to create. The feeling it gives them lasts forever.
            </p>
            <Link
              to="/get-started"
              className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-body text-base font-semibold text-white transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, hsl(340 78% 56%), hsl(340 90% 64%))",
                boxShadow: "0 12px 36px hsl(340 80% 65% / 0.40), 0 4px 12px hsl(340 70% 60% / 0.20)",
              }}
            >
              <Heart className="w-4 h-4 fill-current" />
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <p className="font-body text-xs text-muted-foreground/60 mt-5">Free to create · $9.99 to send · Links never expire</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
