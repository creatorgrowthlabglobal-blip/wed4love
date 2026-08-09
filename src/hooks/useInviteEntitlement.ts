import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type InvitePlan = "starter" | "premium" | "custom" | null;

const TIER: Record<string, number> = { starter: 1, premium: 2, custom: 3 };

/** Returns true if the user's purchased plan grants access to the requested plan level. */
export function hasInviteAccess(userPlan: InvitePlan, requestedPlan: string): boolean {
  return (TIER[userPlan ?? ""] ?? 0) >= (TIER[requestedPlan] ?? 0);
}

interface EntitlementState {
  plan: InvitePlan;
  /** True while the initial fetch (or polling) is in progress. */
  loading: boolean;
  /** True if the fetch itself failed (network/server error). */
  error: boolean;
  /** True when poll=true and the max wait time has elapsed without a granted plan. */
  timeout: boolean;
}

const POLL_INTERVAL_MS = 2500;
const POLL_MAX_ATTEMPTS = 18; // 18 × 2.5 s = 45 s

/**
 * Fetches the signed-in user's invite entitlement from Supabase.
 *
 * When `poll=true` the hook retries every 2.5 s until `invite_plan` is set
 * (covers the race where Whop's webhook fires after the post-payment redirect).
 */
export function useInviteEntitlement(poll = false): EntitlementState {
  const { user } = useAuth();
  const [state, setState] = useState<EntitlementState>({
    plan: null,
    loading: true,
    error: false,
    timeout: false,
  });
  const attemptsRef = useRef(0);
  const resolvedRef = useRef(false);

  const fetchPlan = useCallback(async (): Promise<InvitePlan> => {
    if (!user?.email) return null;
    try {
      const { data, error } = await supabase.functions.invoke("get-entitlement", {
        body: { email: user.email },
      });
      if (error) throw error;
      return (data?.entitlement?.invite_plan as InvitePlan) ?? null;
    } catch {
      return null;
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user) {
      setState({ plan: null, loading: false, error: false, timeout: false });
      return;
    }

    attemptsRef.current = 0;
    resolvedRef.current = false;

    if (!poll) {
      fetchPlan()
        .then(plan => setState({ plan, loading: false, error: false, timeout: false }))
        .catch(() => setState({ plan: null, loading: false, error: true, timeout: false }));
      return;
    }

    // Polling mode: keep checking until plan is granted or timeout reached
    const tick = async () => {
      if (resolvedRef.current) return;
      const plan = await fetchPlan();
      attemptsRef.current += 1;

      if (plan) {
        resolvedRef.current = true;
        setState({ plan, loading: false, error: false, timeout: false });
      } else if (attemptsRef.current >= POLL_MAX_ATTEMPTS) {
        resolvedRef.current = true;
        setState({ plan: null, loading: false, error: false, timeout: true });
      }
    };

    // First check immediately, then on interval
    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user, poll, fetchPlan]);

  return state;
}
