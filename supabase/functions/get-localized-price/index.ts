// Returns a display-only currency estimate for the caller's location.
// The actual Whop charge always stays in USD -- there's no multi-currency
// param in that integration, and reconfiguring it is a Whop-dashboard job,
// not something this function can do. This just powers a "≈€4.60" estimate
// shown next to the real USD price.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CAD: 'CA$', AUD: 'A$',
  PHP: '₱', BRL: 'R$', MXN: 'MX$', KRW: '₩', CNY: '¥', CHF: 'CHF', SEK: 'kr',
  NOK: 'kr', DKK: 'kr', NZD: 'NZ$', SGD: 'S$', ZAR: 'R', AED: 'د.إ',
};

const FALLBACK = { currency: 'USD', symbol: '$', rate: 1 };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    if (!ip) {
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ip-api.com's free tier is HTTP-only (no TLS) but has no separate signup
    // step and returns currency directly in one call — fine for a
    // display-only estimate with a hard USD fallback on any failure.
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,currency`, {
      signal: AbortSignal.timeout(2500),
    }).catch(() => null);
    const geoData = geoRes?.ok ? await geoRes.json().catch(() => null) : null;
    const currency = geoData?.status === 'success' ? String(geoData.currency || '').trim() : '';

    if (!currency || currency === 'USD' || currency.length !== 3 || !/^[A-Z]+$/.test(currency)) {
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rateRes = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${currency}`, {
      signal: AbortSignal.timeout(2500),
    }).catch(() => null);
    if (!rateRes?.ok) {
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const rateData = await rateRes.json();
    const rate = rateData?.rates?.[currency];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      return new Response(JSON.stringify(FALLBACK), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ currency, symbol: CURRENCY_SYMBOLS[currency] || currency, rate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('[get-localized-price] error', e);
    return new Response(JSON.stringify(FALLBACK), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
