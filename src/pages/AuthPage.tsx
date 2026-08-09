import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

// Google G logo SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const InputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  rightElement,
}: {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rightElement?: React.ReactNode;
}) => (
  <div className="relative">
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/70">
      <Icon className="w-4 h-4" />
    </span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm font-body outline-none transition-all bg-white"
      style={{
        borderColor: "hsl(38 40% 85%)",
        color: "hsl(30 20% 20%)",
      }}
      onFocus={e => (e.target.style.borderColor = GOLD)}
      onBlur={e => (e.target.style.borderColor = "hsl(38 40% 85%)")}
    />
    {rightElement && (
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</span>
    )}
  </div>
);

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = (location.state as { from?: string })?.from ?? "/pricing";

  const reset = () => { setError(null); setInfo(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);

    if (tab === "signin") {
      const { error } = await signInWithEmail(email, password);
      if (error) { setError(error); setBusy(false); return; }
      navigate(dest, { replace: true });
    } else {
      if (!name.trim()) { setError("Please enter your name."); setBusy(false); return; }
      const { error, session } = await signUpWithEmail(email, password, name.trim());
      if (error) { setError(error); setBusy(false); return; }
      if (session) {
        navigate(dest, { replace: true });
        return;
      }
      setInfo("Check your email to confirm your account, then sign in.");
      setTab("signin");
    }
    setBusy(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "linear-gradient(155deg, hsl(42 80% 97%) 0%, hsl(350 50% 96%) 50%, hsl(38 60% 95%) 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block font-display font-bold text-2xl tracking-tight" style={{ color: GOLD }}>
            Wed4Love
          </Link>
          <p className="mt-2 font-body text-sm" style={{ color: "hsl(30 12% 48%)" }}>
            {tab === "signin" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-amber-900/6 border p-8" style={{ borderColor: "hsl(38 40% 90%)" }}>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: "hsl(38 60% 96%)" }}>
            {(["signin", "signup"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className="flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all"
                style={tab === t
                  ? { background: GOLD_GRAD, color: "white", boxShadow: "0 2px 10px hsl(38 80% 55% / 0.25)" }
                  : { color: "hsl(30 12% 48%)" }}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={() => signInWithGoogle(`${window.location.origin}${dest}`)}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border font-body text-sm font-semibold transition-all hover:bg-gray-50 active:scale-[0.98]"
            style={{ borderColor: "hsl(38 30% 85%)", color: "hsl(30 20% 25%)" }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "hsl(38 30% 88%)" }} />
            <span className="font-body text-xs" style={{ color: "hsl(30 12% 58%)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "hsl(38 30% 88%)" }} />
          </div>

          {/* Error / Info */}
          {error && (
            <div className="flex items-start gap-2.5 mb-4 px-3.5 py-3 rounded-xl text-sm font-body" style={{ background: "hsl(0 80% 96%)", color: "hsl(0 65% 40%)", border: "1px solid hsl(0 70% 88%)" }}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2.5 mb-4 px-3.5 py-3 rounded-xl text-sm font-body" style={{ background: "hsl(140 60% 95%)", color: "hsl(140 50% 28%)", border: "1px solid hsl(140 50% 82%)" }}>
              {info}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {tab === "signup" && (
              <InputField
                icon={User}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={setName}
              />
            )}
            <InputField
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={setEmail}
            />
            <InputField
              icon={Lock}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="text-amber-400/60 hover:text-amber-500 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-1 w-full py-3 rounded-xl font-body text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: GOLD_GRAD, boxShadow: "0 4px 18px hsl(38 80% 55% / 0.28)" }}
            >
              {busy ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {tab === "signin" && (
            <p className="mt-4 text-center font-body text-xs" style={{ color: "hsl(30 12% 55%)" }}>
              Don't have an account?{" "}
              <button onClick={() => { setTab("signup"); reset(); }} className="font-semibold hover:underline" style={{ color: GOLD }}>
                Sign up free
              </button>
            </p>
          )}
        </div>

        <p className="mt-6 text-center font-body text-xs" style={{ color: "hsl(30 12% 58%)" }}>
          By continuing you agree to our{" "}
          <Link to="/terms" className="hover:underline" style={{ color: GOLD }}>Terms</Link>
          {" & "}
          <Link to="/privacy" className="hover:underline" style={{ color: GOLD }}>Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
