import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

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
    const { number, text, audioBase64, audioMime, audioName, lang, voice, max_duration } = payload ?? {};

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
