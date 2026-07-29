import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Heart, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FloatingHearts from "@/components/FloatingHearts";
import { supabase } from "@/integrations/supabase/client";
import { getSignedMediaUrl } from "@/lib/letterStorage";

const ReactionView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reactionUrls, setReactionUrls] = useState<string[] | null>(null);
  const [receiverName, setReceiverName] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    supabase
      .from("letters")
      .select("data")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const letterData = (data?.data as Record<string, unknown>) || {};
        setReceiverName(String(letterData.receiverName || ""));
      });

    supabase
      .from("letter_reactions")
      .select("video_url")
      .eq("letter_id", id)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (cancelled) return;
        if (!data?.length) {
          setReactionUrls([]);
          return;
        }
        const urls = await Promise.all(data.map((r) => getSignedMediaUrl(r.video_url)));
        if (!cancelled) setReactionUrls(urls.filter((u): u is string => !!u));
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen gradient-blush relative">
      <Header />
      <FloatingHearts count={8} />
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center min-h-screen">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto text-center w-full"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, delay: 0.15 }}
            className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Video className="w-9 h-9 text-primary" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {receiverName ? `${receiverName} left you a reaction` : "A reaction to your letter"} 🎥
            </h1>
            <p className="font-body text-base text-muted-foreground mb-8">
              Here's what they had to say
            </p>
          </motion.div>

          {reactionUrls === null && (
            <p className="font-body text-sm text-muted-foreground">Loading…</p>
          )}

          {reactionUrls?.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">
              No reaction found for this letter yet.
            </p>
          )}

          {reactionUrls && reactionUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="letter-paper rounded-3xl p-6"
            >
              <div className="grid grid-cols-1 gap-4">
                {reactionUrls.map((url, i) => (
                  <video
                    key={i}
                    src={url}
                    controls
                    playsInline
                    className="w-full aspect-[3/4] object-cover rounded-xl bg-black"
                  />
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-1.5 text-muted-foreground font-body text-sm mt-10"
          >
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-primary fill-primary" />
            <span>by</span>
            <span className="font-display text-base text-foreground font-semibold">Wish4Love</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ReactionView;
