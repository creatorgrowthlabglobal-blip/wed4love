import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
}

const SESSION_KEY = "w4l_session";

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(user: AuthUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function signOut() {
  await supabase.auth.signOut();
  persist(null);
}

const TRIAL_EMAIL = "trial@gmail.com";
const TRIAL_PASSWORD = "trial111111";

export async function signUp(
  email: string,
  password: string
): Promise<{ user: AuthUser } | { error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) return { error: "Please enter a valid email address." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password,
    options: { emailRedirectTo: `${window.location.origin}/create-letter` },
  });
  if (error) return { error: error.message };
  if (!data.user) return { error: "Sign up failed. Please try again." };

  const user: AuthUser = { id: data.user.id, email: normalized };
  persist(user);
  return { user };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser } | { error: string; noAccount?: boolean }> {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) return { error: "Please enter a valid email address." };
  if (!password) return { error: "Please enter your password." };

  // Trial account: auto-create on first sign-in with the fixed password.
  if (normalized === TRIAL_EMAIL && password === TRIAL_PASSWORD) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password,
    });
    if (error) {
      // Try to create it.
      const res = await supabase.auth.signUp({ email: normalized, password });
      if (res.error) return { error: res.error.message };
      const user: AuthUser = { id: res.data.user!.id, email: normalized };
      persist(user);
      return { user };
    }
    const user: AuthUser = { id: data.user!.id, email: normalized };
    persist(user);
    return { user };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });
  if (error) {
    // Supabase returns the same message for wrong password and missing user.
    // Flag it so the UI can suggest signing up.
    const msg = error.message.toLowerCase();
    const looksLikeMissing = msg.includes("invalid") || msg.includes("credentials");
    return { error: error.message, noAccount: looksLikeMissing };
  }
  if (!data.user) return { error: "Sign in failed. Please try again." };

  const user: AuthUser = { id: data.user.id, email: normalized };
  persist(user);
  return { user };
}

// Keep localStorage mirror in sync with Supabase session.
supabase.auth.getSession().then(({ data }) => {
  if (data.session?.user?.email) {
    persist({ id: data.session.user.id, email: data.session.user.email });
  } else {
    // Don't clear here on first load — getSession may resolve after components mount;
    // rely on onAuthStateChange below for sign-out events.
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user?.email) {
    persist({ id: session.user.id, email: session.user.email });
  } else if (event === "SIGNED_OUT") {
    persist(null);
  }
});
