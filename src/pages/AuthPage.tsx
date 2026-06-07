import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Mail, ArrowLeft, Lock } from "lucide-react";
import FloatingHearts from "@/components/FloatingHearts";
import { isValidEmail, signIn, signUp } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type Mode = "signup" | "signin";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignupCTA, setShowSignupCTA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSignupCTA(false);
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result =
      mode === "signup"
        ? await signUp(email, password)
        : await signIn(email, password);
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      if ("noAccount" in result && result.noAccount) {
        setShowSignupCTA(true);
      }
      return;
    }
    supabase.functions
      .invoke("telegram-notify", {
        body: { event: mode === "signup" ? "user_signed_up" : "user_signed_in", data: { email } },
      })
      .catch(() => {});
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    navigate(from || "/create-letter", { replace: true });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-input border border-border font-body text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(350_100%_96%)] to-background pointer-events-none" />
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-primary/10 p-8 pt-10"
          style={{
            boxShadow:
              "0 20px 60px hsl(340 60% 80% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.04)",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

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

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-muted/50 rounded-full mb-6">
            {(["signup", "signin"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                  setShowSignupCTA(false);
                }}
                className={`flex-1 py-2 rounded-full font-body text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "signup" ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signup" ? -16 : 16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {mode === "signup" ? "Create your account" : "Welcome back"}
                </h2>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {mode === "signup"
                    ? "Sign up with your email to start creating letters."
                    : "Sign in with your email and password."}
                </p>
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); setShowSignupCTA(false); }}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className={inputClass}
                />
              </div>

              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      placeholder="Re-enter your password"
                      required={mode === "signup"}
                      minLength={6}
                      autoComplete="new-password"
                      className={inputClass}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="font-body text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSignupCTA && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center"
                  >
                    <p className="font-body text-sm text-foreground mb-2">
                      No account found with this email.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError("");
                        setShowSignupCTA(false);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Create an account
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                style={{
                  boxShadow:
                    "0 8px 30px hsl(340 100% 76% / 0.35), 0 4px 12px hsl(340 80% 60% / 0.2)",
                }}
              >
                <Heart className="w-4 h-4 fill-current" />
                {loading
                  ? mode === "signup" ? "Creating account…" : "Signing in…"
                  : mode === "signup" ? "Create account" : "Sign in"}
              </button>

              <p className="font-body text-sm text-muted-foreground text-center">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("signin"); setError(""); }}
                      className="font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New to Wish4Love?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("signup"); setError(""); }}
                      className="font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Create an account
                    </button>
                  </>
                )}
              </p>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
