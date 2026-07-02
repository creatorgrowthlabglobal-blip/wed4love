import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token',
};

const PAY_BOT_TOKEN = Deno.env.get('TELEGRAM_PAYMENTS_BOT_TOKEN');
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_PAYMENTS_WEBHOOK_SECRET');

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deriveTelegramWebhookSecret(token: string): Promise<string> {
  const data = new TextEncoder().encode(`telegram-payment-webhook:${token}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function tg(method: string, body: unknown) {
  if (!PAY_BOT_TOKEN) return false;
  const res = await fetch(`https://api.telegram.org/bot${PAY_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error('[telegram-payment-webhook] tg', method, res.status, await res.text());
    return false;
  }
  return true;
}

async function sendLetterEmail(toEmail: string, letterUrl: string, receiverName: string | null, senderName: string | null) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
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
      <p style="font-size:15px;line-height:1.55;margin:0 0 14px">Thank you — your GCash payment has been verified.</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 22px">Here is the private link to the letter from <strong>${safeSender}</strong> to <strong>${safeReceiver}</strong>:</p>
      <p style="text-align:center;margin:24px 0"><a href="${letterUrl}" style="background:#d36a8a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold;font-size:15px">Open Your Letter</a></p>
      <p style="font-size:13px;color:#7a6a6a;word-break:break-all;margin:18px 0 0">Or copy this link: <br/>${letterUrl}</p>
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
      from: 'Wish4Love <mail@updates.wish4love.com>',
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

async function processPaymentAction(action: string, orderId: string, chatId: number | string | undefined, messageId: number | undefined, actor: string) {
  const backend = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: order, error: fetchErr } = await backend.from('ph_payment_orders').select('*').eq('order_id', orderId).maybeSingle();

  if (fetchErr || !order) {
    console.error('[telegram-payment-webhook] order not found', orderId, fetchErr);
    if (chatId) await tg('sendMessage', { chat_id: chatId, text: `⚠️ Order not found: ${orderId}` });
    return;
  }

  if (order.status === 'paid' || order.status === 'rejected') {
    if (chatId) await tg('sendMessage', { chat_id: chatId, text: `Already ${order.status}: ${orderId}` });
    return;
  }

  if (action === 'reject') {
    const { error } = await backend.from('ph_payment_orders').update({ status: 'rejected', rejected_at: new Date().toISOString() }).eq('order_id', orderId);
    if (error) throw error;
    if (chatId && messageId) {
      await tg('editMessageCaption', {
        chat_id: chatId,
        message_id: messageId,
        caption: `❌ <b>Rejected by ${actor}</b>\nOrder <code>${orderId}</code>\nEmail: ${order.email}`,
        parse_mode: 'HTML',
      });
    }
    return;
  }

  const emailed = await sendLetterEmail(order.email, order.letter_url, order.receiver_name, order.sender_name);
  const { error } = await backend.from('ph_payment_orders').update({
    status: 'paid',
    approved_at: new Date().toISOString(),
    email_sent_at: emailed ? new Date().toISOString() : null,
  }).eq('order_id', orderId);
  if (error) throw error;

  if (chatId && messageId) {
    await tg('editMessageCaption', {
      chat_id: chatId,
      message_id: messageId,
      caption:
        `✅ <b>Approved by ${actor}</b>\n` +
        `Order <code>${orderId}</code>\n` +
        `Email: ${order.email}\n` +
        `Letter link: ${order.letter_url}\n` +
        (emailed ? `📧 Letter emailed to customer.` : `⚠️ Email failed — send link manually.`),
      parse_mode: 'HTML',
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405);
  if (!PAY_BOT_TOKEN) return jsonResponse({ error: 'bot_not_configured' }, 500);

  const provided = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
  const derivedSecret = await deriveTelegramWebhookSecret(PAY_BOT_TOKEN);
  const isAuthorized = (WEBHOOK_SECRET && safeEqual(provided, WEBHOOK_SECRET)) || safeEqual(provided, derivedSecret);
  if (!isAuthorized) {
    console.warn('[telegram-payment-webhook] unauthorized callback');
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  let update: any;
  try { update = await req.json(); } catch { return jsonResponse({ error: 'bad_json' }, 400); }

  const cb = update?.callback_query;
  if (!cb?.data) return jsonResponse({ ok: true, ignored: true });

  const [action, orderId] = String(cb.data).split(':');
  const messageId = cb.message?.message_id;
  const chatId = cb.message?.chat?.id;
  const actor = cb.from?.username ? `@${cb.from.username}` : (cb.from?.first_name ?? 'admin');

  const ack = (text: string) => tg('answerCallbackQuery', { callback_query_id: cb.id, text, show_alert: false });
  if (!orderId || (action !== 'approve' && action !== 'reject')) {
    await ack('Unknown action');
    return jsonResponse({ ok: true, ignored: true });
  }

  await ack(action === 'approve' ? 'Received ✅ approving now' : 'Received ✅ rejecting now');

  const work = processPaymentAction(action, orderId, chatId, messageId, actor)
    .catch((error) => console.error('[telegram-payment-webhook] background processing failed', error));
  const waitUntil = (globalThis as any).EdgeRuntime?.waitUntil;
  if (typeof waitUntil === 'function') waitUntil(work);
  else await work;

  return jsonResponse({ ok: true, processing: true, action, orderId });
});