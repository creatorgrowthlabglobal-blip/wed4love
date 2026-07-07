import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, Check, Instagram } from "lucide-react";
import { MUSIC_PRESETS } from "@/lib/musicPresets";

interface MusicSelectionProps {
  selectedMusic: string | null;
  onSelectMusic: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const MusicSelection = ({
  selectedMusic,
  onSelectMusic,
  onNext, onBack,
}: MusicSelectionProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePreview = (id: string, url: string) => {
    if (previewing === id) {
      audioRef.current?.pause();
      setPreviewing(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
    audio.onended = () => setPreviewing(null);
    audioRef.current = audio;
    setPreviewing(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <p className="font-display text-xl text-primary mb-1">Set the perfect mood</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Choose Your Melody
        </h2>
        <p className="font-body text-base text-muted-foreground">
          Pick a song from our curated collection
        </p>
      </div>

      {/* Preset songs */}
      <div className="letter-paper rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-elegant-gold" />
          <span className="font-heading text-base font-semibold">Curated songs</span>
        </div>
        <div className="space-y-2">
          {MUSIC_PRESETS.map((m) => {
            const isSelected = selectedMusic === m.id;
            const isPlaying = previewing === m.id;
            return (
              <div
                key={m.id}
                onClick={() => onSelectMusic(m.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary/10 border-primary/40"
                    : "bg-background/50 border-border/40 hover:border-primary/30"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); togglePreview(m.id, m.url); }}
                  className="w-10 h-10 rounded-full bg-primary/15 hover:bg-primary/25 flex items-center justify-center flex-shrink-0 transition-colors"
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm font-semibold text-foreground truncate">{m.title}</p>
                  <p className="font-body text-xs text-muted-foreground truncate">{m.artist}</p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? "bg-primary border-2 border-primary" : "bg-transparent border-2 border-primary/40"
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Request a Music */}
      <a
        href="https://instagram.com/wish4love_official"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Instagram className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold text-foreground">Request a Custom Song</p>
          <p className="font-body text-xs text-muted-foreground">
            Don't see your song? DM us on Instagram and we'll add it for you.
          </p>
        </div>
        <span className="font-body text-xs font-semibold text-primary group-hover:underline notranslate shrink-0" translate="no">
          @wish4love_official
        </span>
      </a>

      <div className="mt-6 flex justify-between">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          className="px-8 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
          ← Go Back
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
          className="btn-glow px-8 py-3.5 bg-primary text-primary-foreground font-heading text-base font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow">
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MusicSelection;
