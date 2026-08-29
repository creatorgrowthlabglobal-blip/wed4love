import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInviteEntitlement } from "@/hooks/useInviteEntitlement";

/**
 * Guards the invitation builder: the user must be signed in AND have an
 * active package before they can choose a template or create an invite.
 */
const PaidRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const { plan, loading } = useInviteEntitlement();

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "linear-gradient(175deg, hsl(42 60% 98%), hsl(38 45% 96%))" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(38 72% 44%)" }} />
        <p className="font-body text-sm text-muted-foreground">Checking your access…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!plan) return <Navigate to="/pricing" replace />;

  return <>{children}</>;
};

export default PaidRoute;
