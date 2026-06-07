import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Triggered every minute by pg_cron. Finds due scheduled_calls and places them.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('WISH4LOVE_CALL_API_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!apiKey || !supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing env' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const admin = createClient(supabaseUrl, serviceKey);

  const nowIso = new Date().toISOString();

  // Atomically claim due rows.
  const { data: due, error: selErr } = await admin
    .from('scheduled_calls')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })
    .limit(25);

  if (selErr) {
    console.error('select due error', selErr);
    return new Response(JSON.stringify({ error: selErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: Array<{ id: string; status: string; call_id?: string; error?: string }> = [];

  for (const row of due ?? []) {
    // claim
    const { data: claimed } = await admin
      .from('scheduled_calls')
      .update({ status: 'processing', attempts: (row.attempts ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();
    if (!claimed) continue;

    try {
      const form = new FormData();
      form.append('number', row.phone);
      if (row.mode === 'voice' && row.audio_base64) {
        const bin = Uint8Array.from(atob(row.audio_base64), (c) => c.charCodeAt(0));
        const blob = new Blob([bin], { type: row.audio_mime || 'audio/webm' });
        form.append('audio', blob, 'message.webm');
      } else {
        form.append('text', String(row.text_message ?? '').slice(0, 500));
        if (row.voice) form.append('voice', row.voice);
      }

      const upstream = await fetch('https://api.wish4love.com/call', {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
        body: form,
      });
      const respText = await upstream.text();
      let parsed: { call_id?: string; error?: string } = {};
      try { parsed = JSON.parse(respText); } catch { /* ignore */ }

      if (!upstream.ok) {
        await admin
          .from('scheduled_calls')
          .update({ status: 'error', last_error: respText.slice(0, 500), updated_at: new Date().toISOString() })
          .eq('id', row.id);
        results.push({ id: row.id, status: 'error', error: respText.slice(0, 200) });
        continue;
      }

      await admin
        .from('scheduled_calls')
        .update({
          status: 'completed',
          call_id: parsed.call_id ?? null,
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      // Deduct one paid call credit now that the call actually went out.
      // Scheduled calls deliberately do NOT deduct at scheduling time, so the
      // user isn't charged for calls that never dispatch.
      if (row.user_email) {
        const { data: consumed, error: consumeErr } = await admin.rpc(
          'consume_call_credit',
          { _email: row.user_email },
        );
        if (consumeErr) {
          console.error('consume_call_credit error', row.id, consumeErr);
        } else if (!consumed) {
          console.warn('scheduled call dispatched without available credit', row.id, row.user_email);
        }
      } else {
        console.warn('scheduled call dispatched without user_email — credit not deducted', row.id);
      }

      results.push({ id: row.id, status: 'completed', call_id: parsed.call_id });
    } catch (err) {
      await admin
        .from('scheduled_calls')
        .update({ status: 'error', last_error: (err as Error).message, updated_at: new Date().toISOString() })
        .eq('id', row.id);
      results.push({ id: row.id, status: 'error', error: (err as Error).message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
