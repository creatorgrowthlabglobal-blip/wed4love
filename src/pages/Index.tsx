import { Suspense, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Heart, Sparkles, Star, Music, Bell, PartyPopper, Link as LinkIcon, MessageSquare, Check, Mail, X, Phone, Mic, CalendarClock } from "lucide-react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import FramedScene from "@/components/viewer/FramedScene";

import mailboxClosed from "@/assets/mailbox-closed.jpg";
import mailboxOpen from "@/assets/mailbox-open.jpg";

const Index = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [template, setTemplate] = useState<"photo" | "purple">("photo");
  const [previewStage, setPreviewStage] = useState<"mailbox" | "envelope">("mailbox");

  // Warm both mailbox frames into cache the moment the landing page mounts,
  // so the preview opens with zero network wait.
  useEffect(() => {
    [mailboxClosed, mailboxOpen].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);


  const openPreview = () => {
    setShowTemplatePicker(true);
  };
  const startPreviewWith = (t: "photo" | "purple") => {
    setTemplate(t);
    setShowTemplatePicker(false);
    setPreviewStage(t === "purple" ? "envelope" : "mailbox");
    setShowPreview(true);
  };
  const closePreview = () => setShowPreview(false);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FloatingHearts count={6} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(350_100%_96%)] to-background" />

        {/* Floating sparkle decorations — clipped separately so they don't affect text layout */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: "8%", top: "30%", size: 12, delay: 0 },
            { left: "85%", top: "25%", size: 10, delay: 1.2 },
            { left: "5%", top: "65%", size: 14, delay: 2 },
            { left: "90%", top: "55%", size: 8, delay: 0.6 },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/20"
              style={{ left: s.left, top: s.top }}
              animate={{ opacity: [0.15, 0.5, 0.15], scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
              transition={{ duration: 5, repeat: Infinity, delay: s.delay }}
            >
              <Sparkles style={{ width: s.size, height: s.size }} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center max-w-4xl">
          {/* Icon badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8"
          >
            <PenLine className="w-7 h-7 text-primary" />
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-4"
          >
            For the people who matter most
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.15] mb-5"
          >
            Wish them with memories —{" "}
            <span className="text-primary italic">and never miss their day</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-body text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Send a beautifully crafted letter with photos and music — or schedule a voice
            reminder call for birthdays, anniversaries, and special days. For your loved one,
            family, mom, partner, or best friend 💕
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/create-letter"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-400 hover:scale-[1.04] active:scale-[0.97]"
              style={{
                boxShadow: "0 8px 30px hsl(340 100% 76% / 0.35), 0 4px 12px hsl(340 80% 60% / 0.2)",
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
              Create a Letter
            </Link>
            <Link
              to="/schedule-call"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-foreground border border-primary/20 font-display text-base sm:text-lg font-semibold shadow-md hover:shadow-lg hover:border-primary/40 transition-all duration-400 hover:scale-[1.04] active:scale-[0.97]"
            >
              <Bell className="w-5 h-5 text-primary" />
              Schedule a Call
            </Link>
          </motion.div>

          {/* Sub-info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="font-body text-sm text-muted-foreground mt-5"
          >
            Letter <strong className="text-foreground">$4.99</strong> · includes 2 free reminder calls · <strong className="text-foreground">$5</strong> for 10 extra calls
          </motion.p>

          {/* Preview the experience button */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-14 mx-auto w-full max-w-md"
          >
            <button
              onClick={openPreview}
              className="group w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white/70 backdrop-blur border border-primary/20 hover:border-primary/40 hover:bg-white transition-all duration-400 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                boxShadow: "0 8px 30px hsl(340 60% 80% / 0.2)",
              }}
            >
              <Mail className="w-5 h-5 text-primary group-hover:rotate-[-8deg] transition-transform duration-400" />
              <span className="font-display text-base sm:text-lg font-semibold text-foreground">
                Preview the experience
              </span>
            </button>

            <motion.p
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="font-body text-xs text-muted-foreground mt-4 text-center"
            >
              Tap to see what they'll receive ✨
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="mt-8 font-body text-sm text-muted-foreground"
          >
            <span className="font-semibold text-foreground">3,247+</span> letters
            sent •{" "}
            <span className="font-semibold text-foreground">99.7%</span> made them
            smile 😉
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
              How It Works
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Three Steps to
              <br />
              <span className="text-primary italic">Create Your Letter</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                step: "01",
                icon: PenLine,
                title: "Write Your Letter",
                desc: "Pour your heart into a beautiful letter with photos, music, and heartfelt words.",
              },
              {
                step: "02",
                icon: Music,
                title: "Add Your Song",
                desc: "Pick the perfect romantic track that plays when they open your letter.",
              },
              {
                step: "03",
                icon: Bell,
                title: "Share the Magic",
                desc: "Get a unique link to share. The moment they open it, the experience begins.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <p className="font-body text-xs text-primary font-bold tracking-wider mb-3">
                  Step {item.step}
                </p>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Fun fact callout */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-14 text-center"
          >
            <div className="inline-flex items-start gap-2 px-5 py-3 rounded-xl bg-primary/5 border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="font-body text-sm text-muted-foreground text-left">
                <strong className="text-foreground">Fun fact:</strong> Our letters include a secret PIN lock, interactive quizzes, and a cinematic Memory Vault experience!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reminder Calls Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-[hsl(350_100%_97%)] to-background">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
              Reminder Calls
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Never miss a{" "}
              <span className="text-primary italic">special day</span> again
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              Record your voice or type a message — we'll call your loved one at the perfect moment.
              Birthdays, anniversaries, "just because" days.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-12">
            {[
              { icon: Mic, title: "Record your voice", desc: "Or type a message and pick a warm voice — we handle the rest." },
              { icon: CalendarClock, title: "Pick date & time", desc: "Schedule it for their birthday, anniversary, or any meaningful day." },
              { icon: Phone, title: "We ring them up", desc: "Your message reaches them at the exact moment that matters." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link
              to="/schedule-call"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white border border-primary/20 text-foreground font-display text-base font-semibold shadow-md hover:shadow-lg hover:border-primary/40 transition-all duration-300 hover:scale-[1.03]"
            >
              <Bell className="w-4 h-4 text-primary" />
              Schedule a Reminder — 2 calls free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-background to-[hsl(350_100%_97%)]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
              Simple Pricing
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Two ways to{" "}
              <span className="text-primary italic">say it best</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              A keepsake letter or a heartfelt reminder call — both built to be unforgettable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Letter card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="rounded-3xl p-8 text-center relative overflow-hidden bg-white border border-primary/10 flex flex-col"
              style={{
                boxShadow: "0 20px 60px hsl(340 60% 80% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.04)",
              }}
            >
              <div className="absolute top-4 right-4">
                <span className="font-body text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Keepsake
                </span>
              </div>
              <p className="font-display text-lg font-bold text-foreground mb-1">The Grand Gesture</p>
              <p className="font-body text-sm text-muted-foreground mb-3">One-time payment</p>
              <p className="font-display text-5xl font-bold text-foreground mb-1">$4.99</p>
              <p className="font-body text-xs text-muted-foreground mb-6">Includes 2 free reminder calls</p>

              <ul className="space-y-3 text-left max-w-xs mx-auto mb-8 flex-1">
                {[
                  { icon: LinkIcon, text: "Shareable unique link" },
                  { icon: Music, text: "Custom background music" },
                  { icon: PartyPopper, text: "Cinematic Memory Vault" },
                  { icon: Heart, text: "Photos, videos & heartfelt letter" },
                  { icon: Phone, text: "2 free reminder calls included" },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 font-body text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                to="/create-letter"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
                style={{ boxShadow: "0 8px 24px hsl(340 100% 76% / 0.3)" }}
              >
                Create Your Letter
              </Link>
            </motion.div>

            {/* Reminder Calls top-up card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="rounded-3xl p-8 text-center relative overflow-hidden bg-gradient-to-br from-white to-[hsl(350_100%_97%)] border border-primary/20 flex flex-col"
              style={{
                boxShadow: "0 20px 60px hsl(340 60% 80% / 0.25), 0 4px 16px hsl(0 0% 0% / 0.04)",
              }}
            >
              <div className="absolute top-4 right-4">
                <span className="font-body text-xs font-semibold bg-primary/15 text-primary px-3 py-1 rounded-full">
                  Top-up
                </span>
              </div>
              <p className="font-display text-lg font-bold text-foreground mb-1">Extra Reminder Calls</p>
              <p className="font-body text-sm text-muted-foreground mb-3">For when 2 isn't enough</p>
              <p className="font-display text-5xl font-bold text-foreground mb-1">$5</p>
              <p className="font-body text-xs text-muted-foreground mb-6">10 additional reminder calls</p>

              <ul className="space-y-3 text-left max-w-xs mx-auto mb-8 flex-1">
                {[
                  { icon: Phone, text: "10 scheduled reminder calls" },
                  { icon: Mic, text: "Record your voice or use TTS" },
                  { icon: CalendarClock, text: "Schedule for the perfect day" },
                  { icon: Bell, text: "Birthday & anniversary reminders" },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 font-body text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                to="/schedule-call"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-white border border-primary/30 text-foreground font-display text-base font-semibold shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
              >
                <Bell className="w-4 h-4 text-primary" />
                Schedule a Call
              </Link>
            </motion.div>
          </div>

          {/* Pro tip */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-body text-xs text-muted-foreground text-center mt-6"
          >
            💡 <strong>Pro tip:</strong> Pair a letter with a reminder call on their special day for the ultimate surprise.
          </motion.p>
        </div>
      </section>

      {/* Envelope preview overlay */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(37, 31, 40, 0.72)",
                boxShadow: "0 8px 24px rgba(37, 31, 40, 0.16)",
              }}
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
            {previewStage === "mailbox" && template === "purple" && (
              <FramedScene key="p-mailbox-purple">
                <Suspense fallback={null}>
                  <PurpleMailbox
                    className="w-full h-full"
                    onContinue={() => setPreviewStage("envelope")}
                  />
                </Suspense>
              </FramedScene>
            )}
            {previewStage === "mailbox" && template !== "purple" && (
              <motion.div
                key="p-mailbox-photo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 50,
                  background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <RealisticMailbox
                    className="w-full h-full"
                    onContinue={() => setPreviewStage("envelope")}
                  />
                </Suspense>
              </motion.div>
            )}
            {previewStage === "envelope" && (
              <FramedScene key="p-envelope">
                <EnvelopeReveal receiverName="Someone Special" onContinue={closePreview} />
              </FramedScene>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Template picker */}
      <AnimatePresence>
        {showTemplatePicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(40,28,55,0.55)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowTemplatePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl p-4 sm:p-8 max-h-[90vh] overflow-y-auto"
              style={{ background: "linear-gradient(180deg,#FBF4E4,#F4E9D0)", boxShadow: "0 20px 60px rgba(90,70,120,0.25)" }}
            >
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-1">Choose a mailbox</h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground">Pick a template to preview</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => startPreviewWith("photo")}
                  className="rounded-2xl overflow-hidden text-left border-2 transition-all"
                  style={{ borderColor: "rgba(0,0,0,0.08)", background: "#fff" }}
                >
                  <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${mailboxClosed})` }} />
                  <div className="p-2 sm:p-4">
                    <p className="font-display text-sm sm:text-lg font-bold text-foreground leading-tight">Template 1</p>
                    <p className="font-display text-xs sm:text-sm font-semibold text-primary">Lavender Garden</p>
                    <p className="font-body text-xs text-muted-foreground mt-1 hidden sm:block">Photoreal mailbox in a cottage garden.</p>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => startPreviewWith("purple")}
                  className="rounded-2xl overflow-hidden text-left border-2 transition-all"
                  style={{ borderColor: "rgba(0,0,0,0.08)", background: "#fff" }}
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src="/envelope-preview.png" alt="Envelope preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
                  </div>
                  <div className="p-2 sm:p-4">
                    <p className="font-display text-sm sm:text-lg font-bold text-foreground leading-tight">Template 2</p>
                    <p className="font-display text-xs sm:text-sm font-semibold text-primary">Envelope Classic</p>
                    <p className="font-body text-xs text-muted-foreground mt-1 hidden sm:block">Opens straight to a beautiful envelope reveal.</p>
                  </div>
                </motion.button>
              </div>
              <div className="mt-4 sm:mt-6 flex justify-end">
                <button onClick={() => setShowTemplatePicker(false)} className="px-5 py-2 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
