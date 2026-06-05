import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'
const TO_EMAIL = 'engineer1@wish4love.com'

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

interface ContactBody {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')

    const body = (await req.json()) as ContactBody
    const name = (body.name || '').toString().trim().slice(0, 100)
    const email = (body.email || '').toString().trim().slice(0, 255)
    const subject = (body.subject || '').toString().trim().slice(0, 200)
    const message = (body.message || '').toString().trim().slice(0, 5000)

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#fff8f5;border-radius:12px;">
        <h2 style="color:#c9627a;margin:0 0 16px;">💌 New Wish4Love Contact Message</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
          <tr><td style="padding:6px 0;font-weight:bold;width:90px;">From:</td><td>${esc(name)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Email:</td><td><a href="mailto:${esc(email)}" style="color:#c9627a;">${esc(email)}</a></td></tr>
          <tr><td style="padding:6px 0;font-weight:bold;">Subject:</td><td>${esc(subject)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #f3d9e1;margin:20px 0;" />
        <div style="font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${esc(message)}</div>
        <p style="font-size:12px;color:#999;margin-top:24px;">Sent from wish4love.com contact form</p>
      </div>
    `

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Wish4Love Contact <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[Wish4Love] ${subject}`,
        html,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('Resend error', res.status, data)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', status: res.status, details: data }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('send-contact-message error', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
