import { supabase } from "@/integrations/supabase/client";

/**
 * Fire-and-forget activity ping to the Telegram bot.
 * Never throws — notifications must never break the user flow.
 */
export function notify(event: string, data: Record<string, unknown> = {}) {
  try {
    void supabase.functions
      .invoke("telegram-notify", { body: { event, data } })
      .catch(() => {});
  } catch {
    /* ignore */
  }
}
