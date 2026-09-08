import { motion } from "framer-motion";
import { Play, Volume2 } from "lucide-react";
import { useState, useRef } from "react";

interface VideoPlayerProps {
  videos: string[];
  audios: string[];
  onContinue: () => void;
}

const VideoPlayer = ({ videos, audios, onContinue }: VideoPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const hasVideo = videos.length > 0;
  const hasAudio = audios.length > 0;

  const handlePlay = () => {
    if (mediaRef.current) {
      mediaRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, hsl(350 60% 95%) 0%, hsl(340 50% 90%) 100%)" }}
    >
      <div className="w-full max-w-lg mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-xs uppercase tracking-widest mb-2"
          style={{ color: "hsl(340 50% 60%)" }}
        >
          A Special Message
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-2xl sm:text-3xl font-bold mb-8"
          style={{ color: "#4B2E2E" }}
        >
          {hasVideo ? "Watch This" : "Listen Closely"} ❤️
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="rounded-3xl overflow-hidden mb-8 relative"
          style={{
            background: "#1a0a10",
            boxShadow: "0 16px 48px rgba(200,80,120,0.2)",
          }}
        >
          {hasVideo ? (
            <>
              <video
                ref={(el) => { mediaRef.current = el; }}
                src={videos[0]}
                className="w-full aspect-video object-cover"
                controls={playing}
                onEnded={() => setPlaying(false)}
              />
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlay}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #e88fa5, #d4708a)",
                      boxShadow: "0 4px 24px rgba(200,80,120,0.4)",
                    }}
                  >
                    <Play className="w-7 h-7 text-white ml-1" />
                  </motion.button>
                </div>
              )}
            </>
          ) : hasAudio ? (
            <div className="p-10 flex flex-col items-center">
              <motion.div
                animate={playing ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, #e88fa5, #d4708a)" }}
              >
                <Volume2 className="w-10 h-10 text-white" />
              </motion.div>
              <audio
                ref={(el) => { mediaRef.current = el; }}
                src={audios[0]}
                controls={playing}
                onEnded={() => setPlaying(false)}
                className="w-full"
              />
              {!playing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlay}
                  className="mt-4 px-8 py-3 rounded-xl font-heading text-base font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #e88fa5, #d4708a)" }}
                >
                  Play Message
                </motion.button>
              )}
            </div>
          ) : null}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="px-10 py-3.5 rounded-xl font-heading text-base font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #e88fa5, #d4708a)", boxShadow: "0 4px 16px rgba(200,80,120,0.3)" }}
        >
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
