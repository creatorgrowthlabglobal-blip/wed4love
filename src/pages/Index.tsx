import { Suspense, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Heart, Sparkles, Music, Bell, Link as LinkIcon, Check, Mail, Mailbox, X } from "lucide-react";
import Header from "@/components/Header";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import FloatingHearts from "@/components/FloatingHearts";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import FramedScene from "@/components/viewer/FramedScene";
import Footer from "@/components/Footer";


import mailboxClosed from "@/assets/mailbox-closed.jpg";
import mailboxOpen from "@/assets/mailbox-open.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import heroPolaroid from "@/assets/photo1.jpg";
import howItWorksPhoto from "@/assets/photo2.jpg";

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
      <section className="relative overflow-hidden pt-32 sm:pt-40 pb-20 sm:pb-28">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(350_100%_96%)] to-background" />

        {/* Floating sparkle decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: "8%", top: "18%", size: 12, delay: 0 },
            { left: "44%", top: "8%", size: 10, delay: 1.2 },
            { left: "5%", top: "70%", size: 14, delay: 2 },
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

        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-12 items-center">
            {/* Copy column */}
            <div className="text-center lg:text-left">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-5"
              >
                For the ones who matter — and the things left unsaid
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6"
              >
                Memories they'll keep.{" "}
                <span className="font-handwritten text-primary italic font-normal text-[1.1em]">
                  Confessions you finally make.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="font-body text-base sm:text-lg text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                Send a keepsake letter with photos & music,
                or drop an anonymous confession — they'll never know it was you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-y-4 gap-x-6"
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

                <div className="flex flex-col items-center lg:items-start gap-2">
                  <p className="font-body text-sm text-muted-foreground">
                    Letter <strong className="text-foreground">$4.99</strong> · one-time payment
                  </p>
                  <button
                    onClick={openPreview}
                    className="group inline-flex items-center gap-1.5 font-body text-sm font-semibold text-foreground/70 hover:text-primary transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 group-hover:rotate-[-8deg] transition-transform duration-400" />
                    Preview the experience
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Image column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="relative mx-auto max-w-sm lg:max-w-none"
            >
              <div
                className="rounded-3xl overflow-hidden border border-primary/10"
                style={{ boxShadow: "0 20px 60px hsl(340 60% 70% / 0.25), 0 4px 16px hsl(0 0% 0% / 0.06)" }}
              >
                <img
                  src={heroBg}
                  alt="Handwritten love letters with roses on a writing desk"
                  className="w-full h-[340px] sm:h-[420px] lg:h-[480px] object-cover"
                />
              </div>

              {/* Floating polaroid accent */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: -6 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="hidden sm:block absolute -bottom-8 -left-8 w-32 lg:w-40 bg-white p-2 pb-4 rounded-sm"
                style={{ boxShadow: "0 12px 30px hsl(0 0% 0% / 0.18)" }}
              >
                <img src={heroPolaroid} alt="" className="w-full aspect-[3/4] object-cover rounded-[2px]" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scrolling testimonials */}
      <div className="text-center pt-4 pb-2">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-primary/70 font-semibold">
          Loved by hopeless romantics everywhere
        </p>
      </div>
      <TestimonialsMarquee className="pb-16 sm:pb-20" />

      {/* How It Works */}
      <section className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Steps column */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
                  How It Works
                </p>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Three Steps to{" "}
                  <span className="text-primary italic">Create Your Letter</span>
                </h2>
              </motion.div>

              <div className="space-y-10">
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="flex items-start gap-5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-xs text-primary font-bold tracking-wider mb-1">
                        Step {item.step}
                      </p>
                      <h3 className="font-display text-xl font-bold text-foreground mb-1.5">
                        {item.title}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Fun fact callout */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-12"
              >
                <div className="inline-flex items-start gap-2 px-5 py-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="font-body text-sm text-muted-foreground text-left">
                    <strong className="text-foreground">Fun fact:</strong> Every letter arrives in a beautiful vintage mailbox, opens into a handwritten note with your photos, and plays your chosen song.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Image column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl overflow-hidden border border-primary/10 order-first lg:order-last"
              style={{ boxShadow: "0 20px 60px hsl(340 60% 70% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.06)" }}
            >
              <img
                src={howItWorksPhoto}
                alt="A handwritten letter with rose petals and a gold locket"
                className="w-full h-[320px] sm:h-[420px] lg:h-[540px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 bg-gradient-to-b from-background to-[hsl(350_100%_97%)]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
              Simple Pricing
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              A keepsake that says it best —{" "}
              <span className="text-primary italic">unforgettable</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              A keepsake letter built to be unforgettable.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-primary/20 shadow-md text-sm font-body font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
            >
              ← Back to top
            </button>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            {/* Letter card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="letter-paper rounded-3xl p-8 text-center relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-4 right-4">
                <span className="font-body text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Keepsake
                </span>
              </div>
              <p className="font-display text-lg font-bold text-foreground mb-1">The Grand Gesture</p>
              <p className="font-body text-sm text-muted-foreground mb-3">One-time payment</p>
              <p className="font-display text-5xl font-bold text-foreground mb-1">$4.99</p>
              <p className="font-body text-xs text-muted-foreground mb-6">Yours forever — no subscriptions</p>

              <ul className="space-y-3 text-left max-w-xs mx-auto mb-8 flex-1">
                {[
                  { icon: LinkIcon, text: "Shareable unique link" },
                  { icon: Mailbox, text: "Vintage mailbox reveal" },
                  { icon: Heart, text: "Handwritten letter with your photos" },
                  { icon: Music, text: "Custom background music" },
                  { icon: Heart, text: "Lifetime keepsake link" },
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
          </div>

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
                  <div className="aspect-[4/3] relative overflow-hidden bg-[hsl(350_100%_96%)]">
                    <img src="/envelope-preview.png" alt="Envelope preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }} />
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
      <Footer />
    </div>
  );
};

export default Index;
