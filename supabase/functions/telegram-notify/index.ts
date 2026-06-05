import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface NotifyBody {
  event: string;
  data?: Record<string, unknown>;
}

const ICONS: Record<string, string> = {
  otp_sent: '📩',
  otp_verified: '✅',
  letter_created: '💌',
  payment_success: '💰',
  payment_failed: '❌',
  whatsapp_click: '📱',
  contact_message: '✉️',
  checkout_started: '🛒',
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function format(event: string, data: Record<string, unknown> = {}) {
  const icon = ICONS[event] || '🔔';
  const title = event.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const lines = [`${icon} <b>${esc(title)}</b>`];
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined || v === '') continue;
    const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
    lines.push(`<b>${esc(k)}:</b> ${esc(val).slice(0, 500)}`);
  }
  lines.push(`<i>${new Date().toISOString()}</i>`);
  return lines.join('\n');
}

export async function sendTelegram(event: string, data: Record<string, unknown> = {}) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!token || !chatId) {
    console.warn('[telegram-notify] missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return { ok: false, error: 'not configured' };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: format(event, data),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) console.error('[telegram-notify] telegram error', res.status, j);
    return { ok: res.ok, result: j };
  } catch (e) {
    console.error('[telegram-notify] threw', e);
    return { ok: false, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = (await req.json()) as NotifyBody;
    if (!body?.event) {
      return new Response(JSON.stringify({ error: 'event required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = await sendTelegram(body.event, body.data || {});
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
