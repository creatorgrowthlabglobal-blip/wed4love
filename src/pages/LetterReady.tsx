import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Download, Share2, Heart, Sparkles, Video, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import { supabase } from "@/integrations/supabase/client";
import { getSignedMediaUrl } from "@/lib/letterStorage";

const LetterReady = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Use production domain for shareable links, except in development where we
  // use the local server so changes can be tested before deploying.
  const PUBLIC_BASE_URL = import.meta.env.DEV ? window.location.origin : "https://wish4love.com";
  const letterLink = `${PUBLIC_BASE_URL}/view/${id}`;
  const [copied, setCopied] = useState(false);
  const [reactionUrls, setReactionUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    supabase
      .from("letter_reactions")
      .select("video_url")
      .eq("letter_id", id)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
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

  const handleDownloadQR = async () => {
    try {
      const res = await fetch(qrCodeUrl, { mode: "cors" });
      const blob = await res.blob();
      const fileName = `wish4love-letter-${id}.png`;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // On mobile, prefer the native share sheet so users can save to Photos/Gallery.
      if (isMobile && typeof navigator.canShare === "function") {
        const file = new File([blob], fileName, { type: blob.type || "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "Wish4Love QR Code" });
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

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(letterLink)}&bgcolor=FFF3E8&color=3A3A3A`;

  return (
    <div className="min-h-screen gradient-blush relative">
      <Header />
      <FloatingHearts count={10} />
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center min-h-screen">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
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
            <div className="inline-block p-3 bg-background/60 rounded-2xl border border-border/30">
              <img src={qrCodeUrl} alt="Letter QR Code" className="w-44 h-44 rounded-lg" />
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
