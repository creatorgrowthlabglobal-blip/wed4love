import { motion } from "framer-motion";
import { Music, Upload, X } from "lucide-react";

interface MusicSelectionProps {
  selectedMusic: string | null;
  customMusic: File | null;
  onSelectMusic: (id: string) => void;
  onCustomMusic: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const MusicSelection = ({
  customMusic,
  onSelectMusic, onCustomMusic,
  onNext, onBack,
}: MusicSelectionProps) => {
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
          Upload Your Melody
        </h2>
        <p className="font-body text-base text-muted-foreground">
          Upload a song that's special to both of you
        </p>
      </div>

      {/* Custom upload */}
      <div className="letter-paper rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-elegant-gold" />
          <span className="font-heading text-base font-semibold">Upload your special song</span>
        </div>

        {customMusic ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-semibold text-foreground truncate">{customMusic.name}</p>
              <p className="font-body text-xs text-muted-foreground">
                {(customMusic.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={() => { onCustomMusic(null); onSelectMusic(""); }}
              className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-400">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="w-8 h-8 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="font-heading text-base font-semibold text-foreground mb-1">Click to upload your song</p>
              <p className="font-body text-sm text-muted-foreground">MP3, WAV, OGG supported</p>
            </div>
            <input type="file" accept="audio/*" className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) { onCustomMusic(e.target.files[0]); onSelectMusic("custom"); } }} />
          </label>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          className="px-6 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
          ← Go Back
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
          className="btn-glow px-10 py-3.5 bg-primary text-primary-foreground font-heading text-base font-semibold rounded-xl shadow-romantic transition-all duration-400 hover:shadow-glow">
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MusicSelection;
