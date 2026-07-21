// Marks a letter as opened (idempotent, first-open-wins) and emails the
// sender a read receipt. Called once by ViewLetter.tsx when the recipient's
// envelope actually opens. Like reactions, this isn't premium-gated — no
// paid tier exists yet, so gating it would mean it never fires for anyone.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

async function sendReadReceiptEmail(senderEmail: string, receiverName: string, letterId: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!LOVABLE_API_KEY || !RESEND_API_KEY || !isValidEmail(senderEmail)) return;

  const watchUrl = `https://wish4love.com/letter-ready/${letterId}`;
  const html = `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#fff8f5;border-radius:16px;">
      <h2 style="color:#f472b6;margin-bottom:8px;">Wish4Love 💌</h2>
      <p style="color:#555;font-size:16px;">
        <strong>${receiverName || 'They'}</strong> just opened the letter you sent them.
      </p>
      <p style="margin-top:24px;">
        <a href="${watchUrl}" style="display:inline-block;background:#f472b6;color:#fff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;">View your letter</a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:20px;word-break:break-all;">Or copy this link: ${watchUrl}</p>
    </div>
  `;

  try {
    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Wish4Love <mail@updates.wish4love.com>',
        to: [senderEmail],
        subject: `💌 ${receiverName || 'They'} opened your letter`,
        html,
      }),
    });
    if (!res.ok) console.error('[mark-letter-opened] resend error', res.status, await res.text().catch(() => ''));
  } catch (e) {
    console.error('[mark-letter-opened] email send threw', e);
  }
  notifyTelegram('letter_opened', { letter_id: letterId, sender: senderEmail, receiver: receiverName });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { letter_id } = await req.json().catch(() => ({}));
    if (typeof letter_id !== 'string' || !letter_id) {
      return new Response(JSON.stringify({ error: 'letter_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Atomic first-open guard — only the request that actually flips
    // opened_at from null gets a row back, so a read receipt is never sent
    // twice even if the client calls this more than once.
    const { data: updated, error: updateError } = await supabase
      .from('letters')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', letter_id)
      .is('opened_at', null)
      .select('id, data')
      .maybeSingle();

    if (updateError) {
      console.error('[mark-letter-opened] update failed', updateError);
      return new Response(JSON.stringify({ ok: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!updated) {
      // Already opened previously (or letter doesn't exist) — nothing to do.
      return new Response(JSON.stringify({ ok: true, alreadyOpened: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const letterData = (updated.data as Record<string, unknown>) || {};
    const senderEmail = String(letterData.email || '');
    const receiverName = String(letterData.receiverName || '');

    if (senderEmail) {
      await sendReadReceiptEmail(senderEmail, receiverName, letter_id);
    }

    return new Response(JSON.stringify({ ok: true, alreadyOpened: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[mark-letter-opened] error', e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
