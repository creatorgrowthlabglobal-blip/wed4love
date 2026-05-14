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
  onPay: () => void;
  onBack: () => void;
}

type Stage = "mailbox" | "envelope" | "quiz" | "balloons" | "video" | "folder";

const PreviewPayment = ({ letterData, onPay, onBack }: PreviewPaymentProps) => {
  const [showPreview, setShowPreview] = useState(false);
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
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {previewStage === "mailbox" && (
              <div key="p-mailbox" className="fixed inset-0 z-50 flex items-center justify-center"
                style={{
                  background: "radial-gradient(ellipse at center, #FBF4E4 0%, #F4E9D0 60%, #E8DAB8 100%)",
                }}
              >
                {/* Paper grain texture overlay */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.15 0 0 0 0 0.2 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundSize: "300px",
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)",
                  }}
                />
                <div className="relative w-[min(560px,90vw)] h-[min(560px,80vh)]">
                  <RealisticMailbox className="w-full h-full" onContinue={advancePreview} senderName={letterData.senderName} />
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
    </>
  );
};

export default PreviewPayment;
