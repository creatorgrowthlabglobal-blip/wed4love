const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const CHAT_ID   = Deno.env.get('TELEGRAM_CHAT_ID');
const PAY_BOT_TOKEN = Deno.env.get('TELEGRAM_PAYMENTS_BOT_TOKEN');
const PAY_CHAT_ID   = Deno.env.get('TELEGRAM_PAYMENTS_CHAT_ID');

async function sendTelegramPhoto(
  token: string | undefined,
  chatId: string | undefined,
  photoBase64: string,
  mime: string,
  caption: string,
) {
  if (!token || !chatId) {
    console.warn('[submit-gcash-payment] Telegram not configured');
    return;
  }

  const binaryStr = atob(photoBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');
  form.append('photo', new Blob([bytes], { type: mime }), 'proof.jpg');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[submit-gcash-payment] sendPhoto failed', res.status, err);
  }
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

    const caption =
      `🇵🇭 <b>GCash Payment Proof</b>\n` +
      `<b>From:</b> ${sender_name}\n` +
      `<b>To:</b> ${receiver_name}\n` +
      `<b>Type:</b> ${letter_type ?? 'love'}\n` +
      `<b>Email:</b> ${email}\n` +
      `<b>Amount:</b> ₱149\n` +
      `<b>Letter ID:</b> ${letter_id}\n\n` +
      `✅ Verify proof → send the link below to <b>${email}</b>`;

    const letterLink =
      `💌 <b>Letter link to send:</b>\n${letter_url}`;

    // Send to main bot (existing — all notifications)
    await sendTelegramPhoto(BOT_TOKEN, CHAT_ID, proof_base64, proof_mime ?? 'image/jpeg', caption);
    await sendTelegramMessage(BOT_TOKEN, CHAT_ID, letterLink);

    // Send to payments-only bot (new — payments only)
    await sendTelegramPhoto(PAY_BOT_TOKEN, PAY_CHAT_ID, proof_base64, proof_mime ?? 'image/jpeg', caption);
    await sendTelegramMessage(PAY_BOT_TOKEN, PAY_CHAT_ID, letterLink);

    return new Response(JSON.stringify({ ok: true }), {
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
