import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, Lock, Play, X } from "lucide-react";
import { QuizQuestion } from "@/components/letter/QuizCreation";
import { filesToBase64 } from "@/lib/letterStorage";

import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import QuizExperience from "@/components/viewer/QuizExperience";
import BalloonGame from "@/components/viewer/BalloonGame";
import VideoPlayer from "@/components/viewer/VideoPlayer";
import MemoryFolder from "@/components/viewer/MemoryFolder";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import mailboxClosedThumb from "@/assets/mailbox-closed.jpg";

interface PreviewPaymentProps {
  letterData: {
    senderName: string;
    receiverName: string;
    letterText: string;
    images: File[];
    videos: File[];
    audios: File[];
    selectedMusic: string | null;
    quiz: QuizQuestion[];
    letterType: "love" | "birthday" | null;
  };
  template: "photo" | "purple";
  onTemplateChange: (t: "photo" | "purple") => void;
  onPay: () => void;
  onBack: () => void;
}

type Stage = "mailbox" | "envelope" | "quiz" | "balloons" | "video" | "folder";

const PreviewPayment = ({ letterData, template, onTemplateChange, onPay, onBack }: PreviewPaymentProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [previewStage, setPreviewStage] = useState<Stage>("envelope");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [previewAudios, setPreviewAudios] = useState<string[]>([]);

  useEffect(() => {
    if (showPreview) {
      filesToBase64(letterData.images).then(setPreviewImages);
      filesToBase64(letterData.videos).then(setPreviewVideos);
      filesToBase64(letterData.audios).then(setPreviewAudios);
    }
  }, [showPreview, letterData.images, letterData.videos, letterData.audios]);

  const hasQuiz = letterData.quiz.filter(q => q.question && q.correctAnswer).length > 0;
  const isBirthday = letterData.letterType === "birthday";
  const hasMedia = letterData.videos.length > 0 || letterData.audios.length > 0;

  const getNextStage = (current: Stage): Stage | null => {
    const flow: Stage[] = ["mailbox", "envelope"];
    if (hasQuiz) flow.push("quiz");
    if (isBirthday) flow.push("balloons");
    if (hasMedia) flow.push("video");
    flow.push("folder");
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const advancePreview = () => {
    const next = getNextStage(previewStage);
    if (next) setPreviewStage(next);
    else setShowPreview(false);
  };

  const openPreview = () => {
    setShowTemplatePicker(true);
  };

  const startPreviewWith = (t: "photo" | "purple") => {
    onTemplateChange(t);
    setShowTemplatePicker(false);
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
              style={{
                background: "rgba(37, 31, 40, 0.72)",
                boxShadow: "0 8px 24px rgba(37, 31, 40, 0.16)",
              }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {previewStage === "mailbox" && (
              <div key="p-mailbox" className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: "#F2EFE8" }}
              >
                <div className="relative w-[min(560px,90vw)] h-[min(560px,80vh)]">
                  {template === "purple" ? (
                    <PurpleMailbox className="w-full h-full" onContinue={advancePreview} senderName={letterData.senderName} />
                  ) : (
                    <RealisticMailbox className="w-full h-full" onContinue={advancePreview} senderName={letterData.senderName} />
                  )}
                </div>
              </div>
            )}
            {previewStage === "envelope" && (
              <EnvelopeReveal key="p-envelope" receiverName={letterData.receiverName} onContinue={advancePreview} />
            )}
            {previewStage === "quiz" && (
              <QuizExperience key="p-quiz" questions={letterData.quiz.filter(q => q.question && q.correctAnswer)} onComplete={advancePreview} />
            )}
            {previewStage === "balloons" && (
              <BalloonGame key="p-balloons" onComplete={advancePreview} />
            )}
            {previewStage === "video" && (
              <VideoPlayer key="p-video" videos={previewVideos} audios={previewAudios} onContinue={advancePreview} />
            )}
            {previewStage === "folder" && (
              <MemoryFolder
                key="p-folder"
                letterText={letterData.letterText}
                senderName={letterData.senderName}
                receiverName={letterData.receiverName}
                images={previewImages}
              />
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
              className="w-full max-w-2xl rounded-3xl p-6 sm:p-8"
              style={{ background: "linear-gradient(180deg,#FBF4E4,#F4E9D0)", boxShadow: "0 20px 60px rgba(90,70,120,0.25)" }}
            >
              <div className="text-center mb-6">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">Choose a mailbox</h3>
                <p className="font-body text-sm text-muted-foreground">Pick the template your recipient will see</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => startPreviewWith("photo")}
                  className="rounded-2xl overflow-hidden text-left border-2 transition-all"
                  style={{ borderColor: template === "photo" ? "hsl(340 80% 70%)" : "rgba(0,0,0,0.08)", background: "#fff" }}
                >
                  <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: "url(${mailboxClosedThumb})" }} />
                  <div className="p-4">
                    <p className="font-display text-lg font-bold text-foreground">Template 1 · Lavender Garden</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">Photoreal mailbox in a cottage garden with birds.</p>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => startPreviewWith("purple")}
                  className="rounded-2xl overflow-hidden text-left border-2 transition-all"
                  style={{ borderColor: template === "purple" ? "hsl(340 80% 70%)" : "rgba(0,0,0,0.08)", background: "#fff" }}
                >
                  <div className="aspect-[4/3] flex items-center justify-center" style={{ background: "linear-gradient(180deg,#F2EFE8,#E8DEFF)" }}>
                    <div style={{ fontSize: 72 }}>📫</div>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg font-bold text-foreground">Template 2 · Purple Classic</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">Illustrated purple mailbox — envelope slides out of the slot.</p>
                  </div>
                </motion.button>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowTemplatePicker(false)} className="px-5 py-2 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PreviewPayment;
