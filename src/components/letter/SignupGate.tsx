import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, Lock, X } from "lucide-react";
import { isValidEmail, signIn, signUp } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type Mode = "signup" | "signin";

interface SignupGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-input border border-border font-body text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

/**
 * Shown right before checkout so the letter (already fully written) never
 * has to leave the page — sign up/in inline, then fall straight into the
 * payment method modal with the account's email attached.
 */
const SignupGate = ({ isOpen, onClose, onSuccess }: SignupGateProps) => {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSigninCTA, setShowSigninCTA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSigninCTA(false);
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
    const result = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      if ("noAccount" in result && result.noAccount) setShowSigninCTA(true);
      return;
    }

    supabase.functions
      .invoke("telegram-notify", {
        body: { event: mode === "signup" ? "user_signed_up" : "user_signed_in", data: { email } },
      })
      .catch(() => {});

    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onSuccess();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[125] flex items-center justify-center px-4 bg-background/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md letter-paper rounded-3xl p-6 sm:p-8 shadow-romantic border border-primary/15 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-secondary/70 hover:bg-secondary flex items-center justify-center text-foreground/70"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-5 h-5 text-primary fill-primary/30" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">Almost there 💌</h3>
              <p className="font-body text-sm text-muted-foreground">
                Your letter is ready — create a free account to save it and complete payment.
              </p>
            </div>

            <div className="flex gap-2 p-1 bg-muted/50 rounded-full mb-6">
              {(["signup", "signin"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError("");
                    setShowSigninCTA(false);
                  }}
                  className={`flex-1 py-2 rounded-full font-body text-sm font-semibold transition-all ${
                    mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                    setShowSigninCTA(false);
                  }}
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
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Re-enter your password"
                      required={mode === "signup"}
                      minLength={6}
                      autoComplete="new-password"
                      className={inputClass}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <p className="font-body text-sm text-destructive">{error}</p>}

              {showSigninCTA && (
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                  <p className="font-body text-sm text-foreground mb-2">No account found with this email.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                      setShowSigninCTA(false);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Create an account
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
              >
                <Heart className="w-4 h-4 fill-current" />
                {loading
                  ? mode === "signup"
                    ? "Creating account…"
                    : "Signing in…"
                  : mode === "signup"
                  ? "Create account & continue"
                  : "Sign in & continue"}
              </button>

              <p className="font-body text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" />
                Your letter is saved — nothing is lost
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupGate;
