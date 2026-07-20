import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, Check, Youtube, X, Search, Loader2 } from "lucide-react";
import { MUSIC_PRESETS } from "@/lib/musicPresets";
import { searchYouTubeMusic, YouTubeSearchResult } from "@/lib/youtube";
import { useYouTubeAudio } from "@/hooks/useYouTubeAudio";

interface MusicSelectionProps {
  selectedMusic: string | null;
  onSelectMusic: (id: string) => void;
  youtubeVideoId: string | null;
  onYoutubeVideoIdChange: (id: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const MusicSelection = ({
  selectedMusic,
  onSelectMusic,
  youtubeVideoId,
  onYoutubeVideoIdChange,
  onNext, onBack,
}: MusicSelectionProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [ytPreviewing, setYtPreviewing] = useState(false);
  const ytPreview = useYouTubeAudio(youtubeVideoId, 0.4);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      ytPreview.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePreview = (id: string, url: string) => {
    ytPreview.pause();
    setYtPreviewing(false);
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

  const selectPreset = (id: string) => {
    audioRef.current?.pause();
    ytPreview.pause();
    setPreviewing(null);
    setYtPreviewing(false);
    onYoutubeVideoIdChange(null);
    onSelectMusic(id);
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    try {
      const results = await searchYouTubeMusic(q);
      setSearchResults(results);
      if (results.length === 0) setSearchError("No results — try a different search.");
    } catch {
      setSearchError("Search isn't working right now. Please try again in a moment.");
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const selectSearchResult = (result: YouTubeSearchResult) => {
    onYoutubeVideoIdChange(result.videoId);
    setSearchResults([]);
    setSearchQuery("");
    setSearched(false);
  };

  const toggleYtPreview = () => {
    audioRef.current?.pause();
    setPreviewing(null);
    if (ytPreviewing) {
      ytPreview.pause();
      setYtPreviewing(false);
    } else {
      ytPreview.play();
      setYtPreviewing(true);
    }
  };

  const clearYoutube = () => {
    ytPreview.pause();
    setYtPreviewing(false);
    onYoutubeVideoIdChange(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearched(false);
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
          Search for any song, or pick one of our curated picks
        </p>
      </div>

      {/* Search for a song */}
      <div className="letter-paper rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Youtube className="w-5 h-5 text-elegant-gold" />
          <span className="font-heading text-base font-semibold">Search for a Song</span>
        </div>

        {youtubeVideoId ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-primary/10 border-primary/40">
            <button
              type="button"
              onClick={toggleYtPreview}
              className="w-10 h-10 rounded-full bg-primary/15 hover:bg-primary/25 flex items-center justify-center flex-shrink-0 transition-colors"
              aria-label={ytPreviewing ? "Pause preview" : "Play preview"}
            >
              {ytPreviewing ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-sm font-semibold text-foreground truncate">Custom song selected</p>
              <p className="font-body text-xs text-muted-foreground truncate">This will play instead of a curated song</p>
            </div>
            <button
              type="button"
              onClick={clearYoutube}
              className="w-8 h-8 rounded-full bg-secondary/70 hover:bg-secondary flex items-center justify-center flex-shrink-0 text-foreground/60"
              aria-label="Remove custom song"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                placeholder="Search for a song or artist..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground font-body text-sm outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-body text-sm font-semibold hover:bg-primary/20 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>

            {searchError && (
              <p className="font-body text-xs text-destructive mt-2">{searchError}</p>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-1.5 mt-3 max-h-72 overflow-y-auto pr-1">
                {searchResults.map((r) => (
                  <button
                    key={r.videoId}
                    type="button"
                    onClick={() => selectSearchResult(r)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl border border-border/40 bg-background/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                  >
                    {r.thumbnail ? (
                      <img src={r.thumbnail} alt="" className="w-14 h-10 rounded-md object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-primary/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-semibold text-foreground truncate">{r.title}</p>
                      <p className="font-body text-xs text-muted-foreground truncate">{r.channelTitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searched && !searching && searchResults.length === 0 && !searchError && (
              <p className="font-body text-xs text-muted-foreground mt-2">
                No results — try a different search.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Preset songs */}
      <div className="letter-paper rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-elegant-gold" />
          <span className="font-heading text-base font-semibold">Curated songs</span>
        </div>
        <div className="space-y-2">
          {MUSIC_PRESETS.map((m) => {
            const isSelected = !youtubeVideoId && selectedMusic === m.id;
            const isPlaying = previewing === m.id;
            return (
              <div
                key={m.id}
                onClick={() => selectPreset(m.id)}
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
