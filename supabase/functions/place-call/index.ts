import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('WISH4LOVE_CALL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Call API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();
    const {
      number,
      text,
      audioBase64,
      audioMime,
      audioName,
      lang,
      voice,
      max_duration,
      // scheduling fields
      scheduledAt, // ISO string in the future
      recipientName,
      occasion,
      userEmail,
    } = payload ?? {};

    if (!number || typeof number !== 'string') {
      return new Response(JSON.stringify({ error: 'number is required (E.164)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!text && !audioBase64) {
      return new Response(JSON.stringify({ error: 'Either text or audioBase64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Scheduled (future) path: persist and let cron pick it up ---
    if (scheduledAt) {
      const when = new Date(scheduledAt);
      if (isNaN(when.getTime())) {
        return new Response(JSON.stringify({ error: 'Invalid scheduledAt' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // If user picked a moment more than 60s in the future, store it.
      if (when.getTime() - Date.now() > 60 * 1000) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const admin = createClient(supabaseUrl, serviceKey);

        const { data, error } = await admin
          .from('scheduled_calls')
          .insert({
            user_email: userEmail ?? null,
            recipient_name: recipientName ?? 'Recipient',
            phone: number,
            occasion: occasion ?? null,
            scheduled_at: when.toISOString(),
            mode: audioBase64 ? 'voice' : 'tts',
            text_message: audioBase64 ? null : String(text),
            voice: audioBase64 ? null : (voice ?? null),
            audio_base64: audioBase64 ?? null,
            audio_mime: audioMime ?? null,
          })
          .select('id, scheduled_at')
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ scheduled: true, id: data.id, scheduled_at: data.scheduled_at }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // --- Immediate call path ---
    const form = new FormData();
    form.append('number', number);
    if (max_duration) form.append('max_duration', String(max_duration));

    if (audioBase64) {
      const bin = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bin], { type: audioMime || 'audio/webm' });
      form.append('audio', blob, audioName || 'message.webm');
    } else {
      form.append('text', String(text).slice(0, 500));
      if (lang) form.append('lang', lang);
      if (voice) form.append('voice', voice);
    }

    const upstream = await fetch('https://api.wish4love.com/call', {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
      body: form,
    });

    const responseText = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(responseText); } catch { data = { raw: responseText }; }

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('place-call error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
