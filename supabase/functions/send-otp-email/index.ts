import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

interface OtpRequest {
  email: string;
  code: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// In-memory rate limiter: max 3 sends per key per 10 minutes, min 30s between sends.
// Note: resets on cold start; for stronger guarantees, back this with a DB table.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const MIN_INTERVAL_MS = 30 * 1000;
const rateMap = new Map<string, number[]>();

function checkRate(key: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const hits = (rateMap.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length && now - hits[hits.length - 1] < MIN_INTERVAL_MS) {
    return { ok: false, retryAfter: Math.ceil((MIN_INTERVAL_MS - (now - hits[hits.length - 1])) / 1000) };
  }
  if (hits.length >= RATE_MAX) {
    return { ok: false, retryAfter: Math.ceil((RATE_WINDOW_MS - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  rateMap.set(key, hits);
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }


  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
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
        from: 'Wish4Love <noreply@wish4love.com>',
        to: [body.email],
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
