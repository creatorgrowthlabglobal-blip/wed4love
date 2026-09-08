import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Download, Share2, Heart, Sparkles, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import HeartQR from "@/components/letter/HeartQR";
import { supabase } from "@/integrations/supabase/client";
import { getSignedMediaUrl } from "@/lib/letterStorage";

const LetterReady = () => {
  const { id } = useParams();
  // Use production domain for shareable links, except in development where we
  // use the local server so changes can be tested before deploying.
  const PUBLIC_BASE_URL = import.meta.env.DEV ? window.location.origin : "https://wed4love.com";
  const letterLink = `${PUBLIC_BASE_URL}/view/${id}`;
  const [copied, setCopied] = useState(false);
  const [reactionUrls, setReactionUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (supabase as any)
      .from("letter_reactions")
      .select("video_url")
      .eq("letter_id", id)
      .order("created_at", { ascending: false })
      .then(async ({ data }: { data: { video_url: string }[] | null }) => {
        if (cancelled || !data?.length) return;
        const urls = await Promise.all(data.map((r) => getSignedMediaUrl(r.video_url)));
        if (!cancelled) setReactionUrls(urls.filter((u): u is string => !!u));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(letterLink);
    setCopied(true);
    toast.success("Link copied to clipboard! 💌");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "A Letter Written With Love 💌",
        text: "Someone special wrote you a heartfelt letter",
        url: letterLink,
      });
    } else {
      handleCopy();
    }
  };

  const qrHolderRef = useRef<HTMLDivElement>(null);

  const handleDownloadQR = async () => {
    try {
      const svgEl = qrHolderRef.current?.querySelector("svg");
      if (!svgEl) throw new Error("QR not ready");

      const serialized = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = "anonymous";
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("SVG load failed"));
      });
      img.src = svgUrl;
      await loaded;

      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = 240 * scale;
      canvas.height = 240 * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "#FFF3E8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))), "image/png");
      });

      const fileName = `wed4love-letter-${id}.png`;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile && typeof navigator.canShare === "function") {
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "Wed4Love QR Code" });
            return;
          } catch (err: any) {
            if (err?.name === "AbortError") return;
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("QR code downloaded 💌");
    } catch {
      toast.error("Couldn't download QR. Try again.");
    }
  };

  return (
    <div className="min-h-screen gradient-blush relative">
      <Header />
      <FloatingHearts count={10} />
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="max-w-md mx-auto text-center w-full"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center mx-auto mb-6 animate-gentle-glow"
          >
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-elegant-gold" />
              <span className="font-body text-sm text-primary tracking-wide">Congratulations!</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
              Your Letter Has Been Created
            </h1>
            <p className="font-body text-lg text-muted-foreground mb-8">
              Share this magical experience with your special someone
            </p>
          </motion.div>

          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="letter-paper rounded-3xl p-6 sm:p-8 shadow-glow mb-8 relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 opacity-20">
              <Heart className="w-4 h-4 text-primary fill-primary/30" />
            </div>
            <p className="font-heading text-xs text-muted-foreground uppercase tracking-widest mb-4">Scan to open letter</p>
            <div className="relative inline-block mx-auto">
              <svg
                viewBox="0 0 320 300"
                width={280}
                height={264}
                aria-hidden
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              >
                <defs>
                  <linearGradient id="heartCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE3EC" />
                    <stop offset="100%" stopColor="#FCC7D6" />
                  </linearGradient>
                  <linearGradient id="heartCardStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E86BA0" />
                    <stop offset="100%" stopColor="#B8446A" />
                  </linearGradient>
                </defs>
                <path
                  d="M160,285
                     C 20,210 -10,110 55,55
                     C 100,15 145,35 160,80
                     C 175,35 220,15 265,55
                     C 330,110 300,210 160,285 Z"
                  fill="url(#heartCardGrad)"
                  stroke="url(#heartCardStroke)"
                  strokeWidth="2.5"
                />
              </svg>
              <div
                ref={qrHolderRef}
                style={{
                  position: "relative",
                  width: 280,
                  height: 264,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 24,
                }}
              >
                <HeartQR data={letterLink} size={188} />
              </div>
            </div>
            <p className="font-body text-xs text-muted-foreground break-all mt-4 max-w-[280px] mx-auto">{letterLink}</p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              className="btn-glow inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-heading text-base font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied! 💌" : "Copy Link"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDownloadQR}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card"
            >
              <Download className="w-4 h-4" />
              Download QR
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent text-accent-foreground font-heading text-base font-semibold rounded-xl transition-all duration-300 hover:shadow-gold-glow"
            >
              <Share2 className="w-4 h-4" />
              Share With Love
            </motion.button>
          </motion.div>

          {reactionUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="letter-paper rounded-3xl p-6 mb-8"
            >
              <p className="font-heading text-xs text-muted-foreground uppercase tracking-widest mb-4 flex items-center justify-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-primary" />
                Reactions ({reactionUrls.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {reactionUrls.map((url, i) => (
                  <video
                    key={i}
                    src={url}
                    controls
                    playsInline
                    className="w-full aspect-[3/4] object-cover rounded-xl bg-black"
                  />
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-1.5 text-muted-foreground font-body text-sm"
          >
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-primary fill-primary" />
            <span>by</span>
            <span className="font-display text-base text-foreground font-semibold">Wish4Love</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default LetterReady;
