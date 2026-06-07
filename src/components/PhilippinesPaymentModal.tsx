import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle, Lock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PhilippinesPaymentModalProps {
  onClose: () => void;
  letterId: string;
  senderName: string;
  receiverName: string;
  letterType: "love" | "birthday" | null;
  letterUrl: string;
}

type Step = "qr" | "proof" | "success";

const PhilippinesPaymentModal = ({
  onClose,
  letterId,
  senderName,
  receiverName,
  letterType,
  letterUrl,
}: PhilippinesPaymentModalProps) => {
  const [step, setStep] = useState<Step>("qr");
  const [email, setEmail] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!proofFile) { setError("Please upload a screenshot of your payment."); return; }

    setSubmitting(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(proofFile);
      });

      const { error: fnError } = await supabase.functions.invoke("submit-gcash-payment", {
        body: {
          letter_id: letterId,
          sender_name: senderName,
          receiver_name: receiverName,
          letter_type: letterType,
          email: email.trim(),
          proof_base64: base64,
          proof_mime: proofFile.type || "image/jpeg",
          letter_url: letterUrl,
        },
      });

      if (fnError) throw fnError;
      setStep("success");
    } catch (e) {
      console.error("[PhilippinesPaymentModal] submit failed", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[130] flex items-center justify-center px-4 bg-background/70 backdrop-blur-md"
      onClick={step === "success" ? onClose : undefined}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md letter-paper rounded-3xl p-4 sm:p-6 shadow-romantic border border-primary/15 max-h-[90vh] overflow-y-auto"
      >
        {step !== "success" && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-secondary/70 hover:bg-secondary flex items-center justify-center text-foreground/70"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <AnimatePresence mode="wait">

          {/* ── Step 1: QR code ─────────────────────────────────────── */}
          {step === "qr" && (
            <motion.div key="qr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-2">
                <h3 className="font-display text-xl font-bold text-foreground">Scan to Pay 🇵🇭</h3>
                <p className="font-body text-xs text-muted-foreground">GCash, bank transfer, or any QR payment app</p>
              </div>

              {/* QR + amount stacked tight */}
              <div className="flex flex-col items-center mb-3">
                <div className="p-2 rounded-2xl border-2 border-primary/20 bg-white shadow-card">
                  <img
                    src="/gcash-qr.png"
                    alt="Payment QR Code"
                    className="w-52 h-52 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = "flex";
                    }}
                  />
                  <div className="w-52 h-52 hidden items-center justify-center text-center text-muted-foreground text-xs p-4 rounded-xl bg-secondary/50">
                    QR code coming soon
                  </div>
                </div>
                <p className="font-display text-4xl font-bold text-foreground mt-2">₱149</p>
                <p className="font-body text-xs text-muted-foreground">One-time · Letter lives forever</p>
              </div>

              <p className="text-center font-body text-xs text-muted-foreground mb-3">
                Scan the QR, pay ₱149, screenshot your receipt, then tap below.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("proof")}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-heading text-base font-bold rounded-2xl shadow-romantic"
              >
                I've Paid — Upload Proof <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ── Step 2: Email + proof upload ────────────────────────── */}
          {step === "proof" && (
            <motion.div key="proof" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">Upload Proof</h3>
                <p className="font-body text-sm text-muted-foreground">We'll verify and send your letter by email</p>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="font-body text-sm font-semibold text-foreground mb-1.5 block">
                    Your email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-secondary/50 text-foreground font-body text-sm outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Proof upload */}
                <div>
                  <label className="font-body text-sm font-semibold text-foreground mb-1.5 block">
                    Payment screenshot / receipt
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {proofPreview ? (
                    <div
                      className="relative rounded-xl overflow-hidden border border-border/60 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <img src={proofPreview} alt="Payment proof" className="w-full max-h-44 object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-semibold">Tap to change</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-28 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="font-body text-sm font-medium">Tap to upload screenshot</span>
                    </button>
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-body text-center">{error}</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 bg-primary text-primary-foreground font-heading text-base font-bold rounded-2xl shadow-romantic disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Submit Payment Proof"}
                </motion.button>

                <p className="text-center font-body text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" /> Your details are kept private
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Success ──────────────────────────────────────── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Payment Submitted! 🎉</h3>
              <p className="font-body text-sm text-muted-foreground mb-1">
                We're verifying your payment. Your letter will be sent to:
              </p>
              <p className="font-heading text-base font-semibold text-primary mb-4">{email}</p>
              <p className="font-body text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
                This usually takes a few minutes. Check your inbox and spam folder.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-10 py-3 bg-primary text-primary-foreground font-heading text-sm font-bold rounded-xl"
              >
                Done
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PhilippinesPaymentModal;
