import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

function notifyTelegram(event: string, data: Record<string, unknown> = {}) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return;
  const lines = [`🔔 <b>${event}</b>`];
  for (const [k, v] of Object.entries(data)) {
    if (v == null || v === '') continue;
    lines.push(`<b>${k}:</b> ${String(v).slice(0, 400)}`);
  }
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML', disable_web_page_preview: true }),
  }).catch(() => {});
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

// Rate limits: max 10 sends per 10 min per email/IP, min 10s between sends.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 10;
const MIN_INTERVAL_MS = 10 * 1000;
// Test accounts bypass throttling entirely.
const RATE_BYPASS_EMAILS = new Set(['dip206300@gmail.com']);

interface OtpRequest {
  email: string;
  code: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as OtpRequest;
    if (!body?.email || !body?.code || !isValidEmail(body.email) || !/^\d{6}$/.test(body.code)) {
      return new Response(JSON.stringify({ error: 'Invalid email or code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const email = body.email.trim().toLowerCase();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    // No server-side throttle — we rely on a client-side button cooldown so
    // legit users behind shared NATs / corporate proxies aren't blocked.

    const html = `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#fff8f5;border-radius:16px;">
        <h2 style="color:#f472b6;margin-bottom:8px;">Wish4Love 💕</h2>
        <p style="color:#555;margin-bottom:24px;">Here is your one-time verification code:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1a1a1a;text-align:center;padding:20px;background:#fff;border-radius:12px;border:1px solid #fce7f3;">
          ${body.code}
        </div>
        <p style="color:#999;font-size:13px;margin-top:20px;">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Wish4Love <mail@updates.wish4love.com>',
        to: [email],
        subject: 'Your Wish4Love verification code',
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', res.status, data);
      return new Response(JSON.stringify({ error: 'Email send failed', details: data }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record the successful attempt (best-effort).
    await admin.from('otp_attempts').insert({ email, ip });

    // Fire-and-forget Telegram notification
    notifyTelegram('otp_sent', { email, ip });

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-otp-email error:', err);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
