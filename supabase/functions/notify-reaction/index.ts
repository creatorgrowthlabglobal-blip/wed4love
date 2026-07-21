// Emails a letter's sender when a recipient leaves a video reaction.
// Unlike read receipts this isn't premium-gated — reaction capture is a
// growth/virality feature, open to everyone, not a paid add-on.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { letter_id, debug } = await req.json().catch(() => ({}));
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

    const { data: letterRow } = await supabase
      .from('letters')
      .select('data')
      .eq('id', letter_id)
      .maybeSingle();

    const letterData = (letterRow?.data as Record<string, unknown>) || {};
    const senderEmail = String(letterData.email || '');
    const receiverName = String(letterData.receiverName || 'Someone');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (senderEmail && isValidEmail(senderEmail) && LOVABLE_API_KEY && RESEND_API_KEY) {
      const watchUrl = `https://wish4love.com/reaction/${letter_id}`;
      const html = `
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#fff8f5;border-radius:16px;">
          <h2 style="color:#f472b6;margin-bottom:8px;">Wish4Love 🎥</h2>
          <p style="color:#555;font-size:16px;">
            <strong>${receiverName}</strong> just left you a video reaction to your letter!
          </p>
          <p style="margin-top:24px;">
            <a href="${watchUrl}" style="display:inline-block;background:#f472b6;color:#fff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;">Watch the reaction</a>
          </p>
          <p style="color:#999;font-size:12px;margin-top:20px;word-break:break-all;">Or copy this link: ${watchUrl}</p>
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
          to: [senderEmail],
          subject: `🎥 ${receiverName} left you a reaction!`,
          html,
        }),
      });
      const resText = await res.text().catch(() => '');
      if (!res.ok) console.error('[notify-reaction] resend error', res.status, resText);
      if (debug) {
        return new Response(JSON.stringify({ ok: true, debug: { attempted: true, resendStatus: res.status, resendBody: resText, senderEmail } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (debug) {
      return new Response(JSON.stringify({
        ok: true,
        debug: {
          attempted: false,
          senderEmail,
          isValidEmail: isValidEmail(senderEmail),
          hasLovableKey: !!LOVABLE_API_KEY,
          hasResendKey: !!RESEND_API_KEY,
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    if (token && chatId) {
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🎥 <b>Reaction Left</b>\n<b>letter_id:</b> ${letter_id}\n<b>sender:</b> ${senderEmail}\n<b>receiver:</b> ${receiverName}`,
          parse_mode: 'HTML',
        }),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[notify-reaction] error', e);
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
