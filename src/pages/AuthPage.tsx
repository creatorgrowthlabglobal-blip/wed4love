import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Mail, ArrowLeft } from "lucide-react";
import FloatingHearts from "@/components/FloatingHearts";
import { isValidEmail, sendOTP, verifyOTP } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Email step ────────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const result = await sendOTP(email);
    setLoading(false);
    if ("error" in result) {
      setEmailError(result.error);
    } else {
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setResendCooldown(30);
      setStep("otp");
    }
  };

  // ── OTP step ──────────────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    digits.split("").forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = verifyOTP(email, code);
    setLoading(false);
    if ("error" in result) {
      setOtpError(result.error);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } else {
      supabase.functions.invoke("telegram-notify", {
        body: { event: "otp_verified", data: { email } },
      }).catch(() => {});
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      navigate("/create-letter", { replace: true });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const result = await sendOTP(email);
    setLoading(false);
    if ("error" in result) {
      setOtpError(result.error);
    } else {
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setResendCooldown(30);
      otpRefs.current[0]?.focus();
    }
  };

  // ── Shared UI ─────────────────────────────────────────────────────────────
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-input border border-border font-body text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4 py-12">
      {/* Background — same gradient as hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(350_100%_96%)] to-background pointer-events-none" />

      {/* Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left: "8%", top: "22%", size: 12, delay: 0 },
          { left: "88%", top: "18%", size: 10, delay: 1.2 },
          { left: "5%", top: "72%", size: 14, delay: 2 },
          { left: "92%", top: "65%", size: 8, delay: 0.6 },
          { left: "50%", top: "7%", size: 9, delay: 1.8 },
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

      <FloatingHearts count={5} />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-primary/10 p-8 pt-10"
          style={{
            boxShadow: "0 20px 60px hsl(340 60% 80% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.04)",
          }}
        >
          {/* Back button — top-left corner */}
          <button
            type="button"
            onClick={() => {
              if (step === "otp") { setStep("email"); setOtpError(""); }
              else navigate(-1);
            }}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {/* Branding — inside card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Wish4Love</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Pour your heart out,{" "}
              <span className="text-primary italic">the right way</span>
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Email ─────────────────────────────────────────── */}
            {step === "email" && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleEmailSubmit}
                className="space-y-5"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Enter your email
                  </h2>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    We'll send you a 6-digit code to verify your identity
                  </p>
                </div>

                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    autoFocus
                    className={`${inputClass} ${emailError ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20" : ""}`}
                  />
                  <AnimatePresence>
                    {emailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="font-body text-sm text-destructive mt-1.5"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                  style={{
                    boxShadow: "0 8px 30px hsl(340 100% 76% / 0.35), 0 4px 12px hsl(340 80% 60% / 0.2)",
                  }}
                >
                  {loading ? "Sending code…" : "Send Code"}
                </button>
              </motion.form>
            )}

            {/* ── Step 2: OTP ───────────────────────────────────────────── */}
            {step === "otp" && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleOtpSubmit}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Check your email 💕
                  </h2>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>
                </div>


                {/* OTP boxes */}
                <div className="flex gap-2 sm:gap-3 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      autoFocus={i === 0}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold font-display text-foreground rounded-xl bg-input border-2 focus:outline-none focus:ring-2 transition-all ${
                        otpError
                          ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                          : digit
                          ? "border-primary/60 focus:border-primary focus:ring-primary/20"
                          : "border-border focus:border-primary focus:ring-primary/20"
                      }`}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {otpError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="font-body text-sm text-destructive text-center"
                    >
                      {otpError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  style={{
                    boxShadow: "0 8px 30px hsl(340 100% 76% / 0.35), 0 4px 12px hsl(340 80% 60% / 0.2)",
                  }}
                >
                  <Heart className="w-4 h-4 fill-current" />
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>

                {/* Resend */}
                <p className="font-body text-sm text-muted-foreground text-center">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default AuthPage;
