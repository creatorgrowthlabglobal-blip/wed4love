import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PlusCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loadDraftLocal, listPublishedLocal } from "@/lib/inviteStorage";
import type { StoredInvite } from "@/lib/inviteStorage";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";
import goldenHourThumbnail   from "@/assets/golden-hour-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import softLoveThumbnail     from "@/assets/soft-love-thumbnail.jpg";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";
const BG        = "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))";

const TEMPLATE_META: Record<string, { thumb: string; accent: string; label: string }> = {
  "golden-hour":   { thumb: goldenHourThumbnail,   accent: "hsl(32 90% 55%)",  label: "Golden Hour"   },
  "garden-rose":   { thumb: gardenRoseThumbnail,   accent: "hsl(340 65% 52%)", label: "Garden Rose"   },
  "rustic-bloom":  { thumb: rusticBloomThumbnail,  accent: "hsl(95 35% 48%)",  label: "Rustic Bloom"  },
  "midnight-luxe": { thumb: midnightLuxeThumbnail, accent: "hsl(45 72% 54%)",  label: "Midnight Luxe" },
  "soft-love":     { thumb: softLoveThumbnail,     accent: "hsl(355 58% 58%)", label: "Soft Love"     },
};

const STEP_LABELS = ["Couple", "Big Day", "Story", "Program", "Details", "Photos", "Music", "Preview"];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const InviteHistoryCard = ({ invite, isDraft }: { invite: StoredInvite; isDraft: boolean }) => {
  const meta = TEMPLATE_META[invite.template ?? ""] ?? TEMPLATE_META["garden-rose"];
  const progress = isDraft ? Math.round(((invite.currentStep ?? 1) / 8) * 100) : 100;
  const coupleName =
    invite.partner1 && invite.partner2
      ? `${invite.partner1} & ${invite.partner2}`
      : "Untitled Invitation";
  const stepLabel = isDraft && invite.currentStep ? STEP_LABELS[(invite.currentStep ?? 1) - 1] : null;

  return (
    <motion.div {...fade()} className="relative rounded-2xl overflow-hidden group" style={{ height: 260 }}>
      <img
        src={meta.thumb}
        alt={meta.label}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.88) 100%)" }}
      />

      {/* Status badge */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className="px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: isDraft ? "rgba(253 186 116 / 0.2)" : "rgba(74 222 128 / 0.2)",
            color: isDraft ? "hsl(38 100% 75%)" : "hsl(142 70% 75%)",
            border: isDraft ? "1px solid rgba(253 186 116 / 0.4)" : "1px solid rgba(74 222 128 / 0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          {isDraft ? `Draft · ${stepLabel}` : "Published"}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 z-10 p-4">
        <p className="font-display font-bold text-white text-base leading-tight mb-0.5">{coupleName}</p>
        <p className="font-body text-xs mb-2.5" style={{ color: "rgba(255,255,255,0.55)" }}>
          {meta.label}{invite.date ? ` · ${invite.date}` : ""}
        </p>

        {isDraft && (
          <div className="mb-3">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.18)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: meta.accent }}
              />
            </div>
            <p className="font-body text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
              {progress}% complete
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {isDraft ? (
            <Link
              to={`/create-invite?template=${invite.template ?? "garden-rose"}`}
              className="flex-1 py-2.5 rounded-xl font-body text-xs font-bold text-center text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: meta.accent, boxShadow: `0 4px 14px ${meta.accent}55` }}
            >
              Resume →
            </Link>
          ) : (
            <>
              <Link
                to={`/invite/${invite.id}`}
                target="_blank"
                className="flex-1 py-2.5 rounded-xl font-body text-xs font-bold text-center text-white transition-all hover:opacity-90"
                style={{ background: meta.accent }}
              >
                View Invite
              </Link>
              <Link
                to={`/dashboard/${invite.id}`}
                className="flex-1 py-2.5 rounded-xl font-body text-xs font-semibold text-center transition-all hover:opacity-80"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(6px)",
                }}
              >
                Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MyInvitations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<StoredInvite | null>(null);
  const [published, setPublished] = useState<StoredInvite[]>([]);

  useEffect(() => {
    if (!user) return;
    setDraft(loadDraftLocal(user.id));
    setPublished(listPublishedLocal());
  }, [user]);

  const total = (draft ? 1 : 0) + published.length;

  return (
    <div className="min-h-screen px-4 py-16 sm:py-20" style={{ background: BG }}>
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div {...fade()} className="text-center mb-10 pt-8 sm:pt-12">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: GOLD_GRAD, boxShadow: "0 6px 20px hsl(38 80% 55% / 0.3)" }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-2" style={{ color: GOLD }}>
            Your account
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            My Invitations
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {!user
              ? "Sign in to see your invitations."
              : total === 0
              ? "You haven't created any invitations yet."
              : draft
              ? "You have an unfinished draft — pick up where you left off."
              : `${published.length} published invitation${published.length !== 1 ? "s" : ""}.`}
          </p>
        </motion.div>

        {/* Empty state */}
        {(!user || total === 0) && (
          <motion.div {...fade(0.1)} className="text-center">
            <Link
              to="/choose-template"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-body text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{ background: GOLD_GRAD, boxShadow: "0 6px 24px hsl(38 80% 55% / 0.28)" }}
            >
              <PlusCircle className="w-4 h-4" /> Create Your First Invitation
            </Link>
          </motion.div>
        )}

        {/* Cards */}
        {total > 0 && (
          <>
            <div
              className={`grid gap-4 ${
                total === 1
                  ? "grid-cols-1 max-w-sm mx-auto"
                  : total === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {draft && <InviteHistoryCard invite={draft} isDraft={true} />}
              {published.map(inv => (
                <InviteHistoryCard key={inv.id} invite={inv} isDraft={false} />
              ))}
            </div>

            <motion.div {...fade(0.2)} className="text-center mt-8">
              <Link
                to="/choose-template"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-body text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.97]"
                style={{ background: "white", color: GOLD, border: `2px solid ${GOLD}` }}
              >
                <PlusCircle className="w-4 h-4" /> Create Another
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyInvitations;
