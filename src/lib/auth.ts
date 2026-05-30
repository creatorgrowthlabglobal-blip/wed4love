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

function generateOTP(): string {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY as string | undefined;
  // Use bypass code until Resend API key is configured
  return apiKey ? String(Math.floor(100000 + Math.random() * 900000)) : "111111";
}

// ---------------------------------------------------------------------------
// Resend integration — plug in VITE_RESEND_API_KEY when ready
// ---------------------------------------------------------------------------
async function sendEmailViaResend(email: string, code: string): Promise<void> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY as string | undefined;
  if (!apiKey) {
    // Development fallback: log the OTP to the browser console
    console.log(`[Wish4Love OTP] Code for ${email}: ${code}`);
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Wish4Love <noreply@wish4love.com>",
      to: [email],
      subject: "Your Wish4Love verification code",
      html: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#fff8f5;border-radius:16px;">
          <h2 style="color:#f472b6;margin-bottom:8px;">Wish4Love 💕</h2>
          <p style="color:#555;margin-bottom:24px;">Here is your one-time verification code:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1a1a1a;text-align:center;padding:20px;background:#fff;border-radius:12px;border:1px solid #fce7f3;">
            ${code}
          </div>
          <p style="color:#999;font-size:13px;margin-top:20px;">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    }),
  });
}

export async function sendOTP(email: string): Promise<{ success: true } | { error: string }> {
  try {
    const code = generateOTP();
    const pending: PendingOTP = {
      email: email.trim().toLowerCase(),
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
