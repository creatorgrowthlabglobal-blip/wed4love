import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, Lock, Play, X } from "lucide-react";
import { filesToBase64 } from "@/lib/letterStorage";

import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import FramedScene from "@/components/viewer/FramedScene";
import framePng from "@/assets/pink-hearts-frame.png";
interface PreviewPaymentProps {
  letterData: {
    senderName: string;
    receiverName: string;
    letterText: string;
    images: File[];
    selectedMusic: string | null;
    letterType: "love" | "birthday" | null;
  };
  template: "photo" | "purple";
  onTemplateChange: (t: "photo" | "purple") => void;
  onPay: () => void;
  onBack: () => void;
}

type Stage = "mailbox" | "envelope";

const PreviewPayment = ({ letterData, template, onTemplateChange, onPay, onBack }: PreviewPaymentProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewStage, setPreviewStage] = useState<Stage>("mailbox");
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (showPreview) {
      filesToBase64(letterData.images).then(setPreviewImages);
    }
  }, [showPreview, letterData.images]);

  const advancePreview = () => {
    if (previewStage === "mailbox") setPreviewStage("envelope");
    else setShowPreview(false);
  };

  const openPreview = () => {
    setPreviewStage("mailbox");
    setShowPreview(true);
  };

  const closePreview = () => setShowPreview(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span className="font-body text-sm text-primary tracking-wide">Preview & Pay</span>
          </motion.div>
          <p className="font-display text-xl text-primary mb-1">Behold your creation</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your Letter Awaits
          </h2>
          <p className="font-body text-base text-muted-foreground">
            Preview the experience, then send it with love
          </p>
        </div>

        {/* Preview Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openPreview}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-heading text-lg font-bold transition-all duration-400"
            style={{
              background: "linear-gradient(135deg, hsl(280 50% 90%), hsl(340 80% 85%), hsl(40 90% 80%))",
              color: "#4B2E2E",
              boxShadow: "0 8px 32px rgba(200,80,120,0.15), 0 0 0 1px rgba(212,175,55,0.2)",
            }}
          >
            <Play className="w-5 h-5" />
            Preview Full Experience
          </motion.button>
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative letter-paper rounded-3xl p-6 sm:p-8 text-center shadow-card border border-primary/10 overflow-hidden"
        >
          <div className="absolute inset-0 gradient-romantic opacity-20" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-gentle-glow">
              <Heart className="w-6 h-6 text-primary fill-primary/30" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">$6.99</p>
            <p className="font-body text-base text-muted-foreground mb-6">
              One-time payment · Your letter lives forever
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPay}
              className="btn-glow w-full sm:w-auto px-14 py-4 bg-primary text-primary-foreground font-heading text-lg font-bold rounded-2xl shadow-romantic transition-all duration-400 hover:shadow-glow"
            >
              💳 Pay and Create
            </motion.button>
            <p className="mt-3 font-body text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              Secure payment · Instant delivery
            </p>
          </div>
        </motion.div>

        <div className="mt-6 flex justify-start">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
            className="px-6 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
            ← Go Back
          </motion.button>
        </div>
      </motion.div>

      {/* Full-screen cinematic preview overlay */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(37, 31, 40, 0.72)", boxShadow: "0 8px 24px rgba(37, 31, 40, 0.16)" }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {previewStage === "mailbox" && (
              <FramedScene key="p-mailbox">
                {template === "purple" ? (
                  <PurpleMailbox className="w-full h-full" onContinue={advancePreview} senderName={letterData.senderName} />
                ) : (
                  <RealisticMailbox className="w-full h-full" onContinue={advancePreview} senderName={letterData.senderName} />
                )}
              </FramedScene>
            )}
            {previewStage === "envelope" && (
              <div key="p-envelope" style={{ position: "fixed", inset: 0, zIndex: 40 }}>
                <EnvelopeReveal
                  receiverName={letterData.receiverName}
                  senderName={letterData.senderName}
                  letterText={letterData.letterText}
                  images={previewImages}
                  onContinue={closePreview}
                />
                <div
                  aria-hidden
                  style={{
                    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200,
                    backgroundImage: `url(${framePng})`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    WebkitMaskImage: "radial-gradient(ellipse 55% 50% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 75%, black 100%)",
                    maskImage: "radial-gradient(ellipse 55% 50% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 75%, black 100%)",
                  }}
                />
              </div>
            )}
          </>
        )}
      </AnimatePresence>

    </>
  );
};

export default PreviewPayment;
