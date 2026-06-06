export interface AuthUser {
  id: string;
  email: string;
}

const SESSION_KEY = "w4l_session";
const OTP_KEY = "w4l_pending_otp";
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface PendingOTP {
  email: string;
  code: string;
  expiresAt: number;
}

export function getCurrentUser(): AuthUser | null {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

import { supabase } from "@/integrations/supabase/client";

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendEmailViaResend(email: string, code: string): Promise<void> {
  const { error } = await supabase.functions.invoke("send-otp-email", {
    body: { email: email.trim(), code },
  });
  if (error) {
    console.error("[Wish4Love OTP] send failed:", error);
    throw new Error("Email send failed");
  }
}

const TRIAL_EMAIL = "trial@gmail.com";
const TRIAL_CODE = "111111";

export async function sendOTP(email: string): Promise<{ success: true } | { error: string }> {
  try {
    const normalized = email.trim().toLowerCase();
    // Trial bypass account — skip Resend, accept hardcoded code.
    if (normalized === TRIAL_EMAIL) {
      const pending: PendingOTP = {
        email: normalized,
        code: TRIAL_CODE,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
      };
      sessionStorage.setItem(OTP_KEY, JSON.stringify(pending));
      return { success: true };
    }
    const code = generateOTP();
    const pending: PendingOTP = {
      email: normalized,
      code,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    };
    sessionStorage.setItem(OTP_KEY, JSON.stringify(pending));
    await sendEmailViaResend(email.trim(), code);
    return { success: true };
  } catch {
    return { error: "Failed to send code. Please try again." };
  }
}

export function verifyOTP(email: string, code: string): { user: AuthUser } | { error: string } {
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    if (!raw) return { error: "No code found. Please request a new one." };

    const pending: PendingOTP = JSON.parse(raw);

    if (pending.email !== email.trim().toLowerCase()) {
      return { error: "Email mismatch. Please request a new code." };
    }
    if (Date.now() > pending.expiresAt) {
      sessionStorage.removeItem(OTP_KEY);
      return { error: "Code expired. Please request a new one." };
    }
    if (pending.code !== code.trim()) {
      return { error: "Invalid code. Please try again." };
    }

    sessionStorage.removeItem(OTP_KEY);
    const user: AuthUser = { id: btoa(pending.email), email: pending.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { user };
  } catch {
    return { error: "Verification failed. Please try again." };
  }
}
