// Telegram webhook for the Philippine payments bot.
// Handles inline-button callbacks: approve:<order_id> | reject:<order_id>
// On approve: marks order paid and emails the letter link via Resend.
// Secured with Telegram's X-Telegram-Bot-Api-Secret-Token header.
//
// Register the webhook (run once, then any time the token rotates):
//   curl "https://api.telegram.org/bot<PAYMENTS_BOT_TOKEN>/setWebhook" \
//     -H 'Content-Type: application/json' \
//     -d '{"url":"https://fejocgswxpxtrtwknxms.supabase.co/functions/v1/telegram-payment-webhook",
//          "secret_token":"<deriveSecret(PAYMENTS_BOT_TOKEN)>",
//          "allowed_updates":["callback_query"]}'
//
// The secret is derived from TELEGRAM_PAYMENTS_BOT_TOKEN so both sides agree
// without storing an extra secret.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token',
};

const PAY_BOT_TOKEN = Deno.env.get('TELEGRAM_PAYMENTS_BOT_TOKEN');

async function deriveSecret(token: string): Promise<string> {
  const data = new TextEncoder().encode(`ph-payment-webhook:${token}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function tg(method: string, body: unknown) {
  if (!PAY_BOT_TOKEN) return;
  const res = await fetch(`https://api.telegram.org/bot${PAY_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('[telegram-payment-webhook] tg', method, res.status, await res.text());
}

async function sendLetterEmail(toEmail: string, letterUrl: string, receiverName: string | null, senderName: string | null) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const resendKey  = Deno.env.get('RESEND_API_KEY');
  if (!lovableKey || !resendKey) {
    console.error('[telegram-payment-webhook] Resend not configured');
    return false;
  }

  const safeReceiver = receiverName ?? 'your special someone';
  const safeSender = senderName ?? 'someone who loves you';

  const html = `
  <div style="font-family:Georgia,serif;background:#fff8f3;padding:32px;color:#3b2a2a">
    <div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #f3d9d0">
      <h1 style="font-size:24px;margin:0 0 12px;color:#b85c7b">Your Wish4Love letter is ready 💌</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 14px">
        Thank you — your GCash payment has been verified.
      </p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 22px">
        Here is the private link to the letter from <strong>${safeSender}</strong> to <strong>${safeReceiver}</strong>:
      </p>
      <p style="text-align:center;margin:24px 0">
        <a href="${letterUrl}" style="background:#d36a8a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold;font-size:15px">Open Your Letter</a>
      </p>
      <p style="font-size:13px;color:#7a6a6a;word-break:break-all;margin:18px 0 0">
        Or copy this link: <br/>${letterUrl}
      </p>
      <p style="font-size:12px;color:#a59494;margin-top:28px">This letter lives forever. Save the link somewhere safe.</p>
    </div>
  </div>`;

  const res = await fetch('https://connector-gateway.lovable.dev/resend/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': resendKey,
    },
    body: JSON.stringify({
      from: 'Wish4Love <onboarding@resend.dev>',
      to: [toEmail],
      subject: '💌 Your Wish4Love letter is ready',
      html,
    }),
  });
  if (!res.ok) {
    console.error('[telegram-payment-webhook] resend failed', res.status, await res.text());
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  if (!PAY_BOT_TOKEN) {
    return new Response('bot not configured', { status: 500 });
  }

  const expected = await deriveSecret(PAY_BOT_TOKEN);
  const provided = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
  if (!safeEqual(provided, expected)) {
    return new Response('unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let update: any;
  try { update = await req.json(); } catch { return new Response('bad json', { status: 400 }); }

  const cb = update?.callback_query;
  if (!cb?.data) {
    // Ignore non-callback updates
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const [action, orderId] = String(cb.data).split(':');
  const messageId = cb.message?.message_id;
  const chatId    = cb.message?.chat?.id;
  const actor     = cb.from?.username ? `@${cb.from.username}` : (cb.from?.first_name ?? 'admin');

  const ack = (text: string) =>
    tg('answerCallbackQuery', { callback_query_id: cb.id, text, show_alert: false });

  if (!orderId || (action !== 'approve' && action !== 'reject')) {
    await ack('Unknown action');
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  const { data: order, error: fetchErr } = await supabase
    .from('ph_payment_orders')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (fetchErr || !order) {
    await ack('Order not found');
    return new Response(JSON.stringify({ ok: false, error: 'order_not_found' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (order.status === 'paid' || order.status === 'rejected') {
    await ack(`Already ${order.status}`);
    return new Response(JSON.stringify({ ok: true, already: order.status }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'reject') {
    await supabase.from('ph_payment_orders')
      .update({ status: 'rejected', rejected_at: new Date().toISOString() })
      .eq('order_id', orderId);

    await ack('Rejected');
    if (chatId && messageId) {
      await tg('editMessageCaption', {
        chat_id: chatId, message_id: messageId,
        caption: `❌ <b>Rejected by ${actor}</b>\nOrder <code>${orderId}</code>\nEmail: ${order.email}`,
        parse_mode: 'HTML',
      });
    }
    return new Response(JSON.stringify({ ok: true, status: 'rejected' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // approve
  const emailed = await sendLetterEmail(order.email, order.letter_url, order.receiver_name, order.sender_name);

  await supabase.from('ph_payment_orders')
    .update({
      status: 'paid',
      approved_at: new Date().toISOString(),
      email_sent_at: emailed ? new Date().toISOString() : null,
    })
    .eq('order_id', orderId);

  await ack(emailed ? 'Approved & emailed ✅' : 'Approved, but email failed');

  if (chatId && messageId) {
    await tg('editMessageCaption', {
      chat_id: chatId, message_id: messageId,
      caption:
        `✅ <b>Approved by ${actor}</b>\n` +
        `Order <code>${orderId}</code>\n` +
        `Email: ${order.email}\n` +
        `Letter link: ${order.letter_url}\n` +
        (emailed ? `📧 Letter emailed to customer.` : `⚠️ Email failed — send link manually.`),
      parse_mode: 'HTML',
    });
  }

  return new Response(JSON.stringify({ ok: true, status: 'paid', emailed }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
