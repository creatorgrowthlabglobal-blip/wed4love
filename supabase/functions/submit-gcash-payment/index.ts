import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const CHAT_ID   = Deno.env.get('TELEGRAM_CHAT_ID');
const PAY_BOT_TOKEN = Deno.env.get('TELEGRAM_PAYMENTS_BOT_TOKEN');
const PAY_CHAT_ID   = Deno.env.get('TELEGRAM_PAYMENTS_CHAT_ID');

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PH-${ts}-${rand}`;
}

async function sendTelegramPhoto(
  token: string | undefined,
  chatId: string | undefined,
  photoBase64: string,
  mime: string,
  caption: string,
  replyMarkup?: unknown,
): Promise<{ message_id?: number; chat_id?: string } | null> {
  if (!token || !chatId) {
    console.warn('[submit-gcash-payment] Telegram not configured');
    return null;
  }

  const binaryStr = atob(photoBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');
  form.append('photo', new Blob([bytes], { type: mime }), 'proof.jpg');
  if (replyMarkup) form.append('reply_markup', JSON.stringify(replyMarkup));

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[submit-gcash-payment] sendPhoto failed', res.status, err);
    return null;
  }
  const data = await res.json();
  return { message_id: data?.result?.message_id, chat_id: chatId };
}

async function sendTelegramMessage(token: string | undefined, chatId: string | undefined, text: string) {
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: false }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const {
      letter_id,
      sender_name,
      receiver_name,
      letter_type,
      email,
      proof_base64,
      proof_mime,
      letter_url,
    } = await req.json();

    if (!letter_id || !email || !proof_base64 || !letter_url) {
      return new Response(JSON.stringify({ ok: false, error: 'missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const order_id = generateOrderId();

    // Persist the order (service role)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: insertErr } = await supabase.from('ph_payment_orders').insert({
      order_id,
      letter_id,
      email: String(email).trim().toLowerCase(),
      sender_name,
      receiver_name,
      letter_type: letter_type ?? 'love',
      letter_url,
      amount: 149,
      status: 'pending',
      telegram_chat_id: PAY_CHAT_ID ?? null,
    });
    if (insertErr) {
      console.error('[submit-gcash-payment] insert order failed', insertErr);
      return new Response(JSON.stringify({ ok: false, error: 'order_insert_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const caption =
      `🇵🇭 <b>GCash Payment Proof</b>\n` +
      `<b>Order:</b> <code>${order_id}</code>\n` +
      `<b>From:</b> ${sender_name ?? '—'}\n` +
      `<b>To:</b> ${receiver_name ?? '—'}\n` +
      `<b>Type:</b> ${letter_type ?? 'love'}\n` +
      `<b>Email:</b> ${email}\n` +
      `<b>Amount:</b> ₱149\n` +
      `<b>Letter ID:</b> ${letter_id}\n\n` +
      `Tap a button below to approve or reject. Approving will email the letter to the customer automatically.`;

    const inlineKeyboard = {
      inline_keyboard: [[
        { text: '✅ Approve & Send Letter', callback_data: `approve:${order_id}` },
        { text: '❌ Reject', callback_data: `reject:${order_id}` },
      ]],
    };

    // Send to PH payments bot with inline approval buttons
    const sent = await sendTelegramPhoto(
      PAY_BOT_TOKEN, PAY_CHAT_ID,
      proof_base64, proof_mime ?? 'image/jpeg',
      caption, inlineKeyboard,
    );

    if (sent?.message_id) {
      await supabase
        .from('ph_payment_orders')
        .update({ telegram_message_id: sent.message_id })
        .eq('order_id', order_id);
    }

    // Mirror to main notifications bot (no buttons there)
    await sendTelegramPhoto(
      BOT_TOKEN, CHAT_ID,
      proof_base64, proof_mime ?? 'image/jpeg',
      caption.replace('Tap a button below to approve or reject. Approving will email the letter to the customer automatically.', `Letter link: ${letter_url}`),
    );

    return new Response(JSON.stringify({ ok: true, order_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[submit-gcash-payment] error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
